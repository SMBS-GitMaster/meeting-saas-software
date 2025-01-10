import { type Id } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import { ITooltipProps } from '@mm/core-web/ui'

export type DrawerCommentMention = {
  type: 'user'
  userId: Id
}

export interface IDrawerCommentUser {
  id: Id
  firstName: string
  lastName: string
  fullName: string
  avatar: Maybe<string>
  userAvatarColor: UserAvatarColorType
}

export interface IDrawerComment {
  id: Id
  body: string
  author: IDrawerCommentUser
  datePosted: string
  canEditComment: boolean
  canDeleteComment: boolean
}

export interface IDrawerCommentsContainerData {
  ref: React.LegacyRef<HTMLDivElement> | undefined
  users: Array<IDrawerCommentUser>
  className: string | undefined
  comments: Array<IDrawerComment>
  newCommentBody: string
  newCommentMentions: Array<DrawerCommentMention>
  viewOnlyCommentMode?: {
    tooltip: ITooltipProps
  }
}

export interface IDrawerCommentsActionHandlers {
  onDeleteExistingComment: (opts: { commentId: Id }) => Promise<void>
  onEditExistingComment: (opts: {
    commentId: Id
    body: string
  }) => Promise<void>
  onChangeNewComment: (opts: {
    newBody: string
    newMentions?: Array<DrawerCommentMention>
  }) => void
  onPostNewComment: () => Promise<void>
}

export interface IDrawerCommentsViewProps {
  data: IDrawerCommentsContainerData
  actionHandlers: IDrawerCommentsActionHandlers
}

export interface IDrawerCommentsContainerProps {
  meetingId: Maybe<Id>
  commentParentType: string
  commentsRef: React.LegacyRef<HTMLDivElement> | undefined
  className?: string
  parentId: Id
  viewOnlyCommentMode?: {
    tooltip: ITooltipProps
  }
  children: (props: IDrawerCommentsViewProps) => JSX.Element
}
