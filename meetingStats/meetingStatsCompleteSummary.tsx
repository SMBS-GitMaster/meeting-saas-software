import { Duration } from 'luxon'
import React from 'react'
import { css } from 'styled-components'

import { getDateDisplayUserLocale, getShortDateDisplay } from '@mm/core/date'
import { uuid } from '@mm/core/utils'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { Card, Icon, StatsTile, Text, toREM } from '@mm/core-web/ui'

import { MeetingStatsRating } from './meetingStatsCompleteSummary/meetingStatsRating'
import { MeetingStatTitle } from './meetingStatsCompleteSummary/meetingStatsTitle'
import { MeetingStatsFeedback } from './meetingStatsFeedback'
import {
  IMeetingStatsSolvedIssuesData,
  IMeetingStatsToDoCompleteSummaryData,
  IMeetingStatsViewData,
} from './meetingStatsTypes'
import { MeetingSummaryNotesItem } from './meetingSummaryNotesItem'

export const MeetingStatsCompleteSummary: React.FC<{
  showCompleteSummary: boolean
  todos: Array<IMeetingStatsToDoCompleteSummaryData>
  headlines: IMeetingStatsViewData['headlines']
  solvedIssues: Array<IMeetingStatsSolvedIssuesData>
  timezone: IMeetingStatsViewData['timezone']
  recordOfSelectedNotesIdToNotesText: IMeetingStatsViewData['recordOfSelectedNotesIdToNotesText']
  data: IMeetingStatsViewData
}> = function MeetingStatsCompleteSummary(props) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const groupList = (
    list:
      | Array<IMeetingStatsSolvedIssuesData>
      | IMeetingStatsViewData['headlines']
  ) => {
    return Object.values(list).reduce(
      (acc, item) => {
        acc.assignee = {
          ...acc.assignee,
          [`${item.assignee.firstName}_${item.assignee.id}`]: {
            itemId: `${item.id}`,
            user: `${item.assignee.firstName} ${item.assignee.lastName}`,
            titles: [
              ...(acc.assignee[`${item.assignee.firstName}_${item.assignee.id}`]
                ? acc.assignee[`${item.assignee.firstName}_${item.assignee.id}`]
                    .titles
                : []),
              item.title,
            ],
          },
        }

        return acc
      },
      { assignee: {} } as {
        assignee: {
          [key: string]: { itemId: string; user: string; titles: string[] }
        }
      }
    ).assignee
  }

  const groupHeadline = groupList(props.headlines)
  const groupIssues = groupList(props.solvedIssues)

  const meetingToalTimeInHHMMFormat = Duration.fromObject({
    seconds: props.data.meetingDurationInSeconds,
  }).toFormat(`hh:mm`)

  const [meetingTimeTotalHours, meetingTimeTotalMinutes] =
    meetingToalTimeInHHMMFormat.split(':')

  return props.showCompleteSummary ? (
    <div
      css={css`
        background-color: ${({ theme }) => theme.colors.summaryBackgroundColor};
        padding: ${toREM(47)};
        padding-top: ${({ theme }) => theme.sizes.spacing24};
      `}
    >
      {/* 
      https://winterinternational.atlassian.net/browse/TTD-1753 -- uncomment this once BE work is done and TTD-1753 is unblocked
      <div>
        <Text
          type='h3'
          weight='semibold'
          color={{ intent: 'default' }}
          css={css`
            width: 100%;
            padding: ${toREM(11)} ${(props) => props.theme.sizes.spacing16};
            border-bottom: ${(props) => props.theme.sizes.smallSolidBorder}
              ${(props) => props.theme.colors.cardBorderColor};
          `}
        >
          {t('Meeting notes included in summary')}
        </Text>
        <div
          css={css`
            padding-top: ${toREM(30)};
          `}
        >
          {props.recordOfSelectedNotesIdToNotesText.map((note) => {
            return (
              <MeetingSummaryNotesItem
                note={note}
                timezone={props.timezone}
                key={note.noteNodeId}
              />
            )
          })}
        </div>
      </div> */}
      <div
        css={css`
          width: ${toREM(595)};
          margin-left: auto;
          margin-right: auto;
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          flex-direction: column;
        `}
      >
        <Icon
          css={css`
            padding-bottom: ${({ theme }) => theme.sizes.spacing8};
          `}
          iconName='printIcon'
          iconSize='lg'
        />

        <Card
          css={css`
            padding-block: ${(props) => props.theme.sizes.spacing32};
            width: ${toREM(595)};
          `}
        >
          <div
            css={css`
              padding: ${(props) => `0px ${props.theme.sizes.spacing16}`};
              display: flex;
              flex-direction: column;
            `}
          >
            <div
              css={css`
                display: flex;
                justify-content: space-between;
              `}
            >
              <img
                src='https://s3.us-west-2.amazonaws.com/files.app.bloomgrowth.com/logos/bloom-growth-logo-meeting-summary-v3-png.png'
                width={235}
                alt='bloom-logi'
                css={css`
                  margin-bottom: ${({ theme }) => theme.sizes.spacing24};
                `}
              />
            </div>
            <Text
              color={{ intent: 'default' }}
              type='h3'
              weight='semibold'
              css={css`
                margin-bottom: ${({ theme }) => theme.sizes.spacing24};
              `}
            >
              {props.data.meetingConcludedTime
                ? getShortDateDisplay({
                    secondsSinceEpochUTC: props.data.meetingConcludedTime,
                  })
                : ''}{' '}
              {t('{{meetingTitle}}', {
                meetingTitle: props.data.meetingTitle,
              })}
            </Text>
            <div
              css={css`
                display: flex;
                gap: ${(props) => props.theme.sizes.spacing18};
                flex-wrap: wrap;
                margin-bottom: ${(props) => props.theme.sizes.spacing32};

                & > div {
                  max-width: ${toREM(271)};
                  width: 100%;
                }

                & h3 {
                  font-size: ${toREM(18)} !important;
                }
              `}
            >
              <StatsTile
                title={t('Meeting Rating')}
                // description={t(`That's an average of {{value}} for the year.`, {
                //   value: props.data.priorAverageMeetingRating,
                // })}
                description={null}
                value={t(`{{value}}`, {
                  value: props.data.averageMeetingRating,
                })}
              />
              <StatsTile
                title={t('{{todo}} completed', {
                  todo: terms.todo.singular,
                })}
                description={t(
                  `That's {{value}}% {{compare}} than last week.`,
                  {
                    value: Math.abs(
                      props.data
                        .todosCompletedPercentageDifferenceFromLastMeeting
                    ),
                    compare:
                      props.data
                        .todosCompletedPercentageDifferenceFromLastMeeting < 0
                        ? t('less')
                        : t('more'),
                  }
                )}
                value={t(`{{value}}%`, {
                  value: props.data.todosCompletedPercentage,
                })}
              />
              <StatsTile
                title={t('{{label}} solved', {
                  label:
                    props.data.issuesSolvedCount === 1
                      ? terms.issue.singular
                      : terms.issue.plural,
                })}
                description={t(`That's {{value}} total this quarter.`, {
                  value: props.data.issuesSolvedCountForTheQuarter,
                })}
                value={props.data.issuesSolvedCount.toString()}
              />
              <StatsTile
                title={t('Total meeting time')}
                description={t(
                  `That's {{count}} {{unit}} {{compare}} than last meeting.`,
                  {
                    count: Math.abs(
                      props.data
                        .meetingDurationDifferenceFromLastMeetingInMinutes
                    ),
                    compare:
                      props.data
                        .meetingDurationDifferenceFromLastMeetingInMinutes < 0
                        ? t('shorter')
                        : t('longer'),
                    unit:
                      Math.abs(
                        props.data
                          .meetingDurationDifferenceFromLastMeetingInMinutes
                      ) === 1
                        ? t('minute')
                        : t('minutes'),
                  }
                )}
                value={
                  <>
                    {meetingTimeTotalHours}
                    <Text
                      type='h1'
                      css={css`
                        font-weight: 500;
                        font-size: ${toREM(24)};
                      `}
                    >
                      {t('hr')}
                    </Text>{' '}
                    {meetingTimeTotalMinutes}
                    <Text
                      type='h1'
                      css={css`
                        font-weight: 500;
                        font-size: ${toREM(24)};
                      `}
                    >
                      {t('min')}
                    </Text>
                  </>
                }
              />
            </div>
          </div>
          <div
            // https://winterinternational.atlassian.net/browse/TTD-1753 -- uncomment this once BE work is done and TTD-1753 is unblocked
            // css={css`
            //   padding-top: ${toREM(43)};
            // `}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing32};
              padding-right: ${(props) => props.theme.sizes.spacing16};
            `}
          >
            <MeetingStatTitle
              icon='toDoCompleteIcon'
              text={terms.todo.plural}
            />
            <div>
              {props.todos.length ? (
                <>
                  {
                    props.todos.reduce(
                      (acc, todo, itemIndex) => {
                        acc.assignees.push(
                          <div
                            key={itemIndex}
                            css={css`
                              &:last-child {
                                div:last-child {
                                  padding-bottom: 0;
                                }
                              }
                            `}
                          >
                            <div
                              css={css`
                                display: flex;
                                flex-direction: row;
                                align-items: center;
                              `}
                            >
                              <Text
                                type='body'
                                weight='semibold'
                                color={{ intent: 'default' }}
                                css={css`
                                  padding-left: ${(props) =>
                                    props.theme.sizes.spacing16};
                                  padding-bottom: ${({ theme }) =>
                                    theme.sizes.spacing8};
                                `}
                              >
                                {todo.assignee.fullName}
                              </Text>
                            </div>
                            <div
                              css={css`
                                padding-bottom: ${({ theme }) =>
                                  theme.sizes.spacing24};

                                &:last-child {
                                  div:last-child {
                                    padding-bottom: 0;
                                  }
                                }
                              `}
                            >
                              {todo.messages.map((message) => (
                                <div
                                  key={uuid()}
                                  css={css`
                                    display: flex;
                                    flex-direction: row;
                                    align-items: center;
                                    justify-content: space-between;
                                    padding-left: ${(props) =>
                                      props.theme.sizes.spacing16};
                                    padding-bottom: ${(props) =>
                                      props.theme.sizes.spacing16};
                                  `}
                                >
                                  <Text
                                    color={{ intent: 'default' }}
                                    type='body'
                                  >
                                    {message.title}
                                  </Text>
                                  <Text
                                    css={css`
                                      color: ${(props) =>
                                        props.theme.colors.datePlainTextColor};
                                      padding-left: ${toREM(216)};
                                    `}
                                    type='body'
                                    weight='semibold'
                                  >
                                    {getDateDisplayUserLocale({
                                      secondsSinceEpochUTC: message.dueDate,
                                      userTimezone: props.timezone,
                                    })}
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                        return acc
                      },
                      { assignees: [], itemIndex: 0 } as {
                        assignees: Array<React.ReactNode>
                        itemIndex: number
                      }
                    ).assignees
                  }
                </>
              ) : (
                <Text
                  fontStyle='italic'
                  css={css`
                    display: inline-flex;
                    margin: auto;
                    width: 100%;
                    justify-content: space-evenly;
                  `}
                  type='body'
                  weight='normal'
                >
                  {t(`No ${terms.todo.plural} added.`)}
                </Text>
              )}
            </div>
          </div>
          <div
            css={css`
              padding-right: ${(props) => props.theme.sizes.spacing16};
              padding-bottom: ${({ theme }) => theme.sizes.spacing32};
            `}
          >
            <MeetingStatTitle
              icon='headlineIcon'
              text={terms.headline.plural}
            />
            {props.headlines.length ? (
              <>
                {Object.values(groupHeadline).map((headline, index) => {
                  return (
                    <div
                      key={uuid()}
                      css={css`
                        padding-bottom: ${({ theme }) => theme.sizes.spacing24};

                        &:last-child {
                          padding-bottom: 0;
                        }
                      `}
                    >
                      <div
                        key={`${headline.user}-${index}`}
                        css={css`
                          padding: ${(props) =>
                            `0 ${props.theme.sizes.spacing16}`};

                          &:last-child {
                            div:last-child {
                              padding-bottom: 0;
                            }
                          }
                        `}
                      >
                        <Text
                          type='body'
                          weight='semibold'
                          color={{ intent: 'default' }}
                          css={css`
                            display: flex;
                            align-items: center;
                            padding-bottom: ${({ theme }) =>
                              theme.sizes.spacing8};
                          `}
                        >
                          {headline.user}
                        </Text>
                        <div
                          css={css`
                            display: flex;
                            flex-direction: column;

                            &:last-child {
                              span:last-child {
                                padding-bottom: 0;
                              }
                            }
                          `}
                        >
                          {headline.titles.map((title) => (
                            <Text
                              key={headline.itemId}
                              type='body'
                              color={{ intent: 'default' }}
                              css={css`
                                align-items: center;
                                display: flex;
                                padding-bottom: ${({ theme }) =>
                                  theme.sizes.spacing16};
                              `}
                            >
                              {title}
                            </Text>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <Text
                fontStyle='italic'
                css={css`
                  display: inline-flex;
                  margin: auto;
                  width: 100%;
                  justify-content: space-evenly;
                `}
                type='body'
                weight='normal'
              >
                {t(`No ${terms.headline.plural} added.`)}
              </Text>
            )}
          </div>
          <div
            css={css`
              padding-right: ${(props) => props.theme.sizes.spacing16};
              padding-bottom: ${({ theme }) => theme.sizes.spacing32};
            `}
          >
            <MeetingStatTitle icon='issuesIcon' text={terms.issue.plural} />
            {props.solvedIssues.length ? (
              <>
                {Object.values(groupIssues).map((issue, index) => {
                  return (
                    <div
                      key={uuid()}
                      css={css`
                        padding-bottom: ${({ theme }) => theme.sizes.spacing24};

                        &:last-child {
                          padding-bottom: 0;
                        }
                      `}
                    >
                      <div
                        key={`${issue.user}-${index}`}
                        css={css`
                          padding: ${(props) =>
                            `0 ${props.theme.sizes.spacing16}`};

                          &:last-child {
                            div:last-child {
                              padding-bottom: 0;
                            }
                          }
                        `}
                      >
                        <Text
                          type='body'
                          weight='semibold'
                          color={{ intent: 'default' }}
                          css={css`
                            display: flex;
                            align-items: center;
                            padding-bottom: ${({ theme }) =>
                              theme.sizes.spacing8};
                          `}
                        >
                          {issue.user}
                        </Text>
                        <div
                          css={css`
                            display: flex;
                            flex-direction: column;

                            &:last-child {
                              span:last-child {
                                padding-bottom: 0;
                              }
                            }
                          `}
                        >
                          {issue.titles.map((title) => (
                            <Text
                              key={issue.itemId}
                              type='body'
                              color={{ intent: 'default' }}
                              css={css`
                                align-items: center;
                                display: flex;
                                padding-bottom: ${({ theme }) =>
                                  theme.sizes.spacing16};
                              `}
                            >
                              {title}
                            </Text>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <Text
                fontStyle='italic'
                css={css`
                  display: inline-flex;
                  margin: auto;
                  width: 100%;
                  justify-content: space-evenly;
                `}
                type='body'
                weight='normal'
              >
                {t(`No ${terms.issue.plural} added.`)}
              </Text>
            )}
          </div>
          <div
            css={css`
              padding-right: ${(props) => props.theme.sizes.spacing16};
              padding-bottom: ${(props) => props.theme.sizes.spacing32};
            `}
          >
            <MeetingStatTitle icon='fileIcon' text={t(`Meeting notes`)} />
            {props.data.recordOfSelectedNotesIdToNotesText.length ? (
              <div
                css={css`
                  &:last-child {
                    div:last-child {
                      padding-bottom: 0;
                    }
                  }
                `}
              >
                {props.data.recordOfSelectedNotesIdToNotesText.map((note) => {
                  return (
                    <MeetingSummaryNotesItem
                      note={note}
                      timezone={props.timezone}
                      key={note.noteNodeId}
                    />
                  )
                })}
              </div>
            ) : (
              <Text
                fontStyle='italic'
                css={css`
                  display: inline-flex;
                  margin: auto;
                  width: 100%;
                  justify-content: space-evenly;
                `}
                type='body'
                weight='normal'
              >
                {t('No meeting notes added.')}
              </Text>
            )}
          </div>
          {props.data.attendeeInstances.length ? (
            <MeetingStatsRating
              attendeesInstances={props.data.attendeeInstances}
              averageMeetingRating={props.data.averageMeetingRating}
            />
          ) : null}
          <MeetingStatsFeedback
            isCompleteSummary
            feedbackInstances={props.data.feedbackInstances}
          />
        </Card>
      </div>
    </div>
  ) : null
}
