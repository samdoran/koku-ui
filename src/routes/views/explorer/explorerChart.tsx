import { Skeleton, Title } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { getQuery, parseQuery } from 'api/queries/query';
import type { Report } from 'api/reports/report';
import type { AxiosError } from 'axios';
import { format } from 'date-fns';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import type { ChartDatum } from 'routes/views/components/charts/common/chartDatum';
import {
  ComputedReportItemType,
  ComputedReportItemValueType,
  isFloat,
  isInt,
} from 'routes/views/components/charts/common/chartDatum';
import { CostExplorerChart } from 'routes/views/components/charts/costExplorerChart';
import { getDateRangeFromQuery } from 'routes/views/utils/dateRange';
import { getGroupByOrgValue, getGroupByTagKey } from 'routes/views/utils/groupBy';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { reportActions, reportSelectors } from 'store/reports';
import { getIdKeyForGroupBy } from 'utils/computedReport/getComputedExplorerReportItems';
import type { ComputedReportItem } from 'utils/computedReport/getComputedReportItems';
import { getUnsortedComputedReportItems } from 'utils/computedReport/getComputedReportItems';
import type { CostTypes } from 'utils/costType';
import { formatUnits } from 'utils/format';
import type { RouterComponentProps } from 'utils/router';
import { withRouter } from 'utils/router';
import { skeletonWidth } from 'utils/skeleton';

import { chartStyles, styles } from './explorerChart.styles';
import type { PerspectiveType } from './explorerUtils';
import { baseQuery, getGroupByDefault, getReportPathsType, getReportType } from './explorerUtils';

interface ExplorerChartOwnProps extends RouterComponentProps, WrappedComponentProps {
  costType?: CostTypes;
  currency?: string;
  computedReportItemType?: ComputedReportItemType;
  computedReportItemValueType?: ComputedReportItemValueType;
  perspective: PerspectiveType;
}

interface ExplorerChartStateProps {
  end_date?: string;
  perspective: PerspectiveType;
  query: Query;
  report: Report;
  reportError: AxiosError;
  reportFetchStatus: FetchStatus;
  reportQueryString: string;
  start_date?: string;
}

interface ExplorerChartDispatchProps {
  fetchReport: typeof reportActions.fetchReport;
}

interface ExplorerChartState {
  // TBD...
}

type ExplorerChartProps = ExplorerChartStateProps & ExplorerChartOwnProps & ExplorerChartDispatchProps;

class ExplorerChartBase extends React.Component<ExplorerChartProps> {
  protected defaultState: ExplorerChartState = {};
  public state: ExplorerChartState = { ...this.defaultState };

  constructor(stateProps, dispatchProps) {
    super(stateProps, dispatchProps);
  }

  public componentDidMount() {
    this.fetchReport();
  }

  public componentDidUpdate(prevProps: ExplorerChartProps) {
    const { report, reportError, reportQueryString } = this.props;

    const newQuery = prevProps.reportQueryString !== reportQueryString;
    const noReport = !report && !reportError;

    if (newQuery || noReport) {
      this.fetchReport();
    }
  }

  private createReportDatum = (
    value: number,
    computedItem: ComputedReportItem,
    reportItem: string = 'cost',
    reportItemValue: string = 'total'
  ): ChartDatum => {
    const { intl } = this.props;

    const computedItemDate = new Date(computedItem.date + 'T00:00:00');
    const xVal = intl.formatDate(computedItemDate, {
      day: 'numeric',
      month: 'short',
    });
    const yVal = isFloat(value) ? parseFloat(value.toFixed(2)) : isInt(value) ? value : 0;
    return {
      x: xVal,
      y: value === null ? null : yVal, // For displaying "no data" labels in chart tooltips
      ...(value === null && { _y: 0 }), // Force "no data" tooltips. See https://issues.redhat.com/browse/COST-1765
      date: computedItem.date,
      key: computedItem.id,
      name: computedItem.label ? computedItem.label : computedItem.id, // legend item label
      units: computedItem[reportItem]
        ? computedItem[reportItem][reportItemValue]
          ? computedItem[reportItem][reportItemValue].units // cost, infrastructure, supplementary
          : computedItem[reportItem].units // capacity, limit, request, usage
        : undefined,
    };
  };

  private fetchReport = () => {
    const { fetchReport, perspective, reportQueryString } = this.props;

    if (perspective) {
      const reportPathsType = getReportPathsType(perspective);
      const reportType = getReportType(perspective);

      fetchReport(reportPathsType, reportType, reportQueryString);
    }
  };

  private getChartDatums = (computedItems: ComputedReportItem[]) => {
    const {
      computedReportItemType = ComputedReportItemType.cost,
      computedReportItemValueType = ComputedReportItemValueType.total,
    } = this.props;

    const reportItem = computedReportItemType;
    const reportItemValue = computedReportItemValueType;
    const chartDatums = [];

    computedItems.map(computedItem => {
      const datums = [];

      if (computedItem instanceof Map) {
        const items = Array.from(computedItem.values());
        items.map(i => {
          const val = i[reportItem][reportItemValue] ? i[reportItem][reportItemValue].value : i[reportItem].value;
          datums.push(this.createReportDatum(val, i, reportItem, reportItemValue));
        });
      }
      chartDatums.push(datums);
    });
    return this.padChartDatums(chartDatums);
  };

