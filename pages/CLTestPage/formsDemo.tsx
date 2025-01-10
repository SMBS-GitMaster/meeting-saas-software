import React from 'react'

import {
  Form,
  FormFieldArray,
  formFieldArrayValidators,
  formValidators,
  maxLength,
  minLength,
  required,
} from '@mm/core/forms'

import {
  BtnText,
  CheckBoxInput,
  CheckCircleInput,
  ColoredSelectInput,
  DatePickerInput,
  Expandable,
  SelectInputMultipleSelection,
  SelectInputSingleSelection,
  Text,
  TextInput,
  WeekRangePickerInput,
  toREM,
} from '@mm/core-web/ui'

import {
  optionsForColoredSelectInput,
  optionsForSelectInput,
} from './dropdownsAndFieldsDemo'

export const FormsDemo = () => {
  return (
    <Expandable title='Forms'>
      {' '}
      <>
        <Text type={'body'}>
          This is a form with autosave, if you submit it will error out.
        </Text>

        <Form
          values={
            {
              textInputBasicWithForms: '',
              textInputBasicWithFormsNotRequired: '',
              selectInputSingleWithForms: 'Oganesson',
              coloredSelectInputWithForms: '',
              datePickerWithForms: 1647271029797,
              dateRangePickerStartDateName: null,
              dateRangePickerEndDateName: null,
              checkboxWithForms: false,
              checkCircleWithForms: false,
              checkCircleWarningWithForms: false,
            } as Record<string, any>
          }
          validation={{
            textInputBasicWithForms: formValidators.string({
              additionalRules: [maxLength({ maxLength: 20 }), required()],
            }),
            textInputBasicWithFormsNotRequired: formValidators.string({
              additionalRules: [],
            }),
            selectInputSingleWithForms: formValidators.string({
              additionalRules: [required()],
            }),
            coloredSelectInputWithForms: formValidators.string({
              additionalRules: [required()],
            }),
            datePickerWithForms: formValidators.number({
              additionalRules: [required()],
            }),
            dateRangePickerStartDateName: formValidators.number({
              additionalRules: [required()],
            }),
            dateRangePickerEndDateName: formValidators.number({
              additionalRules: [required()],
            }),
            checkboxWithForms: formValidators.boolean({ additionalRules: [] }),
            checkCircleWithForms: formValidators.boolean({
              additionalRules: [required()],
            }),
            checkCircleWarningWithForms: formValidators.boolean({
              additionalRules: [required()],
            }),
          }}
          autosave={true}
          onSubmit={async (values) =>
            console.log('Submitting values with autosave:', values)
          }
        >
          {({ onSubmit, hasError, onFieldChange }) => (
            <>
              <TextInput
                name={'textInputBasicWithForms'}
                id={'textInputBasicWithForms'}
                clearable={true}
                formControl={{
                  label: 'Placeholder text',
                  caption: 'caption here',
                }}
                placeholder={'Placeholder text'}
              />
              <BtnText
                onClick={() => onFieldChange('textInputBasicWithForms', 'cats')}
                intent='primary'
                width='fitted'
                ariaLabel={'submitButton'}
              >
                Should add cats
              </BtnText>
              <TextInput
                name={'textInputBasicWithFormsNotRequired'}
                id={'textInputBasicWithFormsNotRequired'}
                clearable={true}
                formControl={{
                  label: 'Placeholder text',
                  caption: 'not required',
                }}
                placeholder={'Placeholder text'}
              />

              <SelectInputSingleSelection
                id={'selectInputSingleWithForms'}
                name={'selectInputSingleWithForms'}
                placeholder={'Placeholder text'}
                unknownItemText={'Unknown stuff'}
                options={optionsForSelectInput}
                formControl={{
                  label: 'Placeholder text',
                }}
              />

              <ColoredSelectInput
                unknownItemText={'Unknown status'}
                id={'coloredSelectInputFillWith'}
                placeholder={'Placeholder text'}
                options={optionsForColoredSelectInput}
                name={'coloredSelectInputWithForms'}
                formControl={{
                  label: 'Placeholder text',
                }}
              />

              <DatePickerInput
                id={'datePickerDemoExampleInFormsStuff'}
                name={'datePickerWithForms'}
                formControl={{
                  label: 'Placeholder text',
                }}
              />

              <WeekRangePickerInput
                id={'dateRangePickerDemoExampleInFormsStuff'}
                startDateName={'dateRangePickerStartDateName'}
                endDateName={'dateRangePickerEndDateName'}
                startDateFormControl={{
                  label: 'Start date(weekly)',
                }}
                endDateFormControl={{
                  label: 'End date(weekly)',
                }}
                showCaret={true}
                width={toREM(300)}
                customGoalDatesToDisable={[
                  { startDate: 1667779200000, endDate: 1668124800000 },
                  { startDate: 1668988800000, endDate: 1669334400000 },
                  { startDate: 1670803200000, endDate: 1672358400000 },
                ]}
              />

              <br />

              <CheckBoxInput
                id='checkboxDemoExampleInFormsStuff'
                name='checkboxWithForms'
                text='Warning'
                formControl={{
                  label: 'Intent warning',
                }}
              />

              <CheckBoxInput
                id='checkboxDemoExampleInFormsStuff'
                name='checkboxWithForms'
                text='I am a checkbox'
                formControl={{
                  label: 'Placeholder text',
                }}
              />

              <CheckCircleInput
                id='checkCircleWarningDemoExampleInFormsStuff'
                name='checkCircleWarningWithForms'
                text='Warning'
                size='small'
                formControl={{
                  label: 'Intent warning (Size=small)',
                }}
                intent='warning'
              />

              <CheckCircleInput
                id='checkCircleWarningDemoExampleInFormsStuff'
                name='checkCircleWarningWithForms'
                text='Success'
                size='small'
                formControl={{
                  label: 'Intent success (Size=small)',
                }}
                intent='success'
              />

              <CheckCircleInput
                id='checkCircleWarningDemoExampleInFormsStuff'
                name='checkCircleWarningWithForms'
                text='Default'
                size='small'
                formControl={{
                  label: 'Intent default (Size=small)',
                }}
                intent='default'
              />

              <CheckCircleInput
                id='checkCircleWarningDemoExampleInFormsStuff'
                name='checkCircleWarningWithForms'
                text='Warning'
                size='default'
                formControl={{
                  label: 'Intent warning (Size=default)',
                }}
                intent='warning'
              />

              <CheckCircleInput
                id='checkCircleWarningDemoExampleInFormsStuff'
                name='checkCircleWarningWithForms'
                text='Success'
                size='default'
                formControl={{
                  label: 'Intent success (Size=default)',
                }}
                intent='success'
              />

              <CheckCircleInput
                id='checkCircleWarningDemoExampleInFormsStuff'
                name='checkCircleWarningWithForms'
                text='Default'
                size='default'
                formControl={{
                  label: 'Intent default (Size=default)',
                }}
                intent='default'
              />

              <BtnText
                onClick={onSubmit}
                intent='primary'
                width='fitted'
                disabled={hasError}
                ariaLabel={'submitButton'}
              >
                Fake submit
              </BtnText>
            </>
          )}
        </Form>

        <br />

        <Text type={'body'}>This is a form with regular submit</Text>
        <Form
          values={
            {
              selectInputMultipleWithForms: ['Oganesson'],
              textInputBasicWithFormsNotRequiredRegSubmit: '',
              fieldArray: [
                {
                  id: '123456789',
                  title: 'title',
                  firstName: 'firstName',
                  dueDate: 1647271029797,
                },
              ],
            } as Record<string, any>
          }
          validation={{
            selectInputMultipleWithForms: formValidators.array({
              additionalRules: [required()],
            }),
            textInputBasicWithFormsNotRequiredRegSubmit: formValidators.string({
              additionalRules: [],
            }),
            fieldArray: formValidators.array({ additionalRules: [required()] }),
          }}
          onSubmit={async (values) => {
            console.log('Submitting values without autosave:', values)
          }}
        >
          {({ onSubmit, hasError }) => (
            <>
              <SelectInputMultipleSelection
                id={'selectInputMultipleWithForms'}
                name={'selectInputMultipleWithForms'}
                placeholder={'Placeholder text'}
                unknownItemText={'Unknown stuff'}
                options={optionsForSelectInput}
                showSearchIcon={true}
                formControl={{
                  label: 'Placeholder text',
                }}
              />
              <TextInput
                name={'textInputBasicWithFormsNotRequiredRegSubmit'}
                id={'textInputBasicWithFormsNotRequiredRegSubmit'}
                clearable={true}
                formControl={{
                  label: 'Placeholder text',
                  caption: 'not required',
                }}
                placeholder={'Placeholder text'}
              />

              <FormFieldArray<{
                parentFormValues: Record<string, any>
                arrayFieldName: 'fieldArray'
              }>
                name={'fieldArray'}
                validation={{
                  title: formFieldArrayValidators.string({
                    additionalRules: [required(), maxLength({ maxLength: 20 })],
                  }),
                  firstName: formFieldArrayValidators.string({
                    additionalRules: [required(), minLength({ minLength: 2 })],
                  }),
                  dueDate: formFieldArrayValidators.number({
                    additionalRules: [required()],
                  }),
                }}
              >
                {({
                  values,
                  onRemoveFieldArrayItem,
                  onAddFieldArrayItem,
                  generateFieldName,
                }) => (
                  <>
                    {values.map((item, index) => (
                      <React.Fragment key={index}>
                        <TextInput
                          name={
                            generateFieldName({
                              id: item.id,
                              propName: 'title',
                            }) as string
                          }
                          id={'textInputBasicWithFormsTitle'}
                          clearable={true}
                          formControl={{
                            label: generateFieldName({
                              id: item.id,
                              propName: 'title',
                            }) as string,
                            caption: 'caption here',
                          }}
                          placeholder={'Placeholder text'}
                        />
                        <TextInput
                          name={
                            generateFieldName({
                              id: item.id,
                              propName: 'firstName',
                            }) as string
                          }
                          id={'textInputBasicWithFormsFirstName'}
                          clearable={true}
                          formControl={{
                            label: generateFieldName({
                              id: item.id,
                              propName: 'firstName',
                            }) as string,
                            caption: 'caption here',
                          }}
                          placeholder={'Placeholder text'}
                        />
                        <DatePickerInput
                          id={'datePickerDemoExampleInFormsStuffFieldArray'}
                          name={
                            generateFieldName({
                              id: item.id,
                              propName: 'dueDate',
                            }) as string
                          }
                          formControl={{
                            label: generateFieldName({
                              id: item.id,
                              propName: 'dueDate',
                            }) as string,
                          }}
                        />

                        {values.length > 1 && (
                          <BtnText
                            onClick={() => {
                              onRemoveFieldArrayItem(item.id)
                            }}
                            intent='primary'
                            width='fitted'
                            ariaLabel={'submitButton'}
                          >
                            Remove item
                          </BtnText>
                        )}
                        <BtnText
                          onClick={() => {
                            onAddFieldArrayItem(index)
                          }}
                          intent='primary'
                          width='fitted'
                          ariaLabel={'submitButton'}
                        >
                          Add item at index
                        </BtnText>
                      </React.Fragment>
                    ))}
                    <br />

                    <BtnText
                      onClick={() => {
                        onAddFieldArrayItem(0)
                      }}
                      intent='primary'
                      width='fitted'
                      ariaLabel={'submitButton'}
                    >
                      Add item
                    </BtnText>
                  </>
                )}
              </FormFieldArray>

              <BtnText
                onClick={onSubmit}
                disabled={hasError}
                intent='primary'
                width='fitted'
                ariaLabel={'submitButton'}
              >
                Submit
              </BtnText>
            </>
          )}
        </Form>
      </>
    </Expandable>
  )
}
