import { CostOverviewBase } from 'pages/details/components/costOverview/costOverviewBase';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { createMapStateToProps } from 'store/common';
import { awsCostOverviewSelectors } from 'store/costOverview/awsCostOverview';

interface CostOverviewStateProps {
  widgets: number[];
}

type CostOverviewOwnProps = InjectedTranslateProps;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = createMapStateToProps<CostOverviewOwnProps, CostOverviewStateProps>((state, props) => {
  return {
    selectWidgets: awsCostOverviewSelectors.selectWidgets(state),
    widgets: awsCostOverviewSelectors.selectCurrentWidgets(state),
  };
});

const CostOverview = translate()(connect(mapStateToProps, {})(CostOverviewBase));

export { CostOverview };
