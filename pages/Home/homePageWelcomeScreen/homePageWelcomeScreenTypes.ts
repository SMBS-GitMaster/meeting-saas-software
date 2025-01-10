import { type Id } from '@mm/gql'

export type THomePageWelcomeCardColor = 'CARD1' | 'CARD2' | 'CARD3' | 'CARD4'

export type THomePageWelcomeCardSize = 'S' | 'M'

export type THomePageWelcomeScreenResponsiveSizes =
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'UNKNOWN'

export interface IHomePageWelcomeCardDatum {
  id: Id
  title: string
  subTitle?: string
  text?: string
  cardColorType: THomePageWelcomeCardColor
  cardSizeType: THomePageWelcomeCardSize
  buttonText?: string
  subList?: Array<{
    id: string
    subTitle: string
    text: string
  }>
}
