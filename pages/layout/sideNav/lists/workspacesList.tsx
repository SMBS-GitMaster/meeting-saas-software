import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id, ValidSortForNode, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { i18n } from '@mm/core/i18n'

import {
  BloomWorkspaceNode,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomFavoriteMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Badge,
  Icon,
  Link,
  Loading,
  SearchInput,
  TextEllipsis,
  toREM,
  useOnClickOutside,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { paths } from '@mm/bloom-web/router/paths'

import {
  EmptyState,
  SideNavSearcheableList,
  SideNavSortButton,
} from './listLayoutComponents'

const WORKSPACE_SORTING_OPTION_TO_TEXT = {
  RECENTLY_VIEWED: i18n.t('Viewed'),
  RECENTLY_CREATED: i18n.t('Created'),
  A_Z: i18n.t('A-Z'),
  Z_A: i18n.t('Z-A'),
  FAVORITES: i18n.t('Favorites'),
}

type WorkspaceSortingOption = keyof typeof WORKSPACE_SORTING_OPTION_TO_TEXT

const DEFAULT_SORTING_OPTION: WorkspaceSortingOption = 'A_Z'

const WORKSPACES_QUERY_SORTING_BY_SORTING_OPTION: Record<
  WorkspaceSortingOption,
  ValidSortForNode<BloomWorkspaceNode>
> = {
  RECENTLY_VIEWED: {
    lastViewedTimestamp: 'desc',
  },
  RECENTLY_CREATED: {
    createdTimestamp: 'desc',
  },
  A_Z: {
    name: 'asc',
  },
  Z_A: {
    name: 'desc',
  },
  FAVORITES: {
    favoritedSortingPosition: { direction: 'desc', priority: 1 },
    favoritedTimestamp: { direction: 'desc', priority: 2 },
  },
}

export const WorkspacesList = observer(function WorkspacesList(props: {
  getActions: () => {
    closeList: () => void
  }
}) {
  const pageState = useObservable({
    searchTerm: '',
    activeSorting: DEFAULT_SORTING_OPTION as WorkspaceSortingOption,
  })

  const ref = React.useRef<HTMLElement>()
  useOnClickOutside(ref, () => {
    props.getActions().closeList()
  })
  const { createFavorite, deleteFavorite } = useBloomFavoriteMutations()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { openOverlazy } = useOverlazyController()
  const { t } = useTranslation()

  const workspaceListSubscription = useSubscription(
    {
      user: useAuthenticatedBloomUserQueryDefinition({
        map: ({ settings, workspaces }) => ({
          settings,
          workspaces: workspaces({
            map: ({
              name,
              favoriteId,
              lastViewedTimestamp,
              createdTimestamp,
              favoritedSortingPosition,
              favoritedTimestamp,
              workspaceParentId,
              workspaceType,
            }) => ({
              name,
              favoriteId,
              lastViewedTimestamp,
              createdTimestamp,
              favoritedSortingPosition,
              favoritedTimestamp,
              workspaceParentId,
              workspaceType,
            }),
            sort: WORKSPACES_QUERY_SORTING_BY_SORTING_OPTION[
              pageState.activeSorting
            ],
            filter: {
              and: [
                {
                  name:
                    pageState.searchTerm !== ''
                      ? { contains: pageState.searchTerm }
                      : undefined,
                },
              ],
            },
          }),
        }),
        useSubOpts: { doNotSuspend: true },
      }),
    },
    {
      subscriptionId: `WorkspacesList`,
    }
  )

  const getEmptyStateText = useComputed(
    () => {
      return pageState.searchTerm !== ''
        ? t('No results found for {{searchTerm}}', {
            searchTerm: pageState.searchTerm,
          })
        : t(`You don't have any workspaces yet`)
    },
    { name: 'workspaceList-getEmptyStateText' }
  )

  const setSearchTerm = useAction((searchTerm: string) => {
    pageState.searchTerm = searchTerm
  })

  const setSorting = useAction((sorting: WorkspaceSortingOption) => {
    pageState.activeSorting = sorting
  })

  const onFavoriteWorkspace = useAction(async (workspaceId: Id) => {
    try {
      const userId = workspaceListSubscription().data.user?.id
      if (userId) {
        await createFavorite({
          parentId: workspaceId,
          user: userId,
          parentType: 'Workspace',
          position: 0,
          postedTimestamp: getSecondsSinceEpochUTC(),
        })
      }
      setSorting('FAVORITES')
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t('Issue favoriting this workspace'),
        error: new UserActionError(error),
      })
    }
  })

  const onUnfavoriteWorkspace = useAction(async (favoriteId: Id) => {
    try {
      await deleteFavorite({
        favoriteId: favoriteId,
        parentType: 'Workspace',
      })
      setSorting('FAVORITES')
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t('Issue removing workspace as favorite'),
        error: new UserActionError(error),
      })
    }
  })

  const getWorkspaceListEntryActions = useComputed(
    () => {
      return {
        favoriteWorkspace: onFavoriteWorkspace,
        unFavoriteWorkspace: onUnfavoriteWorkspace,
        onLinkClick: props.getActions().closeList,
      }
    },
    { name: 'workspaceList-getWorkspaceListEntryActions' }
  )

  const getShouldInsertFavoriteToNonFavoriteSeparator = useComputed(
    () => {
      return (
        pageState.activeSorting === 'FAVORITES' &&
        (workspaceListSubscription().data.user?.workspaces.nodes || []).some(
          (workspace) => workspace.favoriteId != null
        )
      )
    },
    { name: 'workspaceList-getShouldInsertFavoriteToNonFavoriteSeparator' }
  )

  let hasInsertedFavoriteToNonFavoriteSeparator = false

  return (
    <SideNavSearcheableList
      ref={ref}
      header={t('Workspaces')}
      searchArea={
        <>
          <SearchInput
            css={css`
              flex: 1;
            `}
            id={'side-nav-workspace-list-search'}
            name={'titleOrKeyword'}
            onSearch={setSearchTerm}
            placeholder={t('Search by title or keyword')}
          />
          <SideNavSortButton
            sortingOptions={
              WORKSPACE_SORTING_OPTION_TO_TEXT as Record<
                WorkspaceSortingOption,
                string
              >
            }
            selectedOption={pageState.activeSorting}
            onSetSorting={setSorting}
          />
        </>
      }
      content={
        workspaceListSubscription().querying ? (
          <Loading size='small' />
        ) : (
          <>
            {(workspaceListSubscription().data.user?.workspaces.nodes || [])
              .length === 0 ? (
              <EmptyState text={getEmptyStateText()} />
            ) : (
              (
                workspaceListSubscription().data.user?.workspaces.nodes || []
              ).map((workspace) => {
                let willInsertFavoriteToNonFavoriteSeparatorBeforeThisRow =
                  false

                if (
                  !hasInsertedFavoriteToNonFavoriteSeparator &&
                  getShouldInsertFavoriteToNonFavoriteSeparator()
                ) {
                  if (workspace.favoriteId === null) {
                    hasInsertedFavoriteToNonFavoriteSeparator = true
                    willInsertFavoriteToNonFavoriteSeparatorBeforeThisRow = true
                  }
                }
                return (
                  <React.Fragment key={workspace.id}>
                    {willInsertFavoriteToNonFavoriteSeparatorBeforeThisRow && (
                      <div
                        css={css`
                          border-bottom: ${toREM(2)} solid
                            ${(props) =>
                              props.theme.colors
                                .sideNavListSeparatorBackground};
                        `}
                      ></div>
                    )}
                    <WorkspaceListEntry
                      key={workspace.id}
                      workspace={workspace}
                      link={paths.workspace({
                        isMeetingWorkspace:
                          workspace.workspaceType === 'MEETING',
                        workspaceId:
                          workspace.workspaceType === 'MEETING'
                            ? (workspace.workspaceParentId as Id)
                            : workspace.id,
                      })}
                      isPrimaryWorkspace={
                        workspace.id ===
                        workspaceListSubscription().data.user?.settings
                          .workspaceHomeId
                      }
                      getWorkspaceListEntryActions={
                        getWorkspaceListEntryActions
                      }
                    />
                  </React.Fragment>
                )
              })
            )}
          </>
        )
      }
    />
  )
})

