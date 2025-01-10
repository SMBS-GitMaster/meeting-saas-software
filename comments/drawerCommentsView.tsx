import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { Text, useTheme } from '@mm/core-web/ui'

import { DrawerComment } from './drawerComment'
import { DrawerCommentBox } from './drawerCommentsBox'
import { IDrawerCommentsViewProps } from './drawerCommentsTypes'

export default observer(function DrawerCommentsView(
  props: IDrawerCommentsViewProps
) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <StyledCommentsWrapper>
      <Text className={props.data.className} type={'h4'} weight={'semibold'}>
        {t('Comments')}
      </Text>
      {!props.data.viewOnlyCommentMode && (
        <DrawerCommentBox
          type={'enabled'}
          placeholder={t('Add a comment')}
          isCreateCommentBox={true}
          editing={false}
          value={props.data.newCommentBody}
          onChange={props.actionHandlers.onChangeNewComment}
          onComment={props.actionHandlers.onPostNewComment}
          onCancel={() => null}
          users={props.data.users}
          css={css`
            margin: ${theme.sizes.spacing24} 0 ${theme.sizes.spacing32} 0;
          `}
        />
      )}
      <div ref={props.data.ref} className={props.data.className}>
        {props.data.comments.map((comment) => (
          <React.Fragment key={comment.id}>
            <DrawerComment
              viewOnlyCommentMode={props.data.viewOnlyCommentMode}
              onDeleteComment={props.actionHandlers.onDeleteExistingComment}
              onEditComment={props.actionHandlers.onEditExistingComment}
              users={props.data.users}
              comment={comment}
            />
          </React.Fragment>
        ))}
      </div>
    </StyledCommentsWrapper>
  )
})

const StyledCommentsWrapper = styled.div`
  background-color: ${(props) => props.theme.colors.commentsBackgroundDefault};
  padding: ${(props) => props.theme.sizes.spacing16}
    ${(props) => props.theme.sizes.spacing24};
`
