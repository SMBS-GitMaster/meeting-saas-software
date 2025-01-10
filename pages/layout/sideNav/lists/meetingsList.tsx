import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  type Id,
  NodesCollection,
  ValidSortForNode,
  useSubscription,
} from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { i18n } from '@mm/core/i18n'

import {
  BloomMeetingNode,
  UserAvatarColorType,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomFavoriteMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Icon,
  Link,
  Loading,
  SearchInput,
  TextEllipsis,
  Tooltip,
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
  UserAvatarList,
} from './listLayoutComponents'

const MY_MEETINGS_SORTING_OPTION_TO_TEXT = {
  RECENTLY_VIEWED: i18n.t('Viewed'),
  RECENTLY_CREATED: i18n.t('Created'),
  A_Z: i18n.t('A-Z'),
  Z_A: i18n.t('Z-A'),
  MEETING_TYPE: i18n.t('Meeting type'),
  FAVORITES: i18n.t('Favorites'),
}

const OTHERS_MEETINGS_SORTING_OPTION_TO_TEXT = {
  RECENTLY_VIEWED: i18n.t('Viewed'),
  A_Z: i18n.t('A-Z'),
  Z_A: i18n.t('Z-A'),
}

type MeetingSortingOption =
  | keyof typeof MY_MEETINGS_SORTING_OPTION_TO_TEXT
  | keyof typeof OTHERS_MEETINGS_SORTING_OPTION_TO_TEXT

type MeetingTab = 'MY-MEETINGS' | 'OTHERS-MEETINGS'

const OPTIONS_TO_TEXT_BY_MEETING_TAB: Record<
  MeetingTab,
  Partial<Record<MeetingSortingOption, string>>
> = {
  'MY-MEETINGS': MY_MEETINGS_SORTING_OPTION_TO_TEXT,
  'OTHERS-MEETINGS': OTHERS_MEETINGS_SORTING_OPTION_TO_TEXT,
}

const DEFAULT_SORTING_BY_MEETING_TAB: Record<MeetingTab, MeetingSortingOption> =
  {
    'MY-MEETINGS': 'A_Z',
    'OTHERS-MEETINGS': 'RECENTLY_VIEWED',
  }

const MEETING_QUERY_SORTING_BY_SORTING_OPTION: Record<
  MeetingSortingOption,
  ValidSortForNode<BloomMeetingNode>
> = {
  RECENTLY_VIEWED: {
    lastViewedTimestamp: { direction: 'desc' },
  },
  RECENTLY_CREATED: {
    createdTimestamp: { direction: 'desc' },
  },
  A_Z: {
    name: 'asc',
  },
  Z_A: {
    name: 'desc',
  },
  MEETING_TYPE: {
    meetingType: 'asc',
  },
  FAVORITES: {
    favoritedSortingPosition: { direction: 'desc', priority: 1 },
    favoritedTimestamp: { direction: 'desc', priority: 2 },
  },
}

