import { axiosInstance } from 'api';
import { ReportType } from 'api/reports/report';

import { runReport } from './ociReports';

test('api run reports calls axios get', () => {
  const query = 'filter[resolution]=daily';
  runReport(ReportType.cost, query);
  expect(axiosInstance.get).toBeCalledWith(`reports/oci/costs/?${query}`);
});
