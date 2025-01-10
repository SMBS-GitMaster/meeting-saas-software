import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useWindow } from '@mm/core/ssr'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useBloomHeadlineMutations } from '@mm/core-bloom/headlines/mutations'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'
import { useHeaderListMoreOptions } from '@mm/bloom-web/shared'

import { HEALDINES_LIST_SORT_BY_OPTS } from './headlineListConstants'
import { getHeadlinesListPermissions } from './headlinesListPermissions'
import {
  HeadlinesListSortingType,
  IHeadlinesListActionHandlers,
  IHeadlinesListContainerProps,
} from './headlinesListTypes'

export const HeadlinesListContainer = observer(function HeadlinesListContainer(
  props: IHeadlinesListContainerProps
) {
  const pageState = useObservable({
    sortBy: 'ASSIGNEE_ASC' as HeadlinesListSortingType,
  })

  const terms = useBloomCustomTerms()
  const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
  const { checkIfEmbeddedDrawerIsAvailable } = useDrawerController()
  const { closeOverlazy, openOverlazy } = useOverlazyController()

  const { createHeadline } = useBloomHeadlineMutations()
  const { editWorkspaceTile } = useBloomWorkspaceMutations()
  const { t } = useTranslation()
  const { v1Url } = useBrowserEnvironment()
  const { window } = useWindow()

  const meetingId = props.meetingId

  const getBreadcrumbs = useComputed(
    () => {
      const getPageToDisplayData = props.getPageToDisplayData()

      return getPageToDisplayData
        ? [getPageToDisplayData.pageName]
        : [terms.headline.plural]
    },
    { name: 'headlineListContainer-breadcrumbs' }
  )

  const isExpandedOnWorkspacePage =
    activeFullScreenTileId !== null &&
    activeFullScreenTileId === props.workspaceTileId

  const subscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ id }) => ({
          id,
        }),
      }),
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({ name, meetingType, currentMeetingAttendee, headlines }) => ({
          name,
          meetingType,
          currentMeetingAttendee: currentMeetingAttendee({
            map: ({ permissions }) => ({
              permissions: permissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
          }),
          headlines: headlines({
            map: ({
              title,
              archived,
              archivedTimestamp,
              dateCreated,
              notesId,
              assignee,
            }) => ({
              title,
              archived,
              dateCreated,
              archivedTimestamp,
              notesId,
              assignee: assignee({
                map: ({
                  firstName,
                  lastName,
                  avatar,
                  userAvatarColor,
                  fullName,
                }) => ({
                  firstName,
                  lastName,
                  avatar,
                  userAvatarColor,
                  fullName,
                }),
              }),
            }),
            filter: {
              and: [
                {
                  archived: false,
                },
              ],
            },
            sort: {
              ...HEALDINES_LIST_SORT_BY_OPTS[pageState.sortBy],
            },
          }),
        }),
        target: { id: meetingId },
      }),
    },
    {
      subscriptionId: `HeadlinesListContainer-${meetingId}`,
    }
  )

  const setSortBy = useAction((sortBy: HeadlinesListSortingType) => {
    pageState.sortBy = sortBy
  })

  const listHeaderMoreOptions = useHeaderListMoreOptions({
    id: subscription().data.meeting.id,
    meetingType: subscription().data.meeting.meetingType,
  })

  const getCurrentUserPermissions = useComputed(
    () => {
      return getHeadlinesListPermissions(
        subscription().data.meeting?.currentMeetingAttendee.permissions ?? null
      )
    },
    { name: 'headlineListContainer-getCurrentUserPermissions' }
  )

  const onOpenV1ArchiveViewInNewTab: IHeadlinesListActionHandlers['onOpenV1ArchiveViewInNewTab'] =
    useAction(() => {
      window.open(
        `${v1Url}L10/Details/${subscription().data.meeting.id}#/Headlines`,
        '_blank'
      )
    })

  const onExport: IHeadlinesListActionHandlers['onExport'] = useAction(() => {
    listHeaderMoreOptions.onExport()
  })

  const onUpload: IHeadlinesListActionHandlers['onUpload'] = useAction(() => {
    listHeaderMoreOptions.onUpload('headlines')
  })

  const onPrint: IHeadlinesListActionHandlers['onPrint'] = useAction(() => {
    listHeaderMoreOptions.onPrint('headlines')
  })

  const onCreateContextAwareIssueFromHeadline: IHeadlinesListActionHandlers['onCreateContextAwareIssueFromHeadline'] =
    useAction((opts) => {
      openOverlazy('CreateIssueDrawer', {
        meetingId: subscription().data.meeting.id,
        context: opts,
        initialItemValues: {
          title: opts.title,
        },
      })
    })

  const onCreateContextAwareTodoFromHeadline: IHeadlinesListActionHandlers['onCreateContextAwareTodoFromHeadline'] =
    useAction((opts) => {
      openOverlazy('CreateTodoDrawer', {
        context: opts,
        meetingId: subscription().data.meeting.id,
      })
    })

  const onCopy: IHeadlinesListActionHandlers['onCopy'] = useAction(
    ({ meetingId, headlineToCopyId }) => {
      openOverlazy('CopyHeadlineToMeetingsModal', {
        currentMeetingId: meetingId,
        headlineToCopyId,
      })
    }
  )

  const onQuickAddValueEnter: IHeadlinesListActionHandlers['onQuickAddValueEnter'] =
    useAction(async (headlineTitle) => {
      try {
        await createHeadline({
          title: headlineTitle,
          archived: false,
          archivedTimestamp: null,
          assignee: subscription().data.currentUser.id,
          meetings: [subscription().data.meeting.id],
          notesId: null,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to create {{headline}}', {
            headline: terms.headline.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    })

  const onSelectSorting: IHeadlinesListActionHandlers['onSelectSorting'] =
    useAction((value) => {
      setSortBy(value)
    })

  const onEditHeadlineRequest: IHeadlinesListActionHandlers['onEditHeadlineRequest'] =
    useAction((headlineId) => {
      openOverlazy('EditHeadlineDrawer', {
        meetingId: subscription().data.meeting.id,
        headlineId,
      })
    })

  const onDeleteTile: IHeadlinesListActionHandlers['onDeleteTile'] = useAction(
    async () => {
      if (props.workspaceTileId) {
        try {
          await editWorkspaceTile({
            id: props.workspaceTileId,
            meetingId: null,
            archived: true,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue deleting the tile`),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    }
  )

  useEffect(() => {
    if (checkIfEmbeddedDrawerIsAvailable()) {
      const headlineId = subscription().data.meeting?.headlines.nodes.length
        ? subscription().data.meeting?.headlines.nodes[0].id
        : null

      if (!headlineId) {
        return closeOverlazy({ type: 'Drawer' })
      }

      openOverlazy('EditHeadlineDrawer', {
        meetingId,
        headlineId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getData = useComputed(
    () => {
      return {
        headlines: subscription().data.meeting.headlines.nodes,
        isExpandedOnWorkspacePage,
        getBreadcrumbs,
        getCurrentUserPermissions,
        meetingId,
        meetingName: subscription().data.meeting.name,
        pageState,
        pageType: props.pageType || 'MEETING',
        workspaceType: props.workspaceType || 'MEETING',
        workspaceTileId: props.workspaceTileId,
      }
    },
    { name: 'headlineListContainer-getData' }
  )

  const getActions = useComputed(
    () => {
      return {
        onOpenV1ArchiveViewInNewTab,
        onExport,
        onUpload,
        onPrint,
        onSelectSorting,
        onCreateContextAwareIssueFromHeadline,
        onCreateContextAwareTodoFromHeadline,
        onCopy,
        onQuickAddValueEnter,
        onEditHeadlineRequest,
        onDeleteTile,
      }
    },
    {
      name: 'headlineListContainer-getActions',
    }
  )

  const HeadLinesListView = (
    <props.children
      className={props.className}
      getData={getData}
      getActions={getActions}
    />
  )

  if (isExpandedOnWorkspacePage) {
    return (
      <WorkspaceFullScreenTilePortal>
        {HeadLinesListView}
      </WorkspaceFullScreenTilePortal>
    )
  } else {
    return HeadLinesListView
  }
})
