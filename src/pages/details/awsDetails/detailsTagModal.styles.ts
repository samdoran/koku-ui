import { StyleSheet } from '@patternfly/react-styles';
import { global_spacer_2xl, global_spacer_lg } from '@patternfly/react-tokens';
import { css } from 'emotion';

export const styles = StyleSheet.create({
  subTitle: {
    marginTop: global_spacer_2xl.value,
    textAlign: 'right',
  },
});

export const modalOverride = css`
  /* Workaround for isLarge not working properly */
  &.pf-c-modal-box {
    height: 700px;
    width: 600px;
  }
  & .pf-c-modal-box__body {
    margin-top: ${global_spacer_lg.value};
  }
  & .pf-c-modal-box__footer {
    display: none;
  }
`;
