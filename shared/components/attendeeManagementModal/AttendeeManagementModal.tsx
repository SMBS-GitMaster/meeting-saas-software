import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import { css } from 'styled-components'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomMeetingMutations,
  useBloomMeetingNode,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Clickable,
  Icon,
  Link,
  Modal,
  SelectUserInputMultipleSelection,
  Text,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import {
  IAttendeeManagementModalProps,
  TAttendeeTabs,
} from './attendeeManagmentTypes'
import { ATTENDEE_MANAGEMENT_MODAL_TABS } from './attendeeMangementModalConstants'
import { getAttendeeMangementModalPermissions } from './attendeeMangementModalPermissions'
import { CurrentAttendeeListEntry } from './currentAttendeeListEntry'

export const AttendeeManagementModal = observer(
  function AttendeeManagementModal(props: IAttendeeManagementModalProps) {
    const { t } = useTranslation()
    const theme = useTheme()
    const { v1Url } = useBrowserEnvironment()
    const { openOverlazy, closeOverlazy } = useOverlazyController()

    const { addMeetingAttendee, editMeetingLeader, removeMeetingAttendee } =
      useBloomMeetingMutations()

    const { meetingId } = props

    const linkToAdvancedSettings = `${v1Url}L10/Edit/${meetingId}`

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id }) => ({ id }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({
            name,
            currentMeetingInstance,
            attendees,
            currentMeetingAttendee,
          }) => ({
            name,
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
            currentMeetingInstance: currentMeetingInstance({
              map: ({ id, leaderId, currentPageId }) => ({
                id,
                leaderId,
                currentPageId,
              }),
            }),
            attendees: attendees({
              pagination: {
                includeTotalCount: true,
              },
              map: ({
                id,
                avatar,
                firstName,
                lastName,
                fullName,
                isPresent,
                userAvatarColor,
              }) => ({
                id,
                avatar,
                firstName,
                lastName,
                fullName,
                isPresent,
                userAvatarColor,
              }),
            }),
          }),
          target: { id: meetingId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        users: queryDefinition({
          def: useBloomUserNode(),
          map: ({
            id,
            avatar,
            userAvatarColor,
            firstName,
            lastName,
            fullName,
          }) => ({
            id,
            avatar,
            userAvatarColor,
            firstName,
            lastName,
            fullName,
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      { subscriptionId: `AttendeeManagementModal-${meetingId}` }
    )

    const tabToStartOn = !subscription().data.meeting?.currentMeetingAttendee
      ?.permissions.admin
      ? 'VIEW_ATTENDEE'
      : 'ADD_ATTENDEE'

    const [activeTab, setActiveTab] =
      React.useState<TAttendeeTabs>(tabToStartOn)

    const isMeetingOngoing =
      !!subscription().data.meeting?.currentMeetingInstance

    const { canEditAttendeesInMeeting, canViewAdvancedSettingsInMeeting } =
      useMemo(() => {
        return getAttendeeMangementModalPermissions(
          subscription().data.meeting?.currentMeetingAttendee.permissions ??
            null
        )
      }, [subscription().data.meeting?.currentMeetingAttendee.permissions])

    const currentMeetingAttendeeIds = useMemo(() => {
      return (subscription().data.meeting?.attendees.nodes || []).map(
        (attendee) => attendee.id
      )
    }, [subscription().data.meeting?.attendees.nodes])

    const orgUsersLookupWithCurrentAttendeesRemoved = useMemo(() => {
      return (subscription().data.users?.nodes || [])
        .filter((user) => {
          return !currentMeetingAttendeeIds.includes(user.id)
        })
        .map((attendee) => ({
          value: attendee.id,
          metadata: attendee,
        }))
    }, [currentMeetingAttendeeIds, subscription().data.users?.nodes])

    const onAttendeeAdded = useCallback(
      async (attendees: Array<Id>) => {
        try {
          await Promise.all(
            attendees.map(async (attendeeId) => {
              return await addMeetingAttendee({
                userId: attendeeId,
                meetingId,
              })
            })
          )
          setActiveTab('VIEW_ATTENDEE')
          openOverlazy('Toast', {
            type: 'success',
            text: t(`Attendee added`),
            undoClicked: () => {
              console.log(
                '@TODO_BLOOM https://winterinternational.atlassian.net/browse/TTD-1491'
              )
            },
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error adding attendee to meeting`),
            error: new UserActionError(e),
          })
        }
      },
      [addMeetingAttendee, openOverlazy, t, meetingId]
    )

    const currentMeetingInstance =
      subscription().data.meeting?.currentMeetingInstance
    const onLeaderUpdated = useCallback(
      async (props: { newLeaderId: string }) => {
        if (!currentMeetingInstance) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(
              'Cannot update meeting leader while the meeting is not ongoing'
            ),
            error: new Error(
              'Cannot update meeting leader while the meeting is not ongoing'
            ),
          })
          return
        }

        try {
          await editMeetingLeader({
            meetingInstanceId: currentMeetingInstance.id,
            leaderId: props.newLeaderId,
            currentPageId: currentMeetingInstance.currentPageId,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Failed to update meeting leader.'),
            error: new UserActionError(e),
          })
        }
      },
      [currentMeetingInstance, openOverlazy, t, editMeetingLeader]
    )

    const onAttendeeRemoved = useCallback(
      async (opts: { attendeeId: Id }) => {
        try {
          await removeMeetingAttendee({ userId: opts.attendeeId, meetingId })

          openOverlazy('Toast', {
            type: 'success',
            text: t('Attendee removed successfully.'),
            undoClicked: () =>
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              ),
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Failed to remove attendee.'),
            error: new UserActionError(e),
          })
        }
      },
      [removeMeetingAttendee, meetingId, openOverlazy, t]
    )

    const onHandleCancelClicked = useCallback(() => {
      return closeOverlazy({
        type: 'Modal',
        name: 'AttendeeManagementModal',
      })
    }, [closeOverlazy])

    return (
      <Modal id={'AttendeeManagementModal'}>
        <Modal.Header
          css={css`
            padding: ${toREM(24)} ${toREM(24)} ${toREM(16)} ${toREM(24)};
          `}
        >
          <div
            css={css`
              display: flex;
              gap: ${({ theme }) => theme.sizes.spacing32};
              flex-wrap: wrap;
              height: ${toREM(32)};
              align-items: flex-end;
            `}
          >
            {subscription().data.meeting?.currentMeetingAttendee?.permissions
              .admin ? (
              ATTENDEE_MANAGEMENT_MODAL_TABS.map((tab) => (
                <Clickable
                  key={tab.value}
                  clicked={() => setActiveTab(tab.value)}
                >
                  <Text
                    weight='semibold'
                    type='h4'
                    color={
                      tab.value !== activeTab
                        ? { color: theme.colors.cardInactiveTabTextColor }
                        : { color: theme.colors.bodyTextDefault }
                    }
                    css={
                      tab.value === activeTab
                        ? css`
                            border-bottom: ${({ theme }) =>
                                theme.sizes.mediumSolidBorder}
                              ${({ theme }) => theme.colors.bodyTextDefault};
                          `
                        : css`
                            border-bottom: ${({ theme }) =>
                                theme.sizes.mediumSolidBorder}
                              transparent;
                          `
                    }
                  >
                    {tab.text}
                    {tab.value === 'VIEW_ATTENDEE' &&
                      ` (${
                        subscription().data.meeting?.attendees.totalCount ?? 0
                      })`}
                  </Text>
                </Clickable>
              ))
            ) : (
              <Text
                weight='semibold'
                type='h4'
                css={css`
                  border-bottom: ${({ theme }) => theme.sizes.mediumSolidBorder}
                    ${({ theme }) => theme.colors.bodyTextDefault};
                `}
              >
                {t('View attendees')}
                {` (${subscription().data.meeting?.attendees.totalCount ?? 0})`}
              </Text>
            )}
          </div>
        </Modal.Header>

        <Modal.Body
          css={css`
            max-width: ${toREM(480)};
            padding: 0;
            padding-bottom: ${theme.sizes.spacing24};
          `}
        >
          {subscription().querying ? (
            <Text type='body'>{t('Loading...')}</Text>
          ) : (
            <>
              {activeTab === 'ADD_ATTENDEE' &&
                subscription().data.meeting?.currentMeetingAttendee?.permissions
                  .admin && (
                  <div
                    css={css`
                      padding: 0 ${theme.sizes.spacing24};
                    `}
                  >
                    <Text
                      type={'body'}
                      weight={'semibold'}
                      css={css`
                        padding-bottom: ${theme.sizes.spacing4};
                        text-overflow: wrap;
                      `}
                    >
                      {t(
                        'Search users to add them to the {{meetingName}} meeting',
                        {
                          meetingName: subscription().data.meeting?.name ?? '',
                        }
                      )}
                    </Text>

                    <EditForm
                      isLoading={subscription().querying}
                      values={
                        {
                          attendees: [],
                        } as { attendees: Array<Id> }
                      }
                      disabled={!canEditAttendeesInMeeting.allowed}
                      disabledTooltip={
                        !canEditAttendeesInMeeting.allowed
                          ? {
                              msg: canEditAttendeesInMeeting.message,
                              position: 'top center',
                            }
                          : undefined
                      }
                      validation={
                        {
                          attendees: formValidators.array({
                            additionalRules: [required()],
                          }),
                        } satisfies GetParentFormValidation<{
                          attendees: Array<Id>
                        }>
                      }
                      autosave={false}
                      sendDiffs={false}
                      onSubmit={async () => {
                        // NO OP
                      }}
                    >
                      {({ fieldNames, hasError, values }) => {
                        return (
                          <>
                            <SelectUserInputMultipleSelection
                              id='add-attendee-input'
                              name={fieldNames.attendees}
                              unknownItemText={t('Unknown attendee')}
                              options={
                                orgUsersLookupWithCurrentAttendeesRemoved
                              }
                              width='100%'
                              displayCurrentValue={true}
                              displaySelectAll={false}
                              displayNoOptionsLeftText={{
                                text: t(
                                  'All users are attendees of this meeting'
                                ),
                              }}
                              displayClearAll={false}
                              clickingSelectedOptionRemovesIt={false}
                              css={css`
                                margin-bottom: ${theme.sizes.spacing4};
                              `}
                            />

                            {canViewAdvancedSettingsInMeeting.allowed && (
                              <InfoText
                                linkToAdvancedSettings={linkToAdvancedSettings}
                              />
                            )}

                            <div
                              css={css`
                                display: flex;
                                justify-content: flex-end;
                                padding-top: ${theme.sizes.spacing32};
                              `}
                            >
                              <BtnText
                                intent='tertiary'
                                ariaLabel={t('Cancel')}
                                onClick={onHandleCancelClicked}
                              >
                                {t('Cancel')}
                              </BtnText>
                              <BtnText
                                intent='primary'
                                ariaLabel={t('Add')}
                                onClick={() =>
                                  onAttendeeAdded(values?.attendees || [])
                                }
                                disabled={hasError}
                              >
                                {t('Add')}
                              </BtnText>
                            </div>
                          </>
                        )
                      }}
                    </EditForm>
                  </div>
                )}

              {activeTab === 'VIEW_ATTENDEE' && (
                <>
                  <table
                    css={css`
                      border-collapse: separate;
                      border-spacing: 0;
                    `}
                  >
                    <tbody>
                      {(subscription().data.meeting?.attendees.nodes || []).map(
                        (attendee) => (
                          <CurrentAttendeeListEntry
                            key={attendee.id}
                            attendee={attendee}
                            currentUserPermissions={
                              subscription().data.meeting
                                ?.currentMeetingAttendee?.permissions ?? null
                            }
                            currentUserId={
                              subscription().data.currentUser?.id ?? null
                            }
                            isMeetingLeader={
                              subscription().data.meeting
                                ?.currentMeetingInstance?.leaderId ===
                              attendee.id
                            }
                            isOnlyOneAttendeeLeftInMeeting={
                              (
                                subscription().data.meeting?.attendees.nodes ||
                                []
                              ).length === 1
                            }
                            canEditAttendeesInMeeting={
                              canEditAttendeesInMeeting
                            }
                            isMeetingOngoing={isMeetingOngoing}
                            onLeaderUpdated={onLeaderUpdated}
                            onAttendeeRemoved={onAttendeeRemoved}
                          />
                        )
                      )}
                    </tbody>
                  </table>
                  {canViewAdvancedSettingsInMeeting.allowed && (
                    <InfoText
                      linkToAdvancedSettings={linkToAdvancedSettings}
                      css={css`
                        padding: ${theme.sizes.spacing4}
                          ${theme.sizes.spacing24} 0 ${theme.sizes.spacing24};
                      `}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    )
  }
)

const InfoText = (props: {
  linkToAdvancedSettings: string
  className?: string
}) => {
  const theme = useTheme()
  const { t } = useTranslation()

  const { linkToAdvancedSettings } = props

  return (
    <div
      className={props.className}
      css={css`
        display: flex;
        justify-content: flex-start;
        align-items: center;
      `}
    >
      <Icon iconSize={'md'} iconName={'infoCircleSolid'} />
      <Text
        weight={'normal'}
        type={'small'}
        css={css`
          padding: 0 ${theme.sizes.spacing4} 0 ${theme.sizes.spacing8};
          font-style: italic;
        `}
      >
        {t('You can change the permissions in advanced settings')}
      </Text>
      <Link href={linkToAdvancedSettings}>
        <Text
          weight={'semibold'}
          type={'small'}
          decoration={'underline'}
          color={{ color: theme.colors.addAttendeeLinkColor }}
          css={css`
            font-style: italic;
            padding-bottom: ${toREM(2)};
          `}
        >
          {t('here')}
        </Text>
        <Text
          weight={'normal'}
          type={'small'}
          css={css`
            padding-left: ${theme.sizes.spacing4};
            font-style: italic;
          `}
        >
          {t('.')}
        </Text>
      </Link>
    </div>
  )
}

export default AttendeeManagementModal
