import { ThunkAction } from 'store/common';
import { forecastActions } from 'store/forecasts';
import { reportActions } from 'store/reports';
import { createStandardAction } from 'typesafe-actions';

import { AwsCloudDashboardTab } from './awsCloudDashboardCommon';
import { selectWidget, selectWidgetQueries } from './awsCloudDashboardSelectors';

export const fetchWidgetForecasts = (id: number): ThunkAction => {
  return (dispatch, getState) => {
    const state = getState();
    const widget = selectWidget(state, id);

    if (widget.forecastPathsType && widget.forecastType) {
      const { forecast } = selectWidgetQueries(state, id);
      dispatch(forecastActions.fetchForecast(widget.forecastPathsType, widget.forecastType, forecast));
    }
  };
};

export const fetchWidgetReports = (id: number): ThunkAction => {
  return (dispatch, getState) => {
    const state = getState();
    const widget = selectWidget(state, id);
    const { previous, current, tabs } = selectWidgetQueries(state, id);
    dispatch(reportActions.fetchReport(widget.reportPathsType, widget.reportType, current));
    dispatch(reportActions.fetchReport(widget.reportPathsType, widget.reportType, previous));
    if (widget.availableTabs) {
      dispatch(reportActions.fetchReport(widget.reportPathsType, widget.reportType, tabs));
    }
  };
};

export const setWidgetTab = createStandardAction('awsCloudDashboard/widget/tab')<{
  id: number;
  tab: AwsCloudDashboardTab;
}>();

export const changeWidgetTab = (id: number, tab: AwsCloudDashboardTab): ThunkAction => {
  return dispatch => {
    dispatch(setWidgetTab({ id, tab }));
    dispatch(fetchWidgetReports(id));
  };
};
