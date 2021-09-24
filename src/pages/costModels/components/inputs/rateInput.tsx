import { MessageDescriptor } from '@formatjs/intl/src/types';
import {
  FormGroup,
  FormGroupProps,
  InputGroup,
  InputGroupText,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';
import { DollarSignIcon } from '@patternfly/react-icons/dist/esm/icons/dollar-sign-icon';
import { intl as defaultIntl } from 'components/i18n';
import messages from 'locales/messages';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { formatRaw } from 'utils/format';
type RateFormGroup = Pick<FormGroupProps, 'fieldId' | 'style'>;
interface UniqueProps {
  label?: MessageDescriptor | string;
  helperTextInvalid?: MessageDescriptor | string;
}
type RateTextInput = Pick<TextInputProps, 'value' | 'onChange' | 'validated' | 'onBlur'>;
type RateInputBaseProps = RateFormGroup & RateTextInput & UniqueProps & WrappedComponentProps;

const RateInputBase: React.FunctionComponent<RateInputBaseProps> = ({
  fieldId,
  helperTextInvalid: helpText = messages.PriceListPosNumberRate,
  intl = defaultIntl, // Default required for testing
  label = messages.Rate,
  onBlur,
  onChange,
  style,
  validated,
  value,
}) => {
  const handleOnKeyDown = event => {
    // Prevent 'enter' and '+'
    if (event.keyCode === 13 || event.keyCode === 187) {
      event.preventDefault();
    }
  };
  return (
    <FormGroup
      isRequired
      style={style}
      fieldId={fieldId}
      label={label !== null && typeof label === 'object' ? intl.formatMessage(label) : label}
      helperTextInvalid={helpText !== null && typeof helpText === 'object' ? intl.formatMessage(helpText) : helpText}
      validated={validated}
    >
      <InputGroup>
        <InputGroupText>
          <DollarSignIcon />
        </InputGroupText>
        <TextInput
          onBlur={onBlur}
          isRequired
          type="text"
          aria-label={intl.formatMessage(messages.CostModelsWizardRateAriaLabel)}
          id={fieldId}
          placeholder={formatRaw('0.00')}
          value={formatRaw(value as string)}
          onChange={onChange}
          onKeyDown={handleOnKeyDown}
          validated={validated}
        />
      </InputGroup>
    </FormGroup>
  );
};

const RateInput = injectIntl(RateInputBase);
export { RateInput };
