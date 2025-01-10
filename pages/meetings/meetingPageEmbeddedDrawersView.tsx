import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { Id } from '@mm/gql'

import {
  EMeetingPageType,
  MEETING_PAGES_WITH_EMBEDDED_DRAWERS,
  UserDrawerViewType,
  getMeetingPageToEmptyEmbeddedDrawerStateText,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import {
  DRAWER_PORTAL_ELEMENT_ID,
  Text,
  useDrawerController,
  useTheme,
} from '@mm/core-web/ui'

interface IMeetingPageEmbeddedDrawerViewProps {
  drawerView: UserDrawerViewType
  showEmbeddedDrawerOrPlaceholder: boolean
  pageToDisplayData: Maybe<{
    id: Id
    pageType: EMeetingPageType
  }>
}

export const MeetingPageEmbeddedDrawerView = observer(
  function MeetingPageEmbeddedDrawerView(
    props: IMeetingPageEmbeddedDrawerViewProps
  ) {
    const theme = useTheme()
    const terms = useBloomCustomTerms()
    const MEETING_PAGE_TO_EMPTY_EMBEDDED_DRAWER_STATE_TEXT =
      getMeetingPageToEmptyEmbeddedDrawerStateText(terms)
    const { activeDrawerId } = useDrawerController()

    const { drawerView, pageToDisplayData, showEmbeddedDrawerOrPlaceholder } =
      props

    const showDrawerPlaceholder =
      !activeDrawerId &&
      drawerView === 'EMBEDDED' &&
      pageToDisplayData &&
      MEETING_PAGES_WITH_EMBEDDED_DRAWERS.includes(pageToDisplayData.pageType)

    return (
      <div
        id={DRAWER_PORTAL_ELEMENT_ID}
        css={css`
          ${showEmbeddedDrawerOrPlaceholder &&
          css`
            min-width: 0;
            margin-left: ${theme.sizes.spacing16};

            height: 100%;
          `}
        `}
      >
        {showDrawerPlaceholder && (
          <MeetingDrawerPlaceholder>
            <Text type={'body'}>
              {
                MEETING_PAGE_TO_EMPTY_EMBEDDED_DRAWER_STATE_TEXT[
                  pageToDisplayData.pageType
                ]
              }
            </Text>
          </MeetingDrawerPlaceholder>
        )}
      </div>
    )
  }
)

const MeetingDrawerPlaceholder = styled.div`
  flex: 1;
  min-width: 0;
  text-align: center;
  border: ${(props) => props.theme.sizes.smallSolidBorder}
    ${(props) => props.theme.colors.cardBorderColor};
  background: ${(props) => props.theme.colors.cardBackgroundColor};
  border-radius: ${(props) => props.theme.sizes.br1};
  box-shadow: ${(props) => props.theme.sizes.bs1};
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