// @TODO manual sorting https://tractiontools.atlassian.net/browse/TTD-355
export const MeetingsList = observer(function MeetingsList(props: {
  getActions: () => {
    closeList: () => void
  }
}) {
  const pageState = useObservable({
    searchTerm: '',
    activeSorting: DEFAULT_SORTING_BY_MEETING_TAB[
      'MY-MEETINGS'
    ] as MeetingSortingOption,
    activeTab: 'MY-MEETINGS' as MeetingTab,
  })

  const ref = React.useRef<HTMLElement>()

  const { createFavorite, deleteFavorite } = useBloomFavoriteMutations()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  useOnClickOutside(ref, () => {
    props.getActions().closeList()
  })

  const meetingListSubscription = useSubscription(
    {
      user: useAuthenticatedBloomUserQueryDefinition({
        map: ({ meetingsListLookup }) => ({
          attendedMeetings: meetingsListLookup({
            pagination: {
              includeTotalCount: true,
            },
            map: (meetingData) => ({
              name: meetingData.name,
              userIsAttendee: meetingData.userIsAttendee,
              lastViewedTimestamp: meetingData.lastViewedTimestamp,
              createdTimestamp: meetingData.createdTimestamp,
              meetingType: meetingData.meetingType,
              favoriteId: meetingData.favoriteId,
              favoritedSortingPosition: meetingData.favoritedSortingPosition,
              favoritedTimestamp: meetingData.favoritedTimestamp,
              attendees: meetingData.attendeesLookup({
                map: (attendeeData) => ({
                  firstName: attendeeData.firstName,
                  lastName: attendeeData.lastName,
                  fullName: attendeeData.fullName,
                  avatar: attendeeData.avatar,
                  userAvatarColor: attendeeData.userAvatarColor,
                }),
                pagination: {
                  includeTotalCount: true,
                },
              }),
            }),

            filter: {
              and: [
                {
                  userIsAttendee: true,
                },
              ],
              or: [
                {
                  name:
                    pageState.searchTerm !== ''
                      ? { contains: pageState.searchTerm }
                      : undefined,
                  _relational: {
                    attendees:
                      pageState.searchTerm !== ''
                        ? {
                            fullName: {
                              contains: pageState.searchTerm,
                              condition: 'some',
                            },
                          }
                        : undefined,
                  },
                },
              ],
            },
            sort: MEETING_QUERY_SORTING_BY_SORTING_OPTION[
              pageState.activeSorting
            ],
          }),
          otherMeetings: meetingsListLookup({
            pagination: {
              includeTotalCount: true,
            },
            map: (meetingData) => ({
              name: meetingData.name,
              userIsAttendee: meetingData.userIsAttendee,
              lastViewedTimestamp: meetingData.lastViewedTimestamp,
              createdTimestamp: meetingData.createdTimestamp,
              meetingType: meetingData.meetingType,
              favoriteId: meetingData.favoriteId,
              favoritedSortingPosition: meetingData.favoritedSortingPosition,
              favoritedTimestamp: meetingData.favoritedTimestamp,
              attendees: meetingData.attendeesLookup({
                map: (attendeeData) => ({
                  firstName: attendeeData.firstName,
                  lastName: attendeeData.lastName,
                  fullName: attendeeData.fullName,
                  avatar: attendeeData.avatar,
                  userAvatarColor: attendeeData.userAvatarColor,
                }),
                pagination: {
                  includeTotalCount: true,
                },
              }),
            }),
            filter: {
              and: [
                {
                  userIsAttendee: false,
                },
              ],
              or: [
                {
                  name:
                    pageState.searchTerm !== ''
                      ? { contains: pageState.searchTerm }
                      : undefined,
                  _relational: {
                    attendees:
                      pageState.searchTerm !== ''
                        ? {
                            fullName: {
                              contains: pageState.searchTerm,
                              condition: 'some',
                            },
                          }
                        : undefined,
                  },
                },
              ],
            },
            sort: MEETING_QUERY_SORTING_BY_SORTING_OPTION[
              pageState.activeSorting
            ],
          }),
        }),
        useSubOpts: { doNotSuspend: true },
      }),
    },
    {
      subscriptionId: 'MeetingsList',
    }
  )

  const getMeetingsEmptyStateText = useComputed(
    () => {
      const otherMeetingsEmptyStateText =
        pageState.searchTerm !== ''
          ? t('No results found for {{searchTerm}}', {
              searchTerm: pageState.searchTerm,
            })
          : t(`You don't have any meetings you don't belong to yet`)

      const myMeetingsEmptyStateText =
        pageState.searchTerm !== ''
          ? t('No results found for {{searchTerm}}', {
              searchTerm: pageState.searchTerm,
            })
          : t(`You don't have any meetings you are part of yet`)

      return { otherMeetingsEmptyStateText, myMeetingsEmptyStateText }
    },
    { name: 'getMyMeetingsEmptyStateText' }
  )

  const getFavoritesCount = useComputed(
    () => {
      return (
        meetingListSubscription().data.user?.attendedMeetings.nodes || []
      ).reduce((acc, meeting) => {
        return acc + (meeting.favoriteId ? 1 : 0)
      }, 0)
    },
    { name: 'meetingsList-getFavoritesCount' }
  )

  const setActiveTab = useAction((newTab: MeetingTab) => {
    pageState.activeTab = newTab
  })

  const setSorting = useAction((newSorting: MeetingSortingOption) => {
    pageState.activeSorting = newSorting
  })

  const setSearchTerm = useAction((newSearchTerm: string) => {
    pageState.searchTerm = newSearchTerm
  })

  const onTabChange = useAction((newTab: string) => {
    setActiveTab(newTab as MeetingTab)
    setSorting(DEFAULT_SORTING_BY_MEETING_TAB[newTab as MeetingTab])
  })

  const onFavoriteMeeting = useAction(async (meetingId: Id) => {
    try {
      const userId = meetingListSubscription().data.user?.id
      if (userId) {
        await createFavorite({
          parentId: meetingId,
          user: userId,
          parentType: 'Meeting',
          position: 0,
          postedTimestamp: getSecondsSinceEpochUTC(),
        })
      }
      setSorting('FAVORITES')
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t('Issue favoriting this meeting'),
        error: new UserActionError(error),
      })
    }
  })

  const onUnfavoriteMeeting = useAction(async (favoriteId: Id) => {
    try {
      await deleteFavorite({
        favoriteId: favoriteId,
        parentType: 'Meeting',
      })
      setSorting('FAVORITES')
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t('Issue removing meeting as favorite'),
        error: new UserActionError(error),
      })
    }
  })

  const getData = useComputed(
    () => {
      return {
        pageState,
        attendedMeetings:
          meetingListSubscription().data.user?.attendedMeetings.nodes || [],
        otherMeetings:
          meetingListSubscription().data.user?.otherMeetings.nodes || [],
        getMeetingsEmptyStateText,
        getFavoritesCount,
      }
    },
    { name: 'meetingsList-getData' }
  )

  const getMeetingListEntryActions = useComputed(
    () => {
      return {
        favoriteMeeting: onFavoriteMeeting,
        unFavoriteMeeting: onUnfavoriteMeeting,
        onLinkClick: props.getActions().closeList,
      }
    },
    { name: 'meetingsList-getActions' }
  )

  return (
    <SideNavSearcheableList
      ref={ref}
      header={t('Meetings')}
      searchArea={
        <>
          <SearchInput
            css={css`
              flex: 1;
            `}
            id={'side-nav-meeting-list-search'}
            name={'titleOrKeyword'}
            onSearch={setSearchTerm}
            placeholder={t('Search by title or attendee')}
          />
          <SideNavSortButton
            sortingOptions={
              OPTIONS_TO_TEXT_BY_MEETING_TAB[pageState.activeTab] as Record<
                MeetingSortingOption,
                string
              >
            }
            selectedOption={pageState.activeSorting}
            onSetSorting={setSorting}
          />
        </>
      }
      activeTab={pageState.activeTab}
      tabs={
        [
          {
            id: 'MY-MEETINGS',
            title: t('My meetings ({{count}})', {
              count:
                meetingListSubscription().data.user?.attendedMeetings
                  .totalCount ?? 0,
            }),
          },
          {
            id: 'OTHERS-MEETINGS',
            title: t('Others ({{count}})', {
              count:
                meetingListSubscription().data.user?.otherMeetings.totalCount ??
                0,
            }),
          },
        ] as Array<{
          id: MeetingTab
          title: string
        }>
      }
      onTabChange={onTabChange}
      content={
        meetingListSubscription().querying ? (
          <Loading size='small' />
        ) : (
          <MeetingTabContent
            getData={getData}
            getMeetingListEntryActions={getMeetingListEntryActions}
          />
        )
      }
    />
  )
})

