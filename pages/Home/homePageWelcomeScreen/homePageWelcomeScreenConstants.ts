import { uuid } from '@mm/core/utils'

import type { IHomePageWelcomeCardDatum } from './homePageWelcomeScreenTypes'

export const HOME_PAGE_WELCOME_CARD_DATA: Array<IHomePageWelcomeCardDatum> = [
  {
    id: 1,
    title: 'Live',
    cardColorType: 'CARD1',
    cardSizeType: 'S',
    subList: [
      {
        id: uuid(),
        subTitle: 'Weekly meeting',
        text: 'Experience a refreshed weekly meeting with highly requested new features.',
      },
      {
        id: uuid(),
        subTitle: 'Meeting workspaces',
        text: 'Keep your tiles and add data for each meeting in their own separate workspaces.',
      },
      {
        id: uuid(),
        subTitle: 'Special sessions',
        text: 'Access your special sessions and weekly meetings from the same place. A full revamp and updates coming soon!',
      },
    ],
  },
  {
    id: 2,
    title: 'In development',
    cardColorType: 'CARD2',
    cardSizeType: 'S',
    subList: [
      {
        id: uuid(),
        subTitle: 'Business plan',
        text: 'See your goals, share your vision, and focus your resources.',
      },
      {
        id: uuid(),
        subTitle: 'Custom workspace',
        text: 'Manage and customize tiles across multiple meetings at the same time from one place and with fewer clicks.',
      },
      {
        id: uuid(),
        subTitle: 'Mobile app',
        text: 'Manage your to-dos, issues, and headlines from anywhere at all times. Updates to come soon!',
      },
      {
        id: 'subItem-4',
        subTitle: 'Weekly meeting improvements',
        text: "We're using your feedback to make your weekly meetings event better. ",
      },
    ],
  },
  {
    id: 3,
    title: 'Up next',
    subTitle: 'Org Chart',
    text: "Keep accountability high with a fresh-looking org chart. But we're not stopping there. More features will be coming soon.",
    cardColorType: 'CARD3',
    cardSizeType: 'S',
  },
]