interface IWorkspaceListEntryProps {
  workspace: {
    id: Id
    name: string
    favoriteId: Maybe<Id>
  }
  link: string
  isPrimaryWorkspace: boolean
  getWorkspaceListEntryActions: () => {
    favoriteWorkspace: (workspaceId: Id) => Promise<void>
    unFavoriteWorkspace: (favoriteId: Id) => Promise<void>
    onLinkClick: () => void
  }
}

const WorkspaceListEntry = observer((props: IWorkspaceListEntryProps) => {
  const { t } = useTranslation()

  const { workspace, link, getWorkspaceListEntryActions } = props

  return (
    <div
      css={css`
        align-items: center;
        display: flex;
        justify-content: space-between;
      `}
    >
      <div
        css={css`
          align-items: center;
          display: flex;
          padding: ${(props) =>
            `${props.theme.sizes.spacing8} ${props.theme.sizes.spacing16}`};

          &:hover {
            background: ${(props) =>
              props.theme.colors.sideNavListItemBackgroundHover};
          }

          &:focus {
            background: ${(props) =>
              props.theme.colors.sideNavListItemBackgroundHover};
          }
        `}
      >
        <button
          title={t('favorite item')}
          type='button'
          onClick={async () => {
            if (workspace.favoriteId) {
              await getWorkspaceListEntryActions().unFavoriteWorkspace(
                workspace.favoriteId
              )
            } else {
              await getWorkspaceListEntryActions().favoriteWorkspace(
                workspace.id
              )
            }
          }}
          css={`
            cursor: pointer;
            background: none;
            border: 0;
          `}
        >
          <Icon
            iconName={workspace.favoriteId ? 'starFullIcon' : 'starEmptyIcon'}
            iconSize='lg'
          />
        </button>
        <Link href={link} onClick={getWorkspaceListEntryActions().onLinkClick}>
          <TextEllipsis
            lineLimit={1}
            type='h4'
            css={css`
              flex: 1;

              ${workspace.favoriteId != null &&
              css`
                padding-left: ${(props) => props.theme.sizes.spacing4};
              `}
            `}
          >
            {workspace.name}
          </TextEllipsis>
        </Link>
      </div>
      {props.isPrimaryWorkspace && (
        <Badge
          intent='info'
          text={t('Primary')}
          textType={'small'}
          css={css`
            margin-right: ${(prop) => prop.theme.sizes.spacing12};
          `}
        />
      )}
    </div>
  )
})