const MeetingTabContent = observer(
  (props: {
    getMeetingListEntryActions: () => {
      favoriteMeeting: (meetingId: Id) => Promise<void>
      unFavoriteMeeting: (favoriteId: Id) => Promise<void>
      onLinkClick: () => void
    }
    getData: () => {
      pageState: {
        activeTab: MeetingTab
        activeSorting: MeetingSortingOption
      }
      getMeetingsEmptyStateText: () => {
        myMeetingsEmptyStateText: string
        otherMeetingsEmptyStateText: string
      }
      getFavoritesCount: () => number
      attendedMeetings: Array<{
        name: string
        id: Id
        favoritedTimestamp: Maybe<number>
        favoriteId: Maybe<Id>
        attendees: NodesCollection<{
          TItemType: {
            id: Id
            firstName: string
            lastName: string
            avatar: Maybe<string>
            userAvatarColor: UserAvatarColorType
          }
          TIncludeTotalCount: true
        }>
      }>
      otherMeetings: Array<{
        name: string
        id: Id
        favoritedTimestamp: Maybe<number>
        favoriteId: Maybe<Id>
        attendees: NodesCollection<{
          TItemType: {
            id: Id
            firstName: string
            lastName: string
            avatar: Maybe<string>
            userAvatarColor: UserAvatarColorType
          }
          TIncludeTotalCount: true
        }>
      }>
    }
  }) => {
    const { getData, getMeetingListEntryActions } = props

    const getShouldInsertFavoriteToNonFavoriteSeparator = useComputed(
      () => {
        return (
          getData().pageState.activeTab === 'MY-MEETINGS' &&
          getData().pageState.activeSorting === 'FAVORITES' &&
          getData().attendedMeetings.some(
            (meeting) => meeting.favoriteId != null
          )
        )
      },
      { name: 'meetingTabContent-shouldInsertFavoriteToNonFavoriteSeparator' }
    )

    let hasInsertedFavoriteToNonFavoriteSeparator = false

    const myMeetingsTab =
      (getData().attendedMeetings || []).length === 0 ? (
        <EmptyState
          text={getData().getMeetingsEmptyStateText().myMeetingsEmptyStateText}
        />
      ) : (
        (getData().attendedMeetings || []).map((meeting) => {
          let willInsertFavoriteToNonFavoriteSeparatorBeforeThisRow = false
          if (
            getShouldInsertFavoriteToNonFavoriteSeparator() &&
            !hasInsertedFavoriteToNonFavoriteSeparator
          ) {
            if (!meeting.favoritedTimestamp) {
              hasInsertedFavoriteToNonFavoriteSeparator = true
              willInsertFavoriteToNonFavoriteSeparatorBeforeThisRow = true
            }
          }

          return (
            <React.Fragment key={meeting.id}>
              {willInsertFavoriteToNonFavoriteSeparatorBeforeThisRow && (
                <div
                  css={css`
                    border-bottom: ${toREM(2)} solid
                      ${(props) =>
                        props.theme.colors.sideNavListSeparatorBackground};
                  `}
                ></div>
              )}
              <MeetingListEntry
                getFavoritesCount={getData().getFavoritesCount}
                meeting={meeting}
                getMeetingListEntryActions={getMeetingListEntryActions}
              />
            </React.Fragment>
          )
        })
      )

    const otherMeetingsTab =
      (getData().otherMeetings || []).length === 0 ? (
        <EmptyState
          text={
            getData().getMeetingsEmptyStateText().otherMeetingsEmptyStateText
          }
        />
      ) : (
        (getData().otherMeetings || []).map((meeting) => (
          <MeetingListEntry
            removeOptionToFavorite={true}
            getFavoritesCount={getData().getFavoritesCount}
            key={meeting.id}
            meeting={meeting}
            getMeetingListEntryActions={getMeetingListEntryActions}
          />
        ))
      )

    const contentByTab: Record<MeetingTab, React.ReactNode> = {
      'MY-MEETINGS': myMeetingsTab,
      'OTHERS-MEETINGS': otherMeetingsTab,
    }

    return <>{contentByTab[getData().pageState.activeTab]}</>
  }
)

