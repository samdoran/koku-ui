import { chart_color_blue_300 } from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import { chart_color_cyan_300 } from '@patternfly/react-tokens/dist/js/chart_color_cyan_300';
import { chart_color_gold_300 } from '@patternfly/react-tokens/dist/js/chart_color_gold_300';
import { chart_color_green_300 } from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import { chart_color_orange_300 } from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import { chart_color_purple_300 } from '@patternfly/react-tokens/dist/js/chart_color_purple_300';

export const chartStyles = {
  // See: https://github.com/project-koku/koku-ui/issues/241
  colorScale: [
    chart_color_blue_300.value,
    chart_color_gold_300.value,
    chart_color_green_300.value,
    chart_color_purple_300.value,
    chart_color_orange_300.value,
    chart_color_cyan_300.value,
  ],
  yAxis: {
    axisLabel: {
      padding: 15,
    },
    grid: {
      stroke: 'none',
    },
    ticks: {
      stroke: 'none',
    },
    // tickLabels: {
    //   fontSize: 0,
    // },
  },
  xAxis: {
    axisLabel: {
      padding: 40,
    },
    grid: {
      stroke: 'none',
    },
    ticks: {
      stroke: 'none',
    },
  },
};
