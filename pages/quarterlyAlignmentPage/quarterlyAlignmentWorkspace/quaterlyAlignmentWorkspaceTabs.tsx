import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Clickable, TextEllipsis, toREM, useTheme } from '@mm/core-web/ui'

import { QUATERLY_ALIGNMENT_WORKSPACE_TABS } from './lookups'
import {
  IQuarterlyAlignmentWorkspaceActions,
  IQuarterlyAlignmentWorkspaceData,
} from './quarterlyAlignmentWorkspaceTypes'

export const QuarterlyAlignmentWorkspaceTabs = observer(
  (props: {
    data: () => Pick<IQuarterlyAlignmentWorkspaceData, 'pageState'>
    actions: () => Pick<
      IQuarterlyAlignmentWorkspaceActions,
      'onHandleSetCurrentTab'
    >
  }) => {
    const theme = useTheme()
    return (
      <div
        css={css`
          padding-left: ${theme.sizes.spacing24};
        `}
      >
        {QUATERLY_ALIGNMENT_WORKSPACE_TABS.map((tab) => (
          <Clickable
            key={tab.value}
            clicked={() => props.actions().onHandleSetCurrentTab(tab.value)}
          >
            <div
              css={css`
                display: flex;
                justify-content: flex-start;
                align-items: flex-end;
                height: ${toREM(32)};
                margin: ${theme.sizes.spacing4} ${theme.sizes.spacing32} 0 0;

                ${tab.value === props.data().pageState.currentTab
                  ? css`
                      border-bottom: ${({ theme }) =>
                          theme.sizes.mediumSolidBorder}
                        ${({ theme }) => theme.colors.cardActiveTabBorderColor};
                    `
                  : css`
                      border-bottom: ${({ theme }) =>
                          theme.sizes.mediumSolidBorder}
                        transparent;

                      @media print {
                        display: none;
                      }
                    `}
              `}
            >
              <TextEllipsis
                lineLimit={1}
                weight='semibold'
                type='body'
                color={
                  tab.value !== props.data().pageState.currentTab
                    ? { color: theme.colors.cardInactiveTabTextColor }
                    : { color: theme.colors.bodyTextDefault }
                }
              >
                {tab.text}
              </TextEllipsis>
            </div>
          </Clickable>
        ))}
      </div>
    )
  }
)
