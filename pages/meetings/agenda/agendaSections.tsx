import { observer } from 'mobx-react'
import React, { useLayoutEffect } from 'react'
import { css } from 'styled-components'

import { type Id, NodesCollection } from '@mm/gql'

import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  formValidators,
  matchesRegex,
  maxLength,
  required,
} from '@mm/core/forms'
import { useDocument } from '@mm/core/ssr'

import { EMeetingPageType } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { Tooltip, useSortable } from '@mm/core-web/ui'

import { useComputed } from '../../performance/mobx'
import { IMeetingPageViewActionHandlers } from '../meetingPageTypes'
import {
  IMeetingAgendaActionHandlers,
  IMeetingAgendaViewData,
  IMeetingPage,
} from './agendaCardTypes'
import {
  AGENDA_SORTABLE_PAGES_ID,
  AGENDA_SORTABLE_PAGES_ITEM_CLASS,
  SECTION_NAME_CHAR_LIMIT,
} from './agendaConsts'
import { AgendaSectionItem } from './agendaSectionItem'

interface IAgendaSectionProps {
  getData: () => {
    activePage: Maybe<{
      id: Id
      pageType: EMeetingPageType
      expectedDurationS: number
      timer: {
        timeLastPaused: Maybe<number>
        timeLastStarted: number
        timePreviouslySpentS: Maybe<number>
        timeSpentPausedS: number
      }
    }>
    isLoading: boolean
    sections: NodesCollection<{
      TItemType: IMeetingPage
      TIncludeTotalCount: true
    }>
    expectedMeetingDurationFromAgendaInMinutes: number
    currentMeetingInstance: IMeetingAgendaViewData['currentMeetingInstance']
    permissions: IMeetingAgendaViewData['currentUser']['permissions']
    activeLeaderPageId: Maybe<Id>
    meetingPageNavigationStatus: IMeetingAgendaViewData['meetingPageNavigationStatus']
  }
  getActionHandlers: () => {
    onUpdateMeetingPageOrder: IMeetingAgendaActionHandlers['onUpdateMeetingPageOrder']
    onUpdateAgendaSections: IMeetingAgendaActionHandlers['onUpdateAgendaSections']
    onSetCurrentUserPage: IMeetingPageViewActionHandlers['onSetCurrentPage']
  }
}

export type AgendaSectionFormValues = {
  agendaSections: Array<{
    expectedDurationM: string
    pageName: string
    id: Id
  }>
}

