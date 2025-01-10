import React, { useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  Form,
  FormFieldArray,
  FormValuesForSubmit,
  GetParentFormValidation,
  formFieldArrayValidators,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import {
  BtnText,
  DatePickerInput,
  Expandable,
  Text,
  TextInput,
} from '@mm/core-web/ui'

interface IFormArrayOfNodesDemoValues {
  title: string
  fieldArray: Array<{
    id: Id
    title: string
    dueDate: number
  }>
}

export const FormsArrayOfNodesDemo = () => {
  const [titleValue, setTitleValue] = useState<string>('title')
  const [fieldArrayValues, setFieldArrayValues] = useState<
    Array<{
      id: Id
      title: string
      dueDate: number
    }>
  >([
    {
      id: '123456789',
      title: 'title',
      dueDate: 1680652800,
    },
  ])

  const handleUpdateFormValues = (
    values: Partial<
      FormValuesForSubmit<IFormArrayOfNodesDemoValues, true, 'fieldArray'>
    >
  ) => {
    if (values.title) {
      setTitleValue(values.title)
    }
    if (values.fieldArray) {
      values.fieldArray.forEach((entry) => {
        switch (entry.action) {
          case 'ADD': {
            return setFieldArrayValues((prev) => [...prev, entry.item])
          }
          case 'REMOVE': {
            return setFieldArrayValues((prev) =>
              prev.filter((prevItem) => prevItem.id !== entry.item.id)
            )
          }
          case 'UPDATE': {
            return setFieldArrayValues((prev) =>
              prev.map((prevItem) =>
                prevItem.id === entry.item.id
                  ? { ...prevItem, ...entry.item }
                  : prevItem
              )
            )
          }
          default: {
            console.log('unreachable case in demo - ignore me')
          }
        }
      })
    }
  }

  return (
    <Expandable title='Forms - arrayOfNodesDemo'>
      <>
        <Text type={'body'}>Forms with submit </Text>
        <Form
          values={
            {
              title: titleValue,
              fieldArray: fieldArrayValues,
            } as IFormArrayOfNodesDemoValues
          }
          validation={
            {
              title: formValidators.string({
                additionalRules: [required()],
              }),
              fieldArray: formValidators.arrayOfNodes({
                additionalRules: [required()],
              }),
            } satisfies GetParentFormValidation<IFormArrayOfNodesDemoValues>
          }
          sendDiffs={true}
          onSubmit={async (values) => {
            values.title
            values.fieldArray
            console.log('Submitting values without autosave:', values)
            handleUpdateFormValues(values)
          }}
        >
          {({ onSubmit, hasError }) => (
            <div>
              <div
                css={css`
                  display: inline-flex;
                `}
              >
                <TextInput
                  name={'title'}
                  id={'title'}
                  clearable={true}
                  formControl={{
                    label: 'title',
                  }}
                  placeholder={'Placeholder text'}
                />
              </div>
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  flex-flow: row wrap;
                `}
              >
                <FormFieldArray<{
                  parentFormValues: Record<string, any>
                  arrayFieldName: 'fieldArray'
                }>
                  name={'fieldArray'}
                  validation={{
                    title: formFieldArrayValidators.string({
                      additionalRules: [
                        required(),
                        maxLength({ maxLength: 20 }),
                      ],
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
                        <React.Fragment key={item.id}>
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
                          <br />

                          {values.length > 1 && (
                            <BtnText
                              onClick={() => {
                                onRemoveFieldArrayItem(item.id)
                              }}
                              intent='primary'
                              width='fitted'
                              ariaLabel={'submitButton'}
                            >
                              Remove
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
                            Add @index
                          </BtnText>
                        </React.Fragment>
                      ))}

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
              </div>

              <BtnText
                onClick={onSubmit}
                disabled={hasError}
                intent='primary'
                width='fitted'
                ariaLabel={'submitButton'}
              >
                Submit
              </BtnText>
            </div>
          )}
        </Form>

        <br />

        <Text type={'body'}>Forms with autosave </Text>
        <Form
          values={
            {
              title: titleValue,
              fieldArray: fieldArrayValues,
            } as IFormArrayOfNodesDemoValues
          }
          validation={
            {
              title: formValidators.string({
                additionalRules: [required()],
              }),
              fieldArray: formValidators.arrayOfNodes({
                additionalRules: [required()],
              }),
            } satisfies GetParentFormValidation<IFormArrayOfNodesDemoValues>
          }
          autosave={true}
          sendDiffs={true}
          onSubmit={async (values) => {
            values.title
            console.log(
              'Submitting values without autosave:',
              values.fieldArray
            )
            handleUpdateFormValues(values)
          }}
        >
          {({}) => (
            <div>
              <div
                css={css`
                  display: inline-flex;
                `}
              >
                <TextInput
                  name={'title'}
                  id={'title'}
                  clearable={true}
                  formControl={{
                    label: 'title',
                  }}
                  placeholder={'Placeholder text'}
                />
              </div>
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  flex-flow: row wrap;
                `}
              >
                <FormFieldArray<{
                  parentFormValues: Record<string, any>
                  arrayFieldName: 'fieldArray'
                }>
                  name={'fieldArray'}
                  validation={{
                    title: formFieldArrayValidators.string({
                      additionalRules: [
                        required(),
                        maxLength({ maxLength: 20 }),
                      ],
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
                          <br />

                          {values.length > 1 && (
                            <BtnText
                              onClick={() => {
                                onRemoveFieldArrayItem(item.id)
                              }}
                              intent='tertiary'
                              width='fitted'
                              ariaLabel={'submitButton'}
                            >
                              Remove
                            </BtnText>
                          )}
                          <BtnText
                            onClick={() => {
                              onAddFieldArrayItem(index)
                            }}
                            intent='tertiary'
                            width='fitted'
                            ariaLabel={'submitButton'}
                          >
                            Add @index
                          </BtnText>
                        </React.Fragment>
                      ))}

                      <BtnText
                        onClick={() => {
                          onAddFieldArrayItem(0)
                        }}
                        intent='tertiary'
                        width='fitted'
                        ariaLabel={'submitButton'}
                      >
                        Add item
                      </BtnText>
                    </>
                  )}
                </FormFieldArray>
              </div>
            </div>
          )}
        </Form>
      </>
    </Expandable>
  )
}
