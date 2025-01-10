import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'
import { usePreviousValue } from '@mm/core/ui/hooks'

import { meetingRatingLookup } from '@mm/core-bloom/meetings/lookups/meetingRatingLookup'

import { useTranslation } from '@mm/core-web'

import {
  BtnRating,
  BtnText,
  Card,
  Text,
  TextEllipsis,
  TextInput,
  UserAvatar,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import {
  useAction,
  useComputed,
  useObservable,
} from '../pages/performance/mobx'
import { WrapUpAttendeeFeedbackItem } from './wrapUpAttendeeFeedbackItem'
import { IWrapUpActionHandlers, IWrapUpViewData } from './wrapUpTypes'

export interface IRemoteFeedbackFormValues {
  getData: () => Pick<
    IWrapUpViewData,
    | 'currentUser'
    | 'displayMeetingRatings'
    | 'isCurrentUserMeetingLeader'
    | 'meetingInstanceAttendees'
  >
  getGridResponsiveSize: () => number
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onUpdateWrapUpVotingActions' | 'onMeetingInstanceAttendeeUpdated'
  >
}

export const RemoteFeedbackForm = observer(
  (props: IRemoteFeedbackFormValues) => {
    const componentState = useObservable({ userHasSubmittedFeedback: false })

    const { getData, getGridResponsiveSize, getActions } = props
    const { colors, sizes } = useTheme()
    const { t } = useTranslation()

    const previousDisplayMeetingRatings = usePreviousValue(
      getData().displayMeetingRatings
    )

    const getAttendeeFeedbackData = useComputed(
      () => {
        const attendeesThatHaveFeedback = (
          getData().meetingInstanceAttendees || []
        ).filter((attendee) => attendee.notesText)

        const attendeesThatHaveRated = (
          getData().meetingInstanceAttendees || []
        ).filter((attendee) => attendee.rating !== null)

        return { attendeesThatHaveFeedback, attendeesThatHaveRated }
      },
      { name: 'remoteFeedbackForm-getAttendeeFeedbackData' }
    )

    const handleUpdateMeetingSettingDisplayRating = useAction(() => {
      return getActions().onUpdateWrapUpVotingActions({
        displayMeetingRatings: !getData().displayMeetingRatings,
      })
    })

    const setUserHasSubmittedFeedback = useAction((submitted: boolean) => {
      componentState.userHasSubmittedFeedback = submitted
    })

    useEffect(() => {
      if (getData().displayMeetingRatings !== previousDisplayMeetingRatings) {
        setUserHasSubmittedFeedback(false)
      }
    }, [
      previousDisplayMeetingRatings,
      getData().displayMeetingRatings,
      setUserHasSubmittedFeedback,
    ])

    return (
      <CreateForm
        isLoading={false}
        values={
          {
            rating: null,
            notesText: '',
          } as {
            rating: Maybe<number>
            notesText: string
          }
        }
        validation={
          {
            rating: formValidators.number({
              additionalRules: [required()],
            }),
            notesText: formValidators.string({
              additionalRules: [maxLength({ maxLength: 500 })],
            }),
          } satisfies GetParentFormValidation<{
            rating: Maybe<number>
            notesText: string
          }>
        }
        onSubmit={(values) =>
          getActions().onMeetingInstanceAttendeeUpdated({
            userId: getData().currentUser.id,
            rating: values.rating,
            notesText: values.notesText,
          })
        }
      >
        {({ onSubmit, fieldNames, onFieldChange, values, hasError }) => {
          return !getData().displayMeetingRatings ? (
            <div
              css={css`
                display: flex;
                flex-direction: column;
                min-width: 100%;
              `}
            >
              <div
                css={css`
                  display: flex;
                  flex-flow: row wrap;
                  align-items: center;
                  justify-content: center;
                `}
              >
                {meetingRatingLookup.map((rating) => (
                  <BtnRating
                    css={css`
                      margin-right: ${toREM(21)};
                    `}
                    key={rating.value}
                    ariaLabel={t('Rating {{rating}}', {
                      rating: rating.text,
                    })}
                    selected={rating.value === values?.rating}
                    onClick={() =>
                      onFieldChange(fieldNames.rating, rating.value)
                    }
                    rating={rating.value}
                  />
                ))}
              </div>
              <>
                {componentState.userHasSubmittedFeedback ? (
                  <>
                    {values?.notesText ? (
                      <WrapUpAttendeeFeedbackItem
                        meetingAttendee={getData().currentUser}
                        notesText={values.notesText}
                        css={css`
                          padding-top: ${(props) =>
                            props.theme.sizes.spacing32};
                        `}
                      />
                    ) : null}
                  </>
                ) : (
                  <TextInput
                    id={'notesText'}
                    name={fieldNames.notesText}
                    formControl={{
                      label: (
                        <div
                          css={css`
                            display: flex;
                            flex-direction: row;
                            align-items: left;
                            padding-right: ${(props) =>
                              props.theme.sizes.spacing4};
                          `}
                        >
                          <TextEllipsis
                            wordBreak={true}
                            lineLimit={2}
                            weight='semibold'
                          >
                            {t('How can we get even better next week?')}
                          </TextEllipsis>
                          <Text fontStyle='italic'>&nbsp;{t('optional')}</Text>
                        </div>
                      ),
                    }}
                    width={'100%'}
                  />
                )}
                <div
                  css={css`
                    display: flex;
                    justify-content: space-between;
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      align-self: flex-start;
                      gap: ${(prop) => prop.theme.sizes.spacing4};
                      margin-right: ${(prop) => prop.theme.sizes.spacing16};
                      padding-top: ${(prop) => prop.theme.sizes.spacing36};
                    `}
                  >
                    {getData()
                      .meetingInstanceAttendees.filter(
                        (attendeeNode) => attendeeNode.rating !== null
                      )
                      .slice(0, 8)
                      .map((attendee) => (
                        <div key={attendee.id}>
                          <UserAvatar
                            key={attendee.id}
                            adornments={{ tooltip: true }}
                            avatarUrl={attendee.attendee.avatar}
                            userAvatarColor={attendee.attendee.userAvatarColor}
                            firstName={attendee.attendee.firstName}
                            lastName={attendee.attendee.lastName}
                            size='m'
                          />
                          {getAttendeeFeedbackData().attendeesThatHaveRated
                            .length > 8 && (
                            <div
                              css={css`
                                border-radius: ${toREM(5)};
                                width: ${toREM(32)};
                                height: ${toREM(32)};
                                justify-content: center;
                              `}
                            >
                              {
                                +`${getAttendeeFeedbackData().attendeesThatHaveRated.length - 8}`
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    <TextEllipsis
                      lineLimit={2}
                      wordBreak={true}
                      type='small'
                      weight='normal'
                      css={css`
                        margin: auto;
                      `}
                    >
                      {t(`{{count}} attendees have submitted ratings`, {
                        count:
                          getAttendeeFeedbackData().attendeesThatHaveRated
                            .length,
                      })}
                    </TextEllipsis>
                  </div>
                  <div
                    css={css`
                      width: auto;
                      align-self: flex-end;
                      padding-top: ${(prop) => prop.theme.sizes.spacing32};
                    `}
                  >
                    {getData().isCurrentUserMeetingLeader &&
                    !getData().displayMeetingRatings ? (
                      <BtnText
                        intent='secondary'
                        ariaLabel={t('submit feedback')}
                        disabled={hasError}
                        tooltip={
                          hasError
                            ? {
                                position: 'top center',
                                msg: t('Please complete all required fields'),
                              }
                            : undefined
                        }
                        width={'fitted'}
                        iconProps={{
                          iconName: 'leaderIcon',
                          iconSize: 'md',
                          iconColor: { color: colors.agendaCrown },
                        }}
                        onClick={() => {
                          onSubmit()

                          // @BLOOM_TODO:  https://winterinternational.atlassian.net/browse/TTD-2721
                          // we have to setTimeout here for the below mutation to properly fire. This may be a case of a debounced/batched
                          // mutation ghost in mm-gql.
                          setTimeout(() => {
                            return handleUpdateMeetingSettingDisplayRating()
                          }, 500)
                        }}
                      >
                        <TextEllipsis
                          type='body'
                          weight='bold'
                          wordBreak={true}
                          lineLimit={1}
                        >
                          {t('Submit my feedback & reveal all ratings')}
                        </TextEllipsis>
                      </BtnText>
                    ) : (
                      <div
                        css={css`
                          color: ${colors.buttonSecondaryTextDefault};
                          display: flex;
                          flex-flow: column;
                          align-items: flex-end;
                        `}
                      >
                        {componentState.userHasSubmittedFeedback ? (
                          <Text
                            type={'body'}
                            color={{ color: colors.captionTextColor }}
                            css={css`
                              padding-top: ${(props) =>
                                props.theme.sizes.spacing8};
                            `}
                          >
                            {t(
                              'When all present finish rating, the leader will reveal scores.'
                            )}
                          </Text>
                        ) : (
                          <BtnText
                            intent='secondary'
                            disabled={hasError}
                            tooltip={
                              hasError
                                ? {
                                    position: 'top left',
                                    msg: t(
                                      'Please complete all required fields'
                                    ),
                                  }
                                : undefined
                            }
                            ariaLabel={t('submit feedback')}
                            width={'fitted'}
                            onClick={() => {
                              setUserHasSubmittedFeedback(true)
                              onSubmit()
                            }}
                          >
                            {t('Submit')}
                          </BtnText>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            </div>
          ) : (
            <>
              <div
                css={css`
                  display: grid;
                  grid-template-columns: repeat(
                    ${getGridResponsiveSize()},
                    1fr
                  );
                  gap: ${sizes.spacing16};
                  padding-top: ${toREM(16)};
                  margin: auto;
                  justify-content: center;
                  width: 100%;
                `}
              >
                {getData().meetingInstanceAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    css={css`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <div
                      css={css`
                        padding-right: ${sizes.spacing16};
                      `}
                    >
                      <div
                        css={css`
                          position: relative;
                          display: inline-block;
                        `}
                      >
                        <div
                          css={css`
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: ${toREM(40)};
                            height: ${toREM(24)};
                            color: ${colors.checkboxIconDefault};
                            background-color: ${colors.buttonRatingBackgroundSelected};
                            border: ${(props) =>
                                props.theme.sizes.smallSolidBorder}
                              ${(props) =>
                                props.theme.colors
                                  .metricCellDefaultBorderColor};
                            border-radius: ${(props) => props.theme.sizes.br1};
                          `}
                        >
                          <Text type={'body'}>{attendee.rating || t('-')}</Text>
                        </div>
                      </div>
                    </div>
                    <div
                      css={css`
                        padding-right: ${sizes.spacing8};
                      `}
                    >
                      <UserAvatar
                        firstName={attendee.attendee.firstName}
                        lastName={attendee.attendee.lastName}
                        avatarUrl={attendee.attendee.avatar}
                        userAvatarColor={attendee.attendee.userAvatarColor}
                        size={'s'}
                        adornments={{ tooltip: true }}
                        tooltipPosition={'top center'}
                      />
                    </div>
                    <Text type='body' weight='normal'>
                      {`${attendee.attendee.fullName}`}
                    </Text>
                  </div>
                ))}
              </div>
              {!!getAttendeeFeedbackData().attendeesThatHaveFeedback.length && (
                <Card.Title
                  css={css`
                    padding-top: ${(props) => props.theme.sizes.spacing32};
                  `}
                >
                  {t('Feedback')}
                </Card.Title>
              )}
              <div
                css={css`
                  display: flex;
                  justify-content: space-between;
                  flex-flow: column nowrap;
                  width: 100%;
                `}
              >
                <div
                  css={css`
                    display: flex;
                    align-items: flex-start;
                    flex-flow: column nowrap;
                  `}
                >
                  {!!getAttendeeFeedbackData().attendeesThatHaveFeedback
                    .length &&
                    getAttendeeFeedbackData().attendeesThatHaveFeedback.map(
                      (attendee) => (
                        <WrapUpAttendeeFeedbackItem
                          key={attendee.id}
                          meetingAttendee={attendee.attendee}
                          notesText={attendee.notesText || ''}
                          css={css`
                            padding-bottom: ${(props) =>
                              props.theme.sizes.spacing16};
                          `}
                        />
                      )
                    )}
                </div>
                {getData().isCurrentUserMeetingLeader && (
                  <div
                    css={css`
                      display: flex;
                      width: auto;
                      align-self: flex-end;
                    `}
                  >
                    <BtnText
                      intent='secondary'
                      ariaLabel={t('submit feedback')}
                      width={'fitted'}
                      iconProps={{
                        iconName: 'leaderIcon',
                        iconSize: 'md',
                        iconColor: { color: colors.agendaCrown },
                      }}
                      onClick={handleUpdateMeetingSettingDisplayRating}
                    >
                      {t('Go back')}
                    </BtnText>
                  </div>
                )}
              </div>
            </>
          )
        }}
      </CreateForm>
    )
  }
)
