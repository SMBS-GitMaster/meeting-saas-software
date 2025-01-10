import {
  IBusinessPlanGridStackWidgetOpts,
  TBusinessPlanTileType,
} from '@mm/core-bloom'

export const recordOfTileTypeToGridStackWidgetPortraitPrintingOptsDefaults: Record<
  TBusinessPlanTileType,
  IBusinessPlanGridStackWidgetOpts
> = {
  CORE_VALUES: {
    x: 0,
    y: 0,
    h: 6,
    w: 6,
  },
  CORE_FOCUS: {
    x: 6,
    y: 0,
    h: 6,
    w: 6,
  },
  BHAG: {
    x: 0,
    y: 6,
    h: 3,
    w: 12,
  },
  STRATEGY: {
    x: 6,
    y: 9,
    h: 10,
    w: 6,
  },
  VISION_THREE_YEAR: {
    x: 0,
    y: 9,
    h: 10,
    w: 6,
  },
  VISION_ONE_YEAR: {
    x: 0,
    y: 22,
    h: 11,
    w: 6,
  },
  VISION_QUARTERLY: {
    x: 6,
    y: 22,
    h: 11,
    w: 6,
  },
  ISSUES: {
    x: 0,
    y: 33,
    h: 10,
    w: 12,
  },
}

export const recordOfTileTypeToGridStackWidgetLandscapePrintingOptsDefaults: Record<
  TBusinessPlanTileType,
  IBusinessPlanGridStackWidgetOpts
> = {
  CORE_VALUES: {
    x: 0,
    y: 0,
    h: 4,
    w: 6,
  },
  CORE_FOCUS: {
    x: 6,
    y: 0,
    h: 4,
    w: 6,
  },
  BHAG: {
    x: 0,
    y: 4,
    h: 2,
    w: 6,
  },
  STRATEGY: {
    x: 0,
    y: 6,
    h: 7,
    w: 6,
  },
  VISION_THREE_YEAR: {
    x: 6,
    y: 4,
    h: 9,
    w: 6,
  },
  VISION_ONE_YEAR: {
    x: 0,
    y: 15,
    h: 7,
    w: 6,
  },
  VISION_QUARTERLY: {
    x: 6,
    y: 15,
    h: 7,
    w: 6,
  },
  ISSUES: {
    x: 0,
    y: 22,
    h: 7,
    w: 12,
  },
}
