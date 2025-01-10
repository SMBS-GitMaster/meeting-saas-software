import { observer } from 'mobx-react'
import React, { useMemo, useRef, useState } from 'react'
import { css } from 'styled-components'

import { type Id, NodesCollection } from '@mm/gql'

import { GenerateArrayFieldName } from '@mm/core/forms'

import { EMeetingPageType, PermissionCheckResult } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Icon,
  Menu,
  TextInputSmall,
  getTextStyles,
  toREM,
} from '@mm/core-web/ui'
import { MeetingAgendaTimer } from '@mm/core-web/ui/components/agenda/timer'
import { DragHandle } from '@mm/core-web/ui/temp/dragHandle'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import {
  IMeetingAgendaActionHandlers,
  IMeetingAgendaViewData,
  IMeetingPage,
} from './agendaCardTypes'
import {
  AGENDA_SORTABLE_PAGES_ITEM_CLASS,
  SECTION_NAME_CHAR_LIMIT,
} from './agendaConsts'
import { AgendaSectionItemTimer } from './agendaSectionItemTimer'
import type { AgendaSectionFormValues } from './agendaSections'

export const AgendaSectionItem = observer(
  (props: {
    agendaItem: AgendaSectionFormValues['agendaSections'][number]
    fieldArrayPropNames: {
      [TKey in keyof Omit<
        AgendaSectionFormValues['agendaSections'][number],
        'id'
      >]: TKey
    }
    meetingPageNavigationStatus: IMeetingAgendaViewData['meetingPageNavigationStatus']
    activePage: Maybe<{
      pageType: EMeetingPageType
      expectedDurationS: number
      timer: {
        timeLastPaused: Maybe<number>
        timeLastStarted: number
        timePreviouslySpentS: Maybe<number>
        timeSpentPausedS: number
      }
    }>
    canEditMeetingPagesInMeeting: PermissionCheckResult
    meetingPages: NodesCollection<{
      TItemType: IMeetingPage
      TIncludeTotalCount: boolean
    }>
    expectedMeetingDurationFromAgendaInMinutes: number
    pageName: string
    hasCurrentPageBeenVisitedInAnOngoingMeeting: boolean
    isActiveMeetingPage: boolean
    displayTimerBar: boolean
    meetingIsOngoing: boolean
    meetingisPaused: boolean
    generateFieldName: GenerateArrayFieldName<
      AgendaSectionFormValues['agendaSections'][number]
    >
    onRemoveFieldArrayItem: (id: Id) => void
    onUpdateAgendaSections: IMeetingAgendaActionHandlers['onUpdateAgendaSections']
  }) => {
    const {
      agendaItem,
      fieldArrayPropNames,
      canEditMeetingPagesInMeeting,
      meetingPages,
      generateFieldName,
      pageName,
      isActiveMeetingPage,
      displayTimerBar,
      hasCurrentPageBeenVisitedInAnOngoingMeeting,
      expectedMeetingDurationFromAgendaInMinutes,
      meetingIsOngoing,
      onRemoveFieldArrayItem,
      onUpdateAgendaSections,
    } = props
    const [isEditing, setIsEditing] = useState(false)

    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()

    const agendaItemRef = useRef<Maybe<HTMLDivElement>>(null)

    const renderPageWasVisitedCheckmark = useMemo(() => {
      return hasCurrentPageBeenVisitedInAnOngoingMeeting && !isActiveMeetingPage

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetingIsOngoing, isActiveMeetingPage])

    const isWrapUpPageType = useMemo(() => {
      return props.activePage?.pageType === EMeetingPageType.WrapUp
    }, [props.activePage])

    return (
      <>
        <div
          ref={agendaItemRef}
          css={css`
            display: flex;
            justify-content: space-between;
            padding: 0 ${({ theme }) => theme.sizes.spacing12};
            width: 100%;
            min-height: ${({ theme }) => theme.sizes.spacing40};
            align-items: center;
            cursor: pointer;

            ${isActiveMeetingPage &&
            css`
              background-color: ${({ theme }) =>
                theme.colors.agendaItemActiveColor};
              ${getTextStyles({ type: 'body', weight: 'semibold' })};
            `}

            &:hover,
            &:focus {
              background-color: ${({ theme }) =>
                theme.colors.agendaItemHoverColor};
            }

            ${isEditing &&
            css`
              background-color: ${({ theme }) =>
                theme.colors.agendaItemHoverColor};
            `}

            .show_action_btns_on_hover, .show_action_btns_on_hover_button {
              display: none;
            }

            &:hover {
              .show_action_btns_on_hover,
              .show_action_btns_on_hover_button {
                display: unset;
              }

              .show_action_btns_on_hover_button {
                padding-left: 0;
              }

              ${!meetingIsOngoing &&
              css`
                padding: 0;
              `}
            }
          `}
        >
          <div
            css={css`
              display: inline-flex;
              align-items: center;
              width: 100%;

              .contentEditable::selection {
                background-color: ${({ theme }) =>
                  theme.colors.agendaItemInputSelectionColor};
              }
            `}
          >
            <span
              className={AGENDA_SORTABLE_PAGES_ITEM_CLASS}
              css={css`
                display: inline-block;
                height: ${toREM(24)};
              `}
            >
              {canEditMeetingPagesInMeeting.allowed && !meetingIsOngoing ? (
                <DragHandle
                  disabled={!canEditMeetingPagesInMeeting.allowed}
                  className={'show_action_btns_on_hover'}
                />
              ) : null}
            </span>

            <div
              css={css`
                text-align: left;
                display: inline-flex;
                align-items: center;
                width: 100%;
              `}
            >
              <TextInputSmall
                key={`agendaPageName-${agendaItem.id}`}
                characterLimit={SECTION_NAME_CHAR_LIMIT}
                width={'100%'}
                name={generateFieldName({
                  id: agendaItem.id,
                  propName: fieldArrayPropNames.pageName,
                })}
                outsideClickProps={{
                  clickOutsideRef: agendaItemRef,
                  onClickOutside: () => setIsEditing(false),
                }}
                textStyles={
                  isActiveMeetingPage
                    ? { type: 'body', weight: 'semibold' }
                    : { type: 'body', weight: 'normal' }
                }
                wordBreak={true}
                shouldFocusOnDoubleClick={!meetingIsOngoing}
                isEditing={isEditing}
                id={'agendaPageName'}
                highlightInitialText={!meetingIsOngoing}
                tooltip={{
                  position: 'right center',
                  msg: undefined,
                }}
                renderSecondaryErrorStyling={!isActiveMeetingPage}
                css={css`
                  /* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
                  .contentEditable {
                    height: auto;
                    min-height: ${({ theme }) => theme.sizes.spacing20};
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow-y: hidden;
                    white-space: normal;
                    padding: 0 !important;

                    :focus {
                      -webkit-line-clamp: unset;
                    }
                  }
                  /* stylelint-enable value-no-vendor-prefix, property-no-vendor-prefix */
                `}
              />
            </div>
          </div>
          <div
            css={css`
              display: inline-flex;
              align-items: center;
              padding-left: ${(props) => props.theme.sizes.spacing4};
              min-height: ${toREM(22)};
            `}
          >
            {renderPageWasVisitedCheckmark ? (
              <Icon iconName={'checkIcon'} iconSize={'lg'} />
            ) : meetingIsOngoing && isActiveMeetingPage ? (
              <AgendaSectionItemTimer
                currentPageExpectedDurationS={
                  props.activePage?.expectedDurationS ?? null
                }
                currentPageTimeInfo={props.activePage?.timer ?? null}
              />
            ) : (
              <TextInputSmall
                key={`agendaExpectedDurationS-${agendaItem.id}`}
                name={generateFieldName({
                  id: agendaItem.id,
                  propName: fieldArrayPropNames.expectedDurationM,
                })}
                id={'agendaExpectedDurationS'}
                width={'100%'}
                textStyles={
                  isActiveMeetingPage
                    ? { type: 'body', weight: 'semibold' }
                    : { type: 'body', weight: 'normal' }
                }
                tooltip={{
                  position: 'right center',
                  msg: undefined,
                }}
                highlightInitialText={!meetingIsOngoing}
                shouldFocusOnDoubleClick={!meetingIsOngoing}
                isEditing={isEditing}
                appendText={t('m')}
                outsideClickProps={{
                  clickOutsideRef: agendaItemRef,
                  onClickOutside: () => setIsEditing(false),
                }}
                minEmptyWidth={40}
                renderSecondaryErrorStyling={!isActiveMeetingPage}
                wordBreak={false}
                css={css`
                  .contentEditable {
                    padding: 0 !important;
                  }
                `}
              />
            )}

            {!meetingIsOngoing && (
              <Menu
                position={'right center'}
                minWidthRems={1}
                maxWidth={`${toREM(40)}`}
                css={css`
                  min-width: ${toREM(40)} !important;
                `}
                content={(close) => (
                  <>
                    <Menu.Item
                      disabled={!canEditMeetingPagesInMeeting.allowed}
                      tooltip={
                        !canEditMeetingPagesInMeeting.allowed
                          ? {
                              msg: canEditMeetingPagesInMeeting.message,
                              position: 'right center',
                            }
                          : undefined
                      }
                      css={css`
                        padding-left: ${(props) =>
                          props.theme.sizes.spacing8} !important;
                        padding-right: ${(props) =>
                          props.theme.sizes.spacing8} !important;
                      `}
                      onClick={(e) => {
                        close(e)
                        setIsEditing(true)
                      }}
                    >
                      <Icon iconName={'editIcon'} iconSize={'lg'} />
                    </Menu.Item>
                    <Menu.Item
                      disabled={
                        isWrapUpPageType ||
                        !canEditMeetingPagesInMeeting.allowed
                      }
                      tooltip={
                        isWrapUpPageType
                          ? {
                              msg: t('You cannot delete this meeting page.'),
                              position: 'right center',
                            }
                          : !canEditMeetingPagesInMeeting.allowed
                            ? {
                                msg: canEditMeetingPagesInMeeting.message,
                                position: 'right center',
                              }
                            : undefined
                      }
                      css={css`
                        padding-left: ${(props) =>
                          props.theme.sizes.spacing8} !important;
                        padding-right: ${(props) =>
                          props.theme.sizes.spacing8} !important;
                      `}
                      onClick={(e) => {
                        close(e)
                        openOverlazy('RemoveMeetingSectionModal', {
                          agendaItem,
                          agendaSection: pageName,
                          onRemoveFieldArrayItem,
                          onUpdateAgendaSections,
                        })
                      }}
                    >
                      <Icon iconName={'trashIcon'} iconSize={'lg'} />
                    </Menu.Item>
                  </>
                )}
              >
                <BtnIcon
                  intent='naked'
                  size='lg'
                  iconProps={{
                    iconName: 'moreVerticalIcon',
                    iconSize: 'lg',
                  }}
                  onClick={() => null}
                  ariaLabel={t('More options')}
                  tag={'button'}
                  className={'show_action_btns_on_hover_button'}
                />
              </Menu>
            )}
          </div>
        </div>
        {meetingIsOngoing && displayTimerBar && props.activePage && (
          <MeetingAgendaTimer
            meetingIsPaused={props.meetingisPaused}
            currentPage={{
              ...agendaItem,
              expectedDurationS: props.activePage.expectedDurationS,
              timer: props.activePage.timer,
            }}
            meetingPages={meetingPages}
            expectedMeetingDurationFromAgendaInMinutes={
              expectedMeetingDurationFromAgendaInMinutes
            }
          />
        )}
      </>
    )
  }
)
