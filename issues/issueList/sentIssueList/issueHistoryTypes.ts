import { type Id, NodesCollection } from '@mm/gql'

import { TIssueEventType } from '@mm/core-bloom'

export type TimelineItemForIssues = {
  dateCreated: number
  eventType: TIssueEventType
  id: Id
  meeting: { id: Id; name: string }
}

export interface ITimelineStringForIssuesProps {
  className?: string
  timezone: string
  issueId: Id
  currentMeetingId: Id
  timelineItems: NodesCollection<{
    TItemType: TimelineItemForIssues
    TIncludeTotalCount: false
  }>
}

export interface IIssueHistorySentFromProps
  extends ITimelineStringForIssuesProps {
  issueMovedLastTimeLine: TimelineItemForIssues
}
