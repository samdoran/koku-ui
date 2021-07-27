import { DashboardBase } from 'pages/views/overview/components/dashboardBase';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { createMapStateToProps } from 'store/common';
import { gcpOcpDashboardSelectors } from 'store/dashboard/gcpOcpDashboard';

import { GcpOcpDashboardWidget } from './gcpOcpDashboardWidget';

type GcpOcpDashboardOwnProps = WithTranslation;

interface GcpOcpDashboardStateProps {
  DashboardWidget: typeof GcpOcpDashboardWidget;
  widgets: number[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = createMapStateToProps<GcpOcpDashboardOwnProps, GcpOcpDashboardStateProps>((state, props) => {
  return {
    DashboardWidget: GcpOcpDashboardWidget,
    selectWidgets: gcpOcpDashboardSelectors.selectWidgets(state),
    widgets: gcpOcpDashboardSelectors.selectCurrentWidgets(state),
  };
});

const GcpOcpDashboard = withTranslation()(connect(mapStateToProps, {})(DashboardBase));

export default GcpOcpDashboard;