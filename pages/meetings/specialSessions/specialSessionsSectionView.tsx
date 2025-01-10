import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import {
  BtnIcon,
  Card,
  EXPANDED_COMPONENT_MAX_HEIGHT,
  Menu,
  Text,
  getTextStyles,
} from '@mm/core-web/ui'

import { useAction, useObservable } from '../../performance/mobx'
import {
  V1_IFRAME_HEIGHT_CALC_WITH_COLLAPSED_AGENDA,
  V1_IFRAME_HEIGHT_CALC_WITH_EXPANDED_AGENDA,
} from './constants'
import {
  getRecordOfExpandedIframeOptionToIframeSrc,
  getRecordOfExpandedIframeOptionToIframeTitle,
} from './lookups'
import { SpecialSessionsFullScreenIframePortal } from './specialSessionsFullScreenIframePortal'
import {
  ISpecialSessionsSectionViewProps,
  TSpeicalSessionsIframeExpandedOptions,
} from './specialSessionsSectionTypes'
import {
  correctIframeHardcodedHeight,
  prependV1UrlToSrc,
  replaceAppendedContentForLaunchDay,
} from './utils'

export const SpecialSessionsSectionView = observer(
  (props: ISpecialSessionsSectionViewProps) => {
    const pageState = useObservable({
      expandedIframeOption:
        null as Maybe<TSpeicalSessionsIframeExpandedOptions>,
    })

    const { getAgendaData, getPageToDisplayData, meetingId } = props.data
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const { v1Url } = useBrowserEnvironment()

    const RECORD_OF_EXPANDED_IFAME_OPTION_TO_IFRAME_SRC =
      getRecordOfExpandedIframeOptionToIframeSrc({
        meetingId,
        v1Url,
      })

    const RECORD_OF_EXPANDED_IFAME_OPTION_TO_IFRAME_TITLE =
      getRecordOfExpandedIframeOptionToIframeTitle({ terms })

    const correctV1Html = (opts: {
      agendaIsCollapsed: boolean
      subheadingHTML: string
    }) => {
      const { agendaIsCollapsed, subheadingHTML } = opts

      const htmlWithIframeSrcPrepended = prependV1UrlToSrc({
        htmlString: subheadingHTML,
        v1Url,
      })

      const htmlWithCorrectedIframeHardcodedHeights =
        correctIframeHardcodedHeight({
          htmlString: htmlWithIframeSrcPrepended,
          iframeHeight: agendaIsCollapsed
            ? V1_IFRAME_HEIGHT_CALC_WITH_COLLAPSED_AGENDA
            : V1_IFRAME_HEIGHT_CALC_WITH_EXPANDED_AGENDA,
        })

      const htmlWithLaunchDayCorrected = replaceAppendedContentForLaunchDay(
        htmlWithCorrectedIframeHardcodedHeights
      )

      return htmlWithLaunchDayCorrected
    }

    // HACK ALERT - so for pageType of html, v1 just sends the html v1 content as a subheading.
    // This is not great, but we have to change parts of this url so its functional within v3.
    const htmlContentFromV1Corrected = correctV1Html({
      agendaIsCollapsed: getAgendaData().agendaIsCollapsed,
      subheadingHTML: getPageToDisplayData()?.subheading || '',
    })

    const setExpandedIframeOption = useAction(
      (expandedMenuOption: TSpeicalSessionsIframeExpandedOptions) => {
        pageState.expandedIframeOption = expandedMenuOption
      }
    )

    const closeExpandedIframeOption = useAction(() => {
      pageState.expandedIframeOption = null
    })

    return (
      <Card>
        <Card.Header
          renderLeft={
            <Card.Title>{getPageToDisplayData()?.pageName || ''}</Card.Title>
          }
          renderRight={
            <Menu
              position='bottom right'
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={async (e) => {
                      setExpandedIframeOption('MEETING_ARCHIVE')
                      close(e)
                    }}
                  >
                    <Text type={'body'}>{t('Meeting Archive')}</Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={async (e) => {
                      setExpandedIframeOption('BUSINESS_PLAN')
                      close(e)
                    }}
                  >
                    <Text type={'body'}>
                      {t('{{bp}}', { bp: terms.businessPlan.singular })}
                    </Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={async (e) => {
                      setExpandedIframeOption('ORG_CHART')
                      close(e)
                    }}
                  >
                    <Text type={'body'}>
                      {t('{{oc}}', {
                        oc: terms.organizationalChart.singular,
                      })}
                    </Text>
                  </Menu.Item>
                </>
              )}
            >
              <BtnIcon
                intent='tertiaryTransparent'
                iconProps={{
                  iconName: 'moreVerticalIcon',
                  iconSize: 'lg',
                }}
                ariaLabel={t('More options')}
                tag={'button'}
              />
            </Menu>
          }
        />

        <Card.Body
          css={css`
            padding: ${(props) => props.theme.sizes.spacing40}
              ${(props) => props.theme.sizes.spacing24};
            text-align: center;
            height: 100%;

            ${specialSessionsStylingCorrectionsForV3}
          `}
        >
          {pageState.expandedIframeOption && (
            <SpecialSessionsFullScreenIframePortal
              closeExpandedIframeOption={closeExpandedIframeOption}
            >
              <div
                css={css`
                  width: 100%;
                  height: ${EXPANDED_COMPONENT_MAX_HEIGHT};
                `}
              >
                <iframe
                  title={
                    RECORD_OF_EXPANDED_IFAME_OPTION_TO_IFRAME_TITLE[
                      pageState.expandedIframeOption
                    ]
                  }
                  width='100%'
                  height='100%'
                  frameBorder='0'
                  src={
                    RECORD_OF_EXPANDED_IFAME_OPTION_TO_IFRAME_SRC[
                      pageState.expandedIframeOption
                    ]
                  }
                />
              </div>
            </SpecialSessionsFullScreenIframePortal>
          )}
          <StyledBlueSection>
            <div
              dangerouslySetInnerHTML={{
                __html: htmlContentFromV1Corrected || '',
              }}
            />
          </StyledBlueSection>
        </Card.Body>
      </Card>
    )
  }
)

const StyledBlueSection = styled.div`
  width: 100%;
  padding: ${(props) => props.theme.sizes.spacing24};
  background-color: ${(props) =>
    props.theme.colors.checkInSectionQuestionBackgroundColor};

  * {
    font-family: ${(props) => props.theme.fontFamily};
    color: ${(props) => props.theme.colors.bodyTextDefault};
  }
`

const specialSessionsStylingCorrectionsForV3 = css`
  .btn {
    display: none;
  }

  li {
    text-align: left;

    ${getTextStyles({ type: 'body' })}
  }

  h1 {
    ${getTextStyles({ type: 'h1', weight: 'semibold' })}
  }

  h2 {
    ${getTextStyles({ type: 'h2', weight: 'semibold' })}
  }

  h4 {
    ${getTextStyles({ type: 'h4', weight: 'semibold' })}
  }

  .table {
    width: 100%;
  }

  .table th {
    ${getTextStyles({ type: 'h4', weight: 'semibold' })}
  }
`
