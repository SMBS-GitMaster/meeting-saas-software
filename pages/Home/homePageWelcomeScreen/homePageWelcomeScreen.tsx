import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { css, useTheme } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { Clickable, Text, toREM, useResizeObserver } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import HOME_PAGE_WELCOME_CARD_BACKGROUND_SVG from './assets/homePageWelcomeScreenBackground.svg'
import { HOME_PAGE_WELCOME_CARD_DATA } from './homePageWelcomeScreenConstants'
import type {
  IHomePageWelcomeCardDatum,
  THomePageWelcomeScreenResponsiveSizes,
} from './homePageWelcomeScreenTypes'

interface IHomePageWelcomeScreenProps {
  className?: string
  noBorder?: boolean
  noVector?: boolean
  noButton?: boolean
  noPaddingBT?: boolean
}

export const HomePageWelcomeScreen = observer(function HomePageWelcomeScreen(
  props: IHomePageWelcomeScreenProps
) {
  const [homePageEl, setHomePageEl] = useState<Maybe<HTMLDivElement>>(null)

  const theme = useTheme()
  const { t } = useTranslation()

  const { width, ready } = useResizeObserver(homePageEl)

  const RESPONSIVE_SIZE = useMemo(() => {
    if (!ready) return 'UNKNOWN'
    if (width < 700) return 'SMALL'
    if (width < 800) return 'MEDIUM'
    return 'LARGE'
  }, [width, ready])

  const renderCard = () => {
    if (RESPONSIVE_SIZE === 'UNKNOWN') return null
    return HOME_PAGE_WELCOME_CARD_DATA.map((card) => (
      <HomePageHomeCard
        key={card.id}
        card={card}
        responsiveSize={RESPONSIVE_SIZE}
      />
    ))
  }

  return (
    <div
      className={props.className}
      css={css`
        align-items: center;
        display: flex;
        height: 100%;
        justify-content: center;
        padding: 0 ${theme.sizes.spacing8};
        position: relative;
        width: 100%;
      `}
    >
      {!props.noVector && (
        <img
          src={HOME_PAGE_WELCOME_CARD_BACKGROUND_SVG}
          alt='vector'
          css={css`
            height: 100%;
            object-fit: cover;
            position: absolute;
            right: 0;
            top: 0;
            width: 100vw;
            z-index: 0;
          `}
        />
      )}
      <div
        css={css`
          background-color: ${theme.colors.homePageCardsColor};
          border: 1px solid ${theme.colors.homePageCardsBorderColor};
          border-radius: ${toREM(4)};
          max-width: ${toREM(800)};
          padding: ${props.noPaddingBT
            ? `0 ${theme.sizes.spacing24}`
            : theme.sizes.spacing24};
          z-index: 5;

          ${props.noBorder && `border: none;`}
        `}
      >
        <Text
          type='h2'
          css={css`
            font-size: ${toREM(26)};
            margin-bottom: ${theme.sizes.spacing24};
          `}
        >
          {t(`Welcome to Bloom Growth's`)}
          <span
            css={css`
              color: ${theme.colors.homePageTitleBetaCardsColor};
              font-style: italic;
            `}
          >
            {t(' beta ')}
          </span>
          {t(`experience!`)}
        </Text>

        <div
          ref={setHomePageEl}
          css={css`
            align-items: flex-start;
            display: flex;
            gap: ${theme.sizes.spacing16};
            justify-content: center;
            margin-bottom: ${theme.sizes.spacing24};
          `}
        >
          {renderCard()}
        </div>
      </div>
    </div>
  )
})

interface IHomePageHomeCardProps {
  card: IHomePageWelcomeCardDatum
  responsiveSize: THomePageWelcomeScreenResponsiveSizes
}

const HomePageHomeCard = observer(function HomePageHomeCard(
  props: IHomePageHomeCardProps
) {
  const theme = useTheme()
  const { openOverlazy } = useOverlazyController()

  const getColorCard = () => {
    return {
      CARD1: {
        title: theme.colors.homePageCardType1TitleColor,
        body: theme.colors.homePageCardType1BodyColor,
      },
      CARD2: {
        title: theme.colors.homePageCardType2TitleColor,
        body: theme.colors.homePageCardType2BodyColor,
      },
      CARD3: {
        title: theme.colors.homePageCardType3TitleColor,
        body: theme.colors.homePageCardType3BodyColor,
      },
      CARD4: {
        title: 'none',
        body: theme.colors.homePageCardType4BodyColor,
      },
    }
  }

  const getSizeCard = () => {
    return {
      S: 240,
      M: 496,
    }
  }

  return (
    <>
      <div
        css={css`
          background-color: ${getColorCard()[props.card.cardColorType].body};
          border-radius: ${toREM(4)};
          grid-area: area ${props.card.id};
          max-width: ${props.responsiveSize === 'SMALL'
            ? toREM(320)
            : toREM(getSizeCard()[props.card.cardSizeType])};
          overflow: hidden;
          width: 100%;
          height: fit-content;
        `}
      >
        {props.card.title && (
          <Text
            type='h3'
            css={css`
              background-color: ${getColorCard()[props.card.cardColorType]
                .title};
              padding: ${theme.sizes.spacing4} ${theme.sizes.spacing12}
                ${theme.sizes.spacing4} ${theme.sizes.spacing12};
              width: 100%;
            `}
          >
            {props.card.title}
          </Text>
        )}
        <div
          css={css`
            padding: ${theme.sizes.spacing8} ${theme.sizes.spacing12}
              ${theme.sizes.spacing8} ${theme.sizes.spacing12};
          `}
        >
          {props.card.subTitle && <Text type='h4'>{props.card.subTitle}</Text>}
          {props.card.text && <Text type='body'>{props.card.text}</Text>}
          {props.card.subList &&
            props.card.subList.length > 0 &&
            props.card.subList.map((subItem, index) => (
              <div
                key={subItem.id}
                css={css`
                  padding-bottom: ${props.card.subList &&
                  index === props.card.subList.length - 1
                    ? 0
                    : theme.sizes.spacing12};
                  padding-top: ${index === 0 ? 0 : theme.sizes.spacing12};
                `}
              >
                {subItem.subTitle && <Text type='h4'>{subItem.subTitle}</Text>}
                {subItem.text && <Text type='body'>{subItem.text}</Text>}
              </div>
            ))}
          {props.card.buttonText && (
            <Clickable
              clicked={() => {
                openOverlazy('BloomNewFeaturesModal', {})
              }}
              css={css`
                margin: auto;
                padding: ${theme.sizes.spacing10} ${theme.sizes.spacing16}
                  ${theme.sizes.spacing16} ${theme.sizes.spacing10};
              `}
            >
              <Text
                css={css`
                  font-weight: 600;
                  color: ${theme.colors.homePageButtonColor};
                `}
              >
                {props.card.buttonText}
              </Text>
            </Clickable>
          )}
        </div>
      </div>
    </>
  )
})
