import React from 'react'
import { css } from 'styled-components'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useTranslation } from '@mm/core-web/i18n'
import { Card, toREM } from '@mm/core-web/ui'

import { ExternalPageBrokenLink } from '../externalPage/externalPageBrokenLink'
import { ExternalPageSectionIframe } from '../externalPage/externalPageSectionIframe'
import { EmbedPageContainer } from '../externalPage/externalPageSectionView'
import { IWhiteboardSectionProps } from './whiteboardSectionType'

export const WhiteboardSectionView = (props: IWhiteboardSectionProps) => {
  const { v1Url } = useBrowserEnvironment()
  const { t } = useTranslation()
  const [isUrlValid, setIsUrlValid] = React.useState<boolean>(true)

  const iFrameLink = `${v1Url}L10/whiteboard/${props.data.meetingId}?noheading=true#/`

  React.useEffect(() => {
    const fetchIfEmbeddable = async (currentUrl: string) => {
      const response =
        await props.actionHandlers.onCheckIfUrlIsEmbeddable(currentUrl)
      return response
    }

    fetchIfEmbeddable(iFrameLink)
      .then(setIsUrlValid)
      .catch(() => {
        setIsUrlValid(false)
      })
  }, [iFrameLink]) // eslint-disable-line

  const renderBodyContent = React.useMemo(() => {
    if (!isUrlValid) {
      return (
        <EmbedPageContainer>
          <ExternalPageBrokenLink alt={t(`An error ocurred:`)}>
            <div>{t(`This link cannot be embedded.`)}</div>
          </ExternalPageBrokenLink>
        </EmbedPageContainer>
      )
    } else {
      return (
        <EmbedPageContainer height={toREM(809)}>
          <ExternalPageSectionIframe
            url={iFrameLink}
            css={css`
              overflow: visible;
            `}
          />
        </EmbedPageContainer>
      )
    }
  }, [iFrameLink, isUrlValid, t])

  return (
    <Card>
      <Card.Header
        renderLeft={<Card.Title>{props.data.meetingPageName}</Card.Title>}
      />
      <Card.Body
        css={css`
          overflow-y: visible;
        `}
      >
        {renderBodyContent}
      </Card.Body>
    </Card>
  )
}
