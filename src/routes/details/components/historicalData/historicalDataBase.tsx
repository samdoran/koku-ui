import { Card, CardBody, CardTitle, Grid, GridItem, Title, TitleSizes } from '@patternfly/react-core';
import { ReportPathsType, ReportType } from 'api/reports/report';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import type { HistoricalDataWidget } from 'store/breakdown/historicalData/common/historicalDataCommon';
import { HistoricalDataWidgetType } from 'store/breakdown/historicalData/common/historicalDataCommon';

import { HistoricalDataCostChart } from './historicalDataCostChart';
import { HistoricalDataNetworkChart } from './historicalDataNetworkChart';
import { HistoricalDataTrendChart } from './historicalDataTrendChart';
import { HistoricalDataUsageChart } from './historicalDataUsageChart';
import { HistoricalDataVolumeChart } from './historicalDataVolumeChart';

interface HistoricalDataOwnProps {
  costDistribution?: string;
  costType?: string;
  currency?: string;
  groupBy?: string;
}

export interface HistoricalDataStateProps {
  isOcpCloudNetworkingToggleEnabled?: boolean;
  isOcpProjectStorageToggleEnabled?: boolean;
  selectWidgets?: Record<number, any>;
  widgets: number[];
}

type HistoricalDataProps = HistoricalDataOwnProps & HistoricalDataStateProps & WrappedComponentProps;

class HistoricalDatasBase extends React.Component<HistoricalDataProps, any> {
  private getTitleKey = (reportPathsType, reportType) => {
    if (reportPathsType === ReportPathsType.ocp) {
      return reportType === ReportType.volume ? 'storage' : reportType;
    } else if (reportPathsType === ReportPathsType.azure) {
      return reportType === ReportType.instanceType ? 'virtual_machine' : reportType;
    }
    return reportType === ReportType.instanceType ? 'instance_type' : reportType;
  };

  // Returns cost chart
  private getCostChart = (widget: HistoricalDataWidget) => {
    const { costDistribution, costType, currency, intl } = this.props;

    return (
      <Card>
        <CardTitle>
          <Title headingLevel="h2" size={TitleSizes.lg}>
            {intl.formatMessage(messages.historicalChartTitle, {
              value: this.getTitleKey(widget.reportPathsType, widget.reportType),
            })}
          </Title>
        </CardTitle>
        <CardBody>
          <HistoricalDataCostChart
            chartName={widget.chartName}
            costDistribution={costDistribution}
            costType={costType}
            currency={currency}
            reportPathsType={widget.reportPathsType}
            reportType={widget.reportType}
          />
        </CardBody>
      </Card>
    );
  };

  // Returns network chart
  private getNetworkChart = (widget: HistoricalDataWidget) => {
    const { groupBy, intl } = this.props;

    let showWidget = false;
    if (widget.network?.showWidgetOnGroupBy) {
      for (const groupById of widget.network.showWidgetOnGroupBy) {
        if (groupById === groupBy) {
          showWidget = true;
          break;
        }
      }
    }
    if (showWidget) {
      return (
        <Card>
          <CardTitle>
            <Title headingLevel="h2" size={TitleSizes.lg}>
              {intl.formatMessage(messages.historicalChartTitle, {
                value: this.getTitleKey(widget.reportPathsType, widget.reportType),
              })}
            </Title>
          </CardTitle>
          <CardBody>
            <HistoricalDataNetworkChart
              chartName={widget.chartName}
              reportPathsType={widget.reportPathsType}
              reportType={widget.reportType}
            />
          </CardBody>
        </Card>
      );
    }
    return null;
  };

  // Returns volume chart
  private getVolumeChart = (widget: HistoricalDataWidget) => {
    const { intl } = this.props;

    return (
      <Card>
        <CardTitle>
          <Title headingLevel="h2" size={TitleSizes.lg}>
            {intl.formatMessage(messages.historicalChartTitle, {
              value: this.getTitleKey(widget.reportPathsType, widget.reportType),
            })}
          </Title>
        </CardTitle>
        <CardBody>
          <HistoricalDataVolumeChart
            chartName={widget.chartName}
            reportPathsType={widget.reportPathsType}
            reportType={widget.reportType}
          />
        </CardBody>
      </Card>
    );
  };

  // Returns trend chart
  private getTrendChart = (widget: HistoricalDataWidget) => {
    const { costType, currency, intl } = this.props;

    return (
      <Card>
        <CardTitle>
          <Title headingLevel="h2" size={TitleSizes.lg}>
            {intl.formatMessage(messages.historicalChartTitle, {
              value: this.getTitleKey(widget.reportPathsType, widget.reportType),
            })}
          </Title>
        </CardTitle>
        <CardBody>
          <HistoricalDataTrendChart
            chartName={widget.chartName}
            costType={costType}
            currency={currency}
            reportPathsType={widget.reportPathsType}
            reportType={widget.reportType}
          />
        </CardBody>
      </Card>
    );
  };

  // Returns usage chart
  private getUsageChart = (widget: HistoricalDataWidget) => {
    const { intl } = this.props;

    return (
      <Card>
        <CardTitle>
          <Title headingLevel="h2" size={TitleSizes.lg}>
            {intl.formatMessage(messages.historicalChartTitle, {
              value: this.getTitleKey(widget.reportPathsType, widget.reportType),
            })}
          </Title>
        </CardTitle>
        <CardBody>
          <HistoricalDataUsageChart
            chartName={widget.chartName}
            reportPathsType={widget.reportPathsType}
            reportType={widget.reportType}
          />
        </CardBody>
      </Card>
    );
  };

  // Returns rendered widget based on type
  private renderWidget(widgetId: number) {
    const { isOcpCloudNetworkingToggleEnabled, isOcpProjectStorageToggleEnabled, selectWidgets } = this.props;

    const widget = selectWidgets[widgetId];
    let result = null;

    switch (widget.type) {
      case HistoricalDataWidgetType.cost:
        result = this.getCostChart(widget);
        break;
      case HistoricalDataWidgetType.network:
        result = isOcpCloudNetworkingToggleEnabled ? this.getNetworkChart(widget) : null;
        break;
      case HistoricalDataWidgetType.trend:
        result = this.getTrendChart(widget);
        break;
      case HistoricalDataWidgetType.usage:
        result = this.getUsageChart(widget);
        break;
      case HistoricalDataWidgetType.volume:
        result = isOcpProjectStorageToggleEnabled ? this.getVolumeChart(widget) : null;
        break;
    }
    return result !== null ? <GridItem key={`widget-${widgetId}`}>{result}</GridItem> : null;
  }

  public render() {
    const { widgets } = this.props;

    return <Grid hasGutter>{widgets.map(widgetId => this.renderWidget(widgetId))}</Grid>;
  }
}

const HistoricalDataBase = injectIntl(HistoricalDatasBase);

export default HistoricalDataBase;