  private getComputedItems = () => {
    const { report } = this.props;

    return getUnsortedComputedReportItems({
      report,
      idKey: this.getGroupBy(),
      isDateMap: true,
    });
  };

  private getGroupBy = () => {
    const { query } = this.props;

    const groupById = getIdKeyForGroupBy(query.group_by);
    const groupByOrg = getGroupByOrgValue(query);
    const groupByTagKey = getGroupByTagKey(query);

    return groupByTagKey ? groupByTagKey : groupByOrg ? 'org_entities' : groupById;
  };

  private getSkeleton = () => {
    return (
      <>
        <Skeleton style={styles.chartSkeleton} width={skeletonWidth.md} />
        <Skeleton style={styles.legendSkeleton} width={skeletonWidth.xs} />
      </>
    );
  };

  // This pads chart datums with null datum objects, representing missing data at the beginning and end of the
  // data series. The remaining data is left as is to allow for extrapolation. This allows us to display a "no data"
  // message in the tooltip, which helps distinguish between zero values and when there is no data available.
  private padChartDatums = (items: any[]): ChartDatum[] => {
    const { end_date, start_date } = this.props;
    const result = [];

    items.map(datums => {
      const key = datums[0].key;
      const label = datums[0].name;
      const newItems = [];

      for (
        let padDate = new Date(start_date + 'T00:00:00');
        padDate <= new Date(end_date + 'T00:00:00');
        padDate.setDate(padDate.getDate() + 1)
      ) {
        const id = format(padDate, 'yyyy-MM-dd');
        const chartDatum = datums.find(val => val.date === id);
        if (chartDatum) {
          newItems.push(chartDatum);
        } else {
          const date = format(padDate, 'yyyy-MM-dd');
          newItems.push(this.createReportDatum(null, { date, id: key, label }, 'cost', null));
        }
      }
      result.push(newItems);
    });
    return result;
  };

  public render() {
    const { perspective, reportFetchStatus, intl } = this.props;

    const datums = this.getChartDatums(this.getComputedItems());

    // Todo: get title from perspective menu
    return (
      <>
        <div style={styles.titleContainer}>
          <Title headingLevel="h3" size="md">
            {intl.formatMessage(messages.explorerChartTitle, { value: perspective })}
          </Title>
        </div>
        <div style={styles.chartContainer}>
          <div style={styles.costChart}>
            {reportFetchStatus === FetchStatus.inProgress ? (
              this.getSkeleton()
            ) : (
              <CostExplorerChart
                adjustContainerHeight
                containerHeight={chartStyles.chartContainerHeight}
                formatOptions={{}}
                formatter={formatUnits}
                height={chartStyles.chartHeight}
                top1stData={datums.length > 0 ? datums[0] : []}
                top2ndData={datums.length > 1 ? datums[1] : []}
                top3rdData={datums.length > 2 ? datums[2] : []}
                top4thData={datums.length > 3 ? datums[3] : []}
                top5thData={datums.length > 4 ? datums[4] : []}
                top6thData={datums.length > 5 ? datums[5] : []}
              />
            )}
          </div>
        </div>
      </>
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = createMapStateToProps<ExplorerChartOwnProps, ExplorerChartStateProps>(
  (state, { costType, currency, perspective, router }) => {
    const queryFromRoute = parseQuery<Query>(router.location.search);
    const { end_date, start_date } = getDateRangeFromQuery(queryFromRoute);

    // Ensure group_by key is not undefined
    let groupBy = queryFromRoute.group_by;
    if (!groupBy && perspective) {
      groupBy = { [getGroupByDefault(perspective)]: '*' };
    }

    const query = {
      filter: {
        ...baseQuery.filter,
        ...queryFromRoute.filter,
        limit: 5,
        offset: undefined,
      },
      filter_by: queryFromRoute.filter_by || baseQuery.filter_by,
      exclude: queryFromRoute.exclude || baseQuery.exclude,
      group_by: groupBy,
      cost_type: costType,
      currency,
      start_date,
      end_date,
    };

    const reportPathsType = getReportPathsType(perspective);
    const reportType = getReportType(perspective);

    const reportQueryString = getQuery(query);
    const report = reportSelectors.selectReport(state, reportPathsType, reportType, reportQueryString);
    const reportError = reportSelectors.selectReportError(state, reportPathsType, reportType, reportQueryString);
    const reportFetchStatus = reportSelectors.selectReportFetchStatus(
      state,
      reportPathsType,
      reportType,
      reportQueryString
    );

    return {
      end_date,
      perspective,
      query,
      report,
      reportError,
      reportFetchStatus,
      reportQueryString,
      start_date,
    };
  }
);

const mapDispatchToProps: ExplorerChartDispatchProps = {
  fetchReport: reportActions.fetchReport,
};

const ExplorerChartConnect = connect(mapStateToProps, mapDispatchToProps)(ExplorerChartBase);
const ExplorerChart = injectIntl(withRouter(ExplorerChartConnect));

export { ExplorerChart };
export type { ExplorerChartProps };