export const AgendaSections = observer((props: IAgendaSectionProps) => {
  const document = useDocument()

  const { t } = useTranslation()

  const getFormValues = useComputed(
    () => {
      return {
        agendaSections: props.getData().sections.nodes.map((section) => {
          const expectedDurationM = Math.floor(section.expectedDurationS / 60)
          return {
            expectedDurationM: String(expectedDurationM),
            pageName: section.pageName,
            id: section.id,
          }
        }),
      }
    },
    {
      name: `AgendaSections.getFormValues`,
    }
  )

  const getRecordOfPageIdToPageToPageWasVisitedInAnOngoingMeeting = useComputed(
    () => {
      const { currentMeetingInstance, sections } = props.getData()
      if (!currentMeetingInstance) {
        return {}
      } else {
        return (sections.nodes || []).reduce(
          (acc, { id, timer }) => {
            const hasPageBeenVisited = !!timer.timeLastStarted
            acc[id] = hasPageBeenVisited
            return acc
          },
          {} as Record<string, boolean>
        )
      }
    },
    {
      name: `AgendaSections.getRecordOfPageIdToPageToPageWasVisitedInAnOngoingMeeting`,
    }
  )

  const { createSortable } = useSortable({
    sorter: async (oldIndex, newIndex, sortedItem) => {
      if (!sortedItem) return

      const meetingPageId = Number(sortedItem.id)

      await props.getActionHandlers().onUpdateMeetingPageOrder({
        oldIndex,
        newIndex,
        meetingPageId,
      })
    },
    sortableOptions: {
      disabled: !props.getData().permissions.canEditMeetingPagesInMeeting,
      handle: `.${AGENDA_SORTABLE_PAGES_ITEM_CLASS}`,
    },
  })

  useLayoutEffect(() => {
    const agendaSectionsContainer = document.getElementById(
      AGENDA_SORTABLE_PAGES_ID
    )

    if (props.getData().sections.totalCount > 0 && agendaSectionsContainer) {
      createSortable(agendaSectionsContainer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      id={AGENDA_SORTABLE_PAGES_ID}
      css={css`
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        width: 100%;
      `}
    >
      <EditForm
        isLoading={props.getData().isLoading}
        disabled={
          !props.getData().permissions.canEditMeetingPagesInMeeting.allowed
        }
        disabledTooltip={undefined}
        values={getFormValues() as AgendaSectionFormValues}
        validation={
          {
            agendaSections: formValidators.arrayOfNodes({
              additionalRules: [required()],
            }),
          } satisfies GetParentFormValidation<AgendaSectionFormValues>
        }
        onSubmit={props.getActionHandlers().onUpdateAgendaSections}
      >
        {({ fieldNames }) => (
          <FormFieldArray<{
            parentFormValues: AgendaSectionFormValues
            arrayFieldName: typeof fieldNames.agendaSections
          }>
            name={fieldNames.agendaSections}
            validation={{
              pageName: formValidators.string({
                additionalRules: [
                  required(),
                  maxLength({ maxLength: SECTION_NAME_CHAR_LIMIT }),
                ],
              }),
              expectedDurationM: formValidators.string({
                additionalRules: [
                  required(),
                  maxLength({ maxLength: 3 }),
                  matchesRegex(/[0-9]/, t('Please enter a valid number')),
                ],
              }),
            }}
          >
            {({
              values,
              fieldArrayPropNames,
              onRemoveFieldArrayItem,
              generateFieldName,
            }) => (
              <>
                {values.map((item) => {
                  return (
                    <Tooltip
                      key={item.id}
                      msg={props.getData().meetingPageNavigationStatus.message}
                    >
                      <div
                        id={`${item.id}`}
                        tabIndex={0}
                        role='button'
                        onClick={() => {
                          const activePage = props.getData().activePage
                          if (
                            props.getData().meetingPageNavigationStatus
                              .disabled ||
                            !activePage
                          )
                            return
                          props.getActionHandlers().onSetCurrentUserPage({
                            newPageId: item.id,
                            currentPageId: activePage.id,
                          })
                        }}
                        onKeyDown={() => {
                          const activePage = props.getData().activePage
                          if (
                            props.getData().meetingPageNavigationStatus
                              .disabled ||
                            !activePage
                          )
                            return
                          props.getActionHandlers().onSetCurrentUserPage({
                            newPageId: item.id,
                            currentPageId: activePage.id,
                          })
                        }}
                      >
                        <AgendaSectionItem
                          meetingisPaused={
                            props.getData().currentMeetingInstance?.isPaused ||
                            false
                          }
                          activePage={props.getData().activePage}
                          fieldArrayPropNames={fieldArrayPropNames}
                          isActiveMeetingPage={
                            // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2771
                            `${props.getData().activePage?.id}` === `${item.id}`
                          }
                          displayTimerBar={
                            // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2771
                            `${props.getData().activePage?.id}` === `${item.id}`
                          }
                          meetingIsOngoing={
                            !!props.getData().currentMeetingInstance
                          }
                          meetingPageNavigationStatus={
                            props.getData().meetingPageNavigationStatus
                          }
                          agendaItem={item}
                          canEditMeetingPagesInMeeting={
                            props.getData().permissions
                              .canEditMeetingPagesInMeeting
                          }
                          meetingPages={props.getData().sections}
                          pageName={item.pageName}
                          expectedMeetingDurationFromAgendaInMinutes={
                            props.getData()
                              .expectedMeetingDurationFromAgendaInMinutes
                          }
                          hasCurrentPageBeenVisitedInAnOngoingMeeting={
                            !!getRecordOfPageIdToPageToPageWasVisitedInAnOngoingMeeting()[
                              item.id
                            ]
                          }
                          generateFieldName={generateFieldName}
                          onUpdateAgendaSections={
                            props.getActionHandlers().onUpdateAgendaSections
                          }
                          onRemoveFieldArrayItem={onRemoveFieldArrayItem}
                        />
                      </div>
                    </Tooltip>
                  )
                })}
              </>
            )}
          </FormFieldArray>
        )}
      </EditForm>
    </div>
  )
})
