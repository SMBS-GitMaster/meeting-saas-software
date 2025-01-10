import React, { useState } from 'react'

import { useTimeController } from '@mm/core/date'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Clickable,
  DatePickerInput,
  DatePickerType,
  Expandable,
  Text,
  WeekRangePickerInput,
  toREM,
} from '@mm/core-web/ui'

export const DatePickerDemo = () => {
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { t } = useTranslation()

  const [dateValue, setDateValue] = useState<number>(getSecondsSinceEpochUTC())
  const [dateRangePickerStartDateWeekly, setDateRangePickerStartDateWeekly] =
    useState<Maybe<number>>(null)
  const [dateRangePickerEndDateWeekly, setDateRangePickerEndDateWeekly] =
    useState<Maybe<number>>(null)

  const handleDateValueChange = (value: number) => {
    console.log('onChange for datePicker', value)
    setDateValue(value)
  }

  const handleWeeklyDatePickerChange = (
    value: Maybe<number>,
    type: DatePickerType
  ) => {
    if (type === 'START') {
      setDateRangePickerStartDateWeekly(value)
    } else {
      setDateRangePickerEndDateWeekly(value)
    }
  }

  return (
    <Expandable title='DatePickers'>
      <DatePickerInput
        value={dateValue}
        id={'8765309999'}
        name={'datePickerDemoExampleNoFormControl'}
        formControl={{
          label: 'Placeholder text',
        }}
        onChange={handleDateValueChange}
      />
      <DatePickerInput
        value={dateValue}
        id={'123456789'}
        name={'datePickerDemoExampleOne'}
        formControl={{
          label: 'Placeholder text',
          required: true,
        }}
        disabled={true}
        tooltip={{
          msg: 'I am a tooltip',
          position: 'top center',
        }}
        onChange={handleDateValueChange}
      />
      <DatePickerInput
        value={null}
        id={'87653098765309'}
        error={'Error text'}
        formControl={{
          label: 'Placeholder text',
          required: true,
        }}
        tooltip={{
          msg: 'I am null',
          position: 'top center',
        }}
        name={'datePickerDemoExampleOneError'}
        onChange={handleDateValueChange}
      />

      <DatePickerInput
        isSkinny={true}
        value={null}
        id={'87653098765309'}
        formControl={{
          label: 'Skinny datepicker',
          required: true,
        }}
        tooltip={{
          msg: 'I am null',
          position: 'top center',
        }}
        name={'datePickerDemoExampleOneError'}
        onChange={handleDateValueChange}
      />

      <DatePickerInput
        value={dateValue}
        id={'8765309999'}
        name={'datePickerDemoExampleNoFormControl'}
        formControl={{
          label: 'Date Picker with custom trigger/input',
        }}
        onChange={handleDateValueChange}
        customInput={({ value, onClick }) => (
          <Clickable clicked={() => onClick && onClick()}>
            <Text color={{ color: 'red' }} type='body'>
              {value}
            </Text>
          </Clickable>
        )}
      />
      <br />
      <Text type={'h4'} weight={'semibold'}>
        {t('Weekly Date Range Picker')}
      </Text>
      <br />
      <WeekRangePickerInput
        id={'dateRangePickerDemoExampleInFormsStuff'}
        startDateName={'dateRangePickerStartDateName'}
        endDateName={'dateRangePickerEndDateName'}
        startDateFormControl={{
          label: t('Start date(weekly)'),
        }}
        endDateFormControl={{
          label: t('End date(weekly)'),
        }}
        startDate={dateRangePickerStartDateWeekly}
        endDate={dateRangePickerEndDateWeekly}
        showCaret={true}
        width={toREM(300)}
        customGoalDatesToDisable={[
          { startDate: 1667779200, endDate: 1668124800 },
          { startDate: 1668988800, endDate: 1669334400 },
          { startDate: 1670803200, endDate: 1672358400 },
          { startDate: 1678060800, endDate: 1678147200 },
          { startDate: 1678665600, endDate: 1678665600 },
        ]}
        onChange={handleWeeklyDatePickerChange}
      />
      <br />
    </Expandable>
  )
}
