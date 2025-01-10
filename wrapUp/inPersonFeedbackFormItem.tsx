import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  matchesRegex,
} from '@mm/core/forms'

import { useTranslation } from '@mm/core-web'

import {
  Icon,
  SquareRatingInput,
  TextEllipsis,
  UserAvatar,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useAction, useObservable } from '../pages/performance/mobx'
import { IWrapUpActionHandlers, IWrapUpViewData } from './wrapUpTypes'

export interface IInPersonFeedbackFormItemValues {
  getData: () => Pick<IWrapUpViewData, 'isLoading' | 'displayMeetingRatings'>
  meetingInstanceAttendee: IWrapUpViewData['meetingInstanceAttendees'][0]
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onMeetingInstanceAttendeeUpdated'
  >
}

export const InPersonFeedbackFormItem = observer(
  (props: IInPersonFeedbackFormItemValues) => {
    const componentState = useObservable({ formIsFocused: false })

    const { sizes, colors } = useTheme()
    const { t } = useTranslation()

    const { getData, meetingInstanceAttendee, getActions } = props

    const memoizedFormValues = useMemo(() => {
      return {
        rating: (meetingInstanceAttendee.rating || '').toString(),
      } as { rating: Maybe<string> }
    }, [meetingInstanceAttendee.rating])

    const setFormIsFocused = useAction((focused: boolean) => {
      componentState.formIsFocused = focused
    })

    return (
      <EditForm
        isLoading={getData().isLoading}
        values={memoizedFormValues}
        debounceMS={1000}
        validation={
          {
            rating: formValidators.string({
              additionalRules: [
                matchesRegex(
                  /^(10(\.0)?|[1-9](\.[0-9])?)?$/,
                  t('Please enter a number between 1 and 10')
                ),
              ],
              optional: true,
            }),
          } satisfies GetParentFormValidation<{
            rating: Maybe<string>
          }>
        }
        sendDiffs={false}
        onSubmit={async (values) => {
          if (values.rating == null) return

          if (values.rating === '') {
            return await getActions().onMeetingInstanceAttendeeUpdated({
              userId: meetingInstanceAttendee.attendee.id,
              rating: null,
            })
          }

          // note: we convert to a number at this point in time to allow for decimals in the input
          const ratingAsNumber = parseFloat(values.rating)
          if (isNaN(ratingAsNumber)) return

          return await getActions().onMeetingInstanceAttendeeUpdated({
            userId: meetingInstanceAttendee.attendee.id,
            rating: ratingAsNumber,
          })
        }}
      >
        {({ fieldNames, values, hasError }) => {
          return (
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              {!getData().displayMeetingRatings &&
              values?.rating &&
              !componentState.formIsFocused &&
              !hasError ? (
                <div
                  css={css`
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: ${toREM(40)};
                    height: ${toREM(24)};
                    color: ${colors.checkboxIconDefault};
                    background-color: ${colors.buttonRatingBackgroundSelected};
                    border: ${(props) => props.theme.sizes.smallSolidBorder}
                      ${(props) =>
                        props.theme.colors.metricCellDefaultBorderColor};
                    border-radius: ${(props) => props.theme.sizes.br1};
                  `}
                >
                  <Icon iconSize='lg' iconName={'checkIcon'} />
                </div>
              ) : (
                <div
                  css={css`
                    position: relative;
                    display: inline-block;
                  `}
                >
                  <SquareRatingInput
                    id={`rating_for_${meetingInstanceAttendee.attendee.id}`}
                    name={fieldNames.rating}
                    placeholder={t('-')}
                    onFocus={() => setFormIsFocused(true)}
                    onBlur={() => {
                      setFormIsFocused(false)
                    }}
                  />
                </div>
              )}

              <div
                css={css`
                  padding-right: ${sizes.spacing8};
                  padding-left: ${sizes.spacing16};
                `}
              >
                <UserAvatar
                  firstName={meetingInstanceAttendee.attendee.firstName}
                  lastName={meetingInstanceAttendee.attendee.lastName}
                  avatarUrl={meetingInstanceAttendee.attendee.avatar}
                  userAvatarColor={
                    meetingInstanceAttendee.attendee.userAvatarColor
                  }
                  size={'s'}
                  adornments={{ tooltip: true }}
                  tooltipPosition={'top center'}
                />
              </div>
              <TextEllipsis
                wordBreak={true}
                lineLimit={1}
                type='body'
                weight={'normal'}
              >
                {`${meetingInstanceAttendee.attendee.fullName}`}
              </TextEllipsis>
            </div>
          )
        }}
      </EditForm>
    )
  }
)
