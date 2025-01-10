import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Card,
  Icon,
  Menu,
  Text,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { InPersonFeedbackForm } from './inPersonFeedbackForm'
import { RemoteFeedbackForm } from './remoteFeedbackForm'
import { IWrapUpActionHandlers, IWrapUpViewData } from './wrapUpTypes'

export const WrapUpMeetingFeedback = observer(
  (props: {
    getData: () => Pick<
      IWrapUpViewData,
      | 'feedbackStyle'
      | 'isCurrentUserMeetingLeader'
      | 'isLoading'
      | 'meetingInstanceAttendees'
      | 'displayMeetingRatings'
      | 'currentUser'
    >
    getActions: () => Pick<
      IWrapUpActionHandlers,
      'onUpdateWrapUpVotingActions' | 'onMeetingInstanceAttendeeUpdated'
    >
    getGridResponsiveSize: () => number
  }) => {
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const theme = useTheme()

    const { getData, getActions, getGridResponsiveSize } = props

    return (
      <>
        <Card.SectionHeader
          css={css`
            display: flex;
            justify-content: space-between;
            padding-top: ${(prop) => prop.theme.sizes.spacing8};
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
            `}
          >
            {getData().feedbackStyle === 'ALL_PARTICIPANTS' ? (
              <Card.Title>{t('Meeting feedback')}</Card.Title>
            ) : (
              <Card.Title>{t('Meeting rating')}</Card.Title>
            )}
            <Text
              type='small'
              color={{ intent: 'deemph' }}
              css={css`
                margin-top: ${(prop) => prop.theme.sizes.spacing4};
              `}
            >
              {t(
                'Rate the meeting 1-10. Ratings less than an 8? Drop it to the {{issues}} list.',
                {
                  issues: terms.issue.lowercasePlural,
                }
              )}
            </Text>
          </div>
          {getData().isCurrentUserMeetingLeader && (
            <Menu
              position='bottom right'
              css={css`
                width: ${toREM(300)};
              `}
              content={(close) => (
                <>
                  <Menu.Item
                    isSectionHeader={true}
                    css={css`
                      align-items: center;
                      padding: ${(props) => props.theme.sizes.spacing10}
                        ${(props) => props.theme.sizes.spacing16};
                    `}
                  >
                    <Text weight='semibold'>{t('Feedback style')}</Text>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    onClick={(e) => {
                      close(e)
                      getActions().onUpdateWrapUpVotingActions({
                        feedbackStyle: 'ALL_PARTICIPANTS',
                        displayMeetingRatings: false,
                      })
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        justify-content: center;
                        flex-flow: column;
                        align-items: flex-start;
                        width: 100%;
                      `}
                    >
                      <Text type={'body'} weight={'semibold'}>
                        {t('In-person / hybrid')}
                      </Text>
                      <div
                        css={css`
                          display: inline-flex;
                          justify-content: flex-start;
                          width: 100%;
                          text-align: left;
                        `}
                      >
                        <Text type={'body'} weight={'normal'}>
                          {t('Rate your meeting on a scale from 1 to 10.')}
                        </Text>
                        {getData().feedbackStyle === 'ALL_PARTICIPANTS' && (
                          <div
                            css={css`
                              align-items: center;
                              justify-content: center;
                              padding-left: ${(props) =>
                                props.theme.sizes.spacing4};
                            `}
                          >
                            <Icon
                              iconName={'checkIcon'}
                              iconSize={'md'}
                              iconColor={{
                                color: theme.colors.bodyTextDefault,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      close(e)
                      getActions().onUpdateWrapUpVotingActions({
                        feedbackStyle: 'INDIVIDUAL',
                        displayMeetingRatings: false,
                      })
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        justify-content: center;
                        flex-flow: column;
                        align-items: flex-start;
                        width: 100%;
                      `}
                    >
                      <Text type={'body'} weight={'semibold'}>
                        {t('Remote')}
                      </Text>
                      <div
                        css={css`
                          display: inline-flex;
                          justify-content: flex-start;
                          width: 100%;
                          text-align: left;
                        `}
                      >
                        <Text type={'body'} weight={'normal'}>
                          {t(
                            'Rate your meeting on a scale from 1 to 10 and add optional written feedback.'
                          )}
                        </Text>
                        {getData().feedbackStyle === 'INDIVIDUAL' && (
                          <div
                            css={css`
                              align-items: center;
                              justify-content: center;
                              padding-left: ${(props) =>
                                props.theme.sizes.spacing4};
                            `}
                          >
                            <Icon
                              iconName={'checkIcon'}
                              iconSize={'md'}
                              iconColor={{
                                color: theme.colors.bodyTextDefault,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Menu.Item>
                </>
              )}
            >
              <BtnIcon
                intent='tertiaryTransparent'
                iconProps={{
                  iconName: 'moreVerticalIcon',
                  iconSize: 'lg',
                }}
                ariaLabel={t('More options')}
                tag={'button'}
              />
            </Menu>
          )}
        </Card.SectionHeader>
        <Card.BodySafeArea
          css={css`
            display: flex;
            padding: ${(prop) => prop.theme.sizes.spacing16}
              ${(prop) => prop.theme.sizes.spacing16};
          `}
        >
          <div
            css={css`
              min-width: 100%;
            `}
          >
            <div
              css={css`
                display: flex;
                flex-wrap: wrap;
                gap: ${(prop) => prop.theme.sizes.spacing16};
              `}
            >
              {getData().feedbackStyle === 'ALL_PARTICIPANTS' && (
                <InPersonFeedbackForm
                  getData={getData}
                  getGridResponsiveSize={getGridResponsiveSize}
                  getActions={getActions}
                />
              )}
              {getData().feedbackStyle === 'INDIVIDUAL' && (
                <RemoteFeedbackForm
                  getData={getData}
                  getGridResponsiveSize={getGridResponsiveSize}
                  getActions={getActions}
                />
              )}
            </div>
          </div>
        </Card.BodySafeArea>
      </>
    )
  }
)