interface IMeetingListEntryProps {
  getFavoritesCount: () => number
  meeting: {
    name: string
    id: Id
    favoriteId: Maybe<Id>
    attendees: NodesCollection<{
      TItemType: {
        id: Id
        firstName: string
        lastName: string
        avatar: Maybe<string>
        userAvatarColor: UserAvatarColorType
      }
      TIncludeTotalCount: true
    }>
  }
  removeOptionToFavorite?: boolean
  getMeetingListEntryActions: () => {
    favoriteMeeting: (meetingId: Id) => Promise<void>
    unFavoriteMeeting: (favoriteId: Id) => Promise<void>
    onLinkClick: () => void
  }
}

const MeetingListEntry = observer(function MeetingListEntry(
  props: IMeetingListEntryProps
) {
  const isFavoriteMeeting = props.meeting.favoriteId != null
  const { t } = useTranslation()

  const favoriteButton = (
    <button
      type='button'
      title={t('favorite meeting')}
      css={`
        cursor: pointer;
        background: none;
        border: 0;
      `}
      onClick={async () => {
        if (props.getFavoritesCount() >= 4) {
          if (props.meeting.favoriteId)
            await props
              .getMeetingListEntryActions()
              .unFavoriteMeeting(props.meeting.favoriteId)
        } else if (props.meeting.favoriteId) {
          await props
            .getMeetingListEntryActions()
            .unFavoriteMeeting(props.meeting.favoriteId)
        } else {
          await props
            .getMeetingListEntryActions()
            .favoriteMeeting(props.meeting.id)
        }
      }}
    >
      <Icon
        iconName={isFavoriteMeeting ? 'starFullIcon' : 'starEmptyIcon'}
        iconSize='lg'
      />
    </button>
  )

  return (
    <div
      css={css`
        padding: ${(props) =>
          `${props.theme.sizes.spacing8} ${props.theme.sizes.spacing16}`};
        display: flex;
        align-items: center;

        &:hover {
          background: ${(props) =>
            props.theme.colors.sideNavListItemBackgroundHover};

          > .edit-meeting-link {
            visibility: visible;
          }
        }

        &:focus {
          background: ${(props) =>
            props.theme.colors.sideNavListItemBackgroundHover};
        }
      `}
    >
      {!props.removeOptionToFavorite && (
        <>
          {props.getFavoritesCount() >= 4 && props.meeting.favoriteId ? (
            favoriteButton
          ) : (
            <Tooltip
              position='top left'
              trigger={props.getFavoritesCount() >= 4 ? 'click' : 'hover'}
              contentCss={css`
                min-width: ${toREM(232)};
              `}
              msg={
                props.getFavoritesCount() >= 4
                  ? t('Unfavorite a meeting to select a new one')
                  : t('Favorite this meeting to see it in the side bar')
              }
            >
              {favoriteButton}
            </Tooltip>
          )}
        </>
      )}

      <Link
        href={paths.meeting({ meetingId: props.meeting.id })}
        onClick={props.getMeetingListEntryActions().onLinkClick}
      >
        <TextEllipsis
          lineLimit={1}
          type='h4'
          css={css`
            flex: 1;

            ${isFavoriteMeeting &&
            !props.removeOptionToFavorite &&
            css`
              padding-left: ${(props) => props.theme.sizes.spacing4};
            `}
          `}
        >
          {props.meeting.name}
        </TextEllipsis>
      </Link>
      <UserAvatarList
        users={props.meeting.attendees}
        maxNumberOfAvatarsDisplayed={6}
      />
      <Link
        href={paths.meeting({ meetingId: props.meeting.id, tab: 'EDIT' })}
        onClick={props.getMeetingListEntryActions().onLinkClick}
        className='edit-meeting-link'
        css={css`
          visibility: hidden;
          margin-left: ${(props) => props.theme.sizes.spacing8};
        `}
      >
        <Icon iconName='settingsIcon' iconSize='lg' />
      </Link>
    </div>
  )
})
