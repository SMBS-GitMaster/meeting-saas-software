import { observer } from 'mobx-react'
import React, { useEffect, useMemo, useState } from 'react'
import { css } from 'styled-components'

import { UnreachableCaseError } from '@mm/core/exceptions/switch'

import { Card, Loading, useResizeObserver } from '@mm/core-web/ui'

import { CompletedIssueList } from './completedIssueList'
import { IssueListHeader } from './issueListHeader'
import {
  EIssueListColumnSize,
  IIssueListViewCommonProps,
  TIssueListResponsiveSize,
} from './issueListTypes'
import { LongTermIssueList } from './longTermIssueList'
import { SentIssueList } from './sentIssueList'
import { ShortTermIssueList } from './shortTermIssueList'

export const IssueListView = observer(function IssueListView(
  props: IIssueListViewCommonProps
) {
  const [issueListEl, setIssueListEl] = useState<Maybe<HTMLDivElement>>(null)

  const { width, ready } = useResizeObserver(issueListEl)

  const responsiveSize: TIssueListResponsiveSize = useMemo(() => {
    if (!ready) return 'UNKNOWN'
    if (width <= 400) return 'SMALL'
    if (width <= 800) return 'MEDIUM'
    return 'LARGE'
  }, [width, ready])

  const getIssuesList = () => {
    const tab = props.getData().selectedIssueTab
    if (tab === 'SHORT_TERM') {
      return (
        <ShortTermIssueList
          getData={props.getData}
          responsiveSize={responsiveSize}
          getActionHandlers={props.getActionHandlers}
        />
      )
    } else if (tab === 'LONG_TERM') {
      return (
        <LongTermIssueList
          getData={props.getData}
          responsiveSize={responsiveSize}
          getActionHandlers={props.getActionHandlers}
        />
      )
    } else if (tab === 'RECENTLY_SOLVED') {
      return (
        <CompletedIssueList
          getData={props.getData}
          responsiveSize={responsiveSize}
          getActionHandlers={props.getActionHandlers}
        />
      )
    } else if (tab === 'SENT_TO') {
      return (
        <SentIssueList
          getData={props.getData}
          responsiveSize={responsiveSize}
          getActionHandlers={props.getActionHandlers}
        />
      )
    } else {
      throw new UnreachableCaseError(tab)
    }
  }

  const setIssueListColumnSize =
    props.getActionHandlers().setIssueListColumnSize
  useEffect(() => {
    if (responsiveSize !== 'LARGE') {
      setIssueListColumnSize(EIssueListColumnSize.One)
    }
  }, [responsiveSize, setIssueListColumnSize])

  return (
    <Card
      ref={setIssueListEl}
      className={props.className}
      css={css`
        ${props.getData().pageType === 'WORKSPACE' &&
        css`
          height: 100%;
        `}
      `}
    >
      <IssueListHeader
        data={props.getData()}
        responsiveSize={responsiveSize}
        actionHandlers={props.getActionHandlers()}
      />
      <React.Suspense
        fallback={
          <Loading
            size='small'
            css={css`
              padding: ${(props) => props.theme.sizes.spacing24};
            `}
          />
        }
      >
        {getIssuesList()}
      </React.Suspense>
    </Card>
  )
})
