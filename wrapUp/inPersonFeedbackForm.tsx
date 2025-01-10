// ALL_PARTICIPANTS/INPERSONHYBRID
import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { BtnText, toREM, useTheme } from '@mm/core-web/ui'

import { useAction } from '../pages/performance/mobx'
import { InPersonFeedbackFormItem } from './inPersonFeedbackFormItem'
import { IWrapUpActionHandlers, IWrapUpViewData } from './wrapUpTypes'

export interface IInPersonFeedbackFormValues {
  getData: () => Pick<
    IWrapUpViewData,
    | 'meetingInstanceAttendees'
    | 'isLoading'
    | 'displayMeetingRatings'
    | 'isCurrentUserMeetingLeader'
  >
  getGridResponsiveSize: () => number
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onMeetingInstanceAttendeeUpdated' | 'onUpdateWrapUpVotingActions'
  >
}

export const InPersonFeedbackForm = observer(
  (props: IInPersonFeedbackFormValues) => {
    const { getData, getActions, getGridResponsiveSize } = props
    const { sizes } = useTheme()
    const { t } = useTranslation()

    const handleUpdateMeetingSettingDisplayRating = useAction(() => {
      return getActions().onUpdateWrapUpVotingActions({
        displayMeetingRatings: !getData().displayMeetingRatings,
      })
    })

    return (
      <div
        css={css`
          display: flex;
          flex-direction: column;
          min-width: 100%;
        `}
      >
        <>
          <div
            css={css`
              display: grid;
              grid-template-columns: repeat(${getGridResponsiveSize()}, 1fr);
              gap: ${sizes.spacing16};
              padding-top: ${toREM(16)};
              margin: auto;
              justify-content: center;
              width: 100%;
            `}
          >
            {getData().meetingInstanceAttendees.map(
              (meetingInstanceAttendee) => (
                <InPersonFeedbackFormItem
                  key={meetingInstanceAttendee.id}
                  meetingInstanceAttendee={meetingInstanceAttendee}
                  getData={getData}
                  getActions={getActions}
                />
              )
            )}
          </div>
          {getData().isCurrentUserMeetingLeader && (
            <div
              css={css`
                width: auto;
                align-self: flex-end;
                padding-top: 32px;
              `}
            >
              <BtnText
                intent='secondary'
                ariaLabel={t('reveal/hide ratings')}
                width={'medium'}
                onClick={handleUpdateMeetingSettingDisplayRating}
              >
                {getData().displayMeetingRatings
                  ? t('Hide ratings')
                  : t('Reveal ratings')}
              </BtnText>
            </div>
          )}
        </>
      </div>
    )
  }
)
