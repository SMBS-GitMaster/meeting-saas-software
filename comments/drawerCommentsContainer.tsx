import { observer } from 'mobx-react'
import React from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { guessTimezone } from '@mm/core/date'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCommentNode,
  useBloomMeetingNode,
  useBloomUserNode,
} from '@mm/core-bloom'

import {
  DrawerCommentMention,
  IDrawerCommentUser,
  IDrawerCommentsActionHandlers,
  IDrawerCommentsContainerProps,
} from './drawerCommentsTypes'

export default observer(function DrawerCommentsContainer(
  props: IDrawerCommentsContainerProps
) {
  const subscriptionId = `DrawerCommentsContainer-${props.parentId}`
  const [newCommentBody, setNewCommentBody] = React.useState<string>('')
  const [newCommentMentions, setNewCommentMentions] = React.useState<
    Array<DrawerCommentMention>
  >([])
  const meetingNode = useBloomMeetingNode()

  const subscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ settings }) => ({
          settings: settings({ map: ({ timezone }) => ({ timezone }) }),
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
      comments: queryDefinition({
        def: useBloomCommentNode(),
        map: ({ body, id, author, parentId, postedTimestamp }) => ({
          body,
          id,
          parentId,
          postedTimestamp,
          author: author({
            map: ({
              id,
              firstName,
              lastName,
              fullName,
              avatar,
              userAvatarColor,
            }) => ({
              id,
              firstName,
              lastName,
              fullName,
              avatar,
              userAvatarColor,
            }),
          }),
        }),
        // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-465
        // filter: {
        //   parentId: props.parentId,
        // },
        sort: {
          postedTimestamp: { direction: 'asc', priority: 1 },
        },
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
      users: queryDefinition({
        def: useBloomUserNode(),
        map: ({ firstName, lastName, fullName, avatar, userAvatarColor }) => ({
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
      meeting: props.meetingId
        ? queryDefinition({
            def: meetingNode,
            map: ({ attendeesLookup }) => ({
              attendees: attendeesLookup({
                map: ({
                  firstName,
                  lastName,
                  fullName,
                  avatar,
                  userAvatarColor,
                }) => ({
                  firstName,
                  lastName,
                  fullName,
                  avatar,
                  userAvatarColor,
                }),
              }),
            }),
            useSubOpts: { doNotSuspend: true },
            target: { id: props.meetingId },
          })
        : null,
    },
    { subscriptionId }
  )

  const meeting = subscription().data.meeting
  // @TODO_BLOOM: https://tractiontools.atlassian.net/browse/TTD-466
  const usersForMentions: Array<IDrawerCommentUser> =
    props.meetingId && meeting?.attendees.nodes
      ? meeting.attendees.nodes
      : subscription().data.users?.nodes || []

  const onDeleteExistingComment: IDrawerCommentsActionHandlers['onDeleteExistingComment'] =
    React.useCallback(
      // @TODO_BLOOM_TRANSACTIONAL - deleteComment
      async ({ commentId }) => {
        console.log('@TODO_BLOOM_TRANSACTIONAL onDeleteComment', commentId)
      },
      []
    )

  const onEditExistingComment: IDrawerCommentsActionHandlers['onEditExistingComment'] =
    React.useCallback(
      // @TODO_BLOOM_TRANSACTIONAL - editComment

      async ({ commentId, body }) => {
        console.log('@TODO_BLOOM_TRANSACTIONAL onEditComment', commentId, body)
      },
      []
    )

  const onPostNewComment: IDrawerCommentsActionHandlers['onPostNewComment'] =
    React.useCallback(async () => {
      // @TODO_BLOOM_TRANSACTIONAL - createComment

      console.log('@TODO_BLOOM_TRANSACTIONAL onPostNewComment')
      //   await commentsController.postComment({
      //     body: newCommentBody,
      //     mentions: newCommentMentions,
      //     parentId: props.parentId,
      //     commentParentType: props.commentParentType,
      //   })
    }, [])

  const onChangeNewComment: IDrawerCommentsActionHandlers['onChangeNewComment'] =
    React.useCallback(
      // @TODO_BLOOM_TRANSACTIONAL - editComment

      ({ newBody, newMentions }) => {
        setNewCommentBody(newBody)
        newMentions && setNewCommentMentions(newMentions)
      },
      []
    )

  const currentUser = subscription().data.currentUser
  const Component = props.children
  return (
    <Component
      data={{
        comments: (subscription().data.comments?.nodes || []).map(
          (comment) => ({
            ...comment,
            // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-437
            canEditComment: currentUser
              ? currentUser?.id === comment.author.id
              : false, // || currentUser.orgRole === 'ADMIN'
            canDeleteComment: currentUser
              ? currentUser?.id === comment.author.id
              : false, // || currentUser.orgRole === 'ADMIN'
            datePosted: comment.datePosted({
              userTimezone: currentUser?.settings.timezone ?? guessTimezone(),
            }),
          })
        ),
        users: usersForMentions,
        className: props.className,
        ref: props.commentsRef,
        newCommentBody,
        newCommentMentions,
        viewOnlyCommentMode: props.viewOnlyCommentMode,
      }}
      actionHandlers={{
        onDeleteExistingComment,
        onEditExistingComment,
        onPostNewComment,
        onChangeNewComment,
      }}
    />
  )
})
