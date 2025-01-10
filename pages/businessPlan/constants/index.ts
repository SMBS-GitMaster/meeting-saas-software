import type { GridStackOptions } from 'gridstack'

import { TBusinessPlanTileType } from '@mm/core-bloom'

export const BUSINESS_PLAN_PDF_EXPANDED_PORTAL_OUT_ID =
  'business_plan_pdf_expanded_portal_out_id'

export const BUSINESS_PLAN_PDF_CONTENT = 'business_plan_pdf_content_id'

export const BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS =
  'business-plan-no-display-on-print'

export const BUSINESS_PLAN_PDF_PORTAL_OUT_ID = 'business_plan_pdf_portal_out_id'

export const BUSINESS_PLAN_PDF_PAGE_BREAKS_MEASUREMENT_REF_MM_ID =
  'business_plan_pdf_page_breaks_measurement_ref_mm_id '

export const V3_BUSINESS_PLAN_CREATE_PARAM = 'create'

export const BLOOM_BUSINESS_PLAN_SUB_HEADER_HEIGHT = 48

export const TOTAL_COUNT_TO_SHOW_SEARCH_BP_LISTS = 15

export const BUSINESS_PLAN_MAX_CHARACTER_LIMIT = 225

export const BUSINESS_PLAN_MAX_ITEM_LIMIT = 25

export const RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_SHOW_LIST_COLLECTION_TITLE: Record<
  TBusinessPlanTileType,
  boolean
> = {
  BHAG: false,
  CORE_VALUES: false,
  CORE_FOCUS: false,
  STRATEGY: true,
  VISION_ONE_YEAR: true,
  VISION_THREE_YEAR: true,
  VISION_QUARTERLY: true,
  ISSUES: false,
}

export const RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_SHOW_FORM_ERRORS_ON_TOUCHED_FIELDS: Record<
  TBusinessPlanTileType,
  boolean
> = {
  BHAG: false,
  CORE_VALUES: true,
  CORE_FOCUS: true,
  STRATEGY: true,
  VISION_ONE_YEAR: true,
  VISION_THREE_YEAR: true,
  VISION_QUARTERLY: true,
  ISSUES: false,
}

export const BUSINESS_PLAN_GRID_INIT_OPTS: GridStackOptions = {
  cellHeight: 48,
  column: 12,
  columnOpts: { breakpoints: [{ w: 800, c: 1 }] },
  float: true,
  margin: 10,
  resizable: {
    handles: 's,e,w,se,sw,',
  },
}

export const BUSINESS_PLAN_GRID_INIT_OPTS_PDF_PREVIEW: GridStackOptions = {
  cellHeight: 48,
  column: 12,
  columnOpts: { breakpoints: [{ w: 500, c: 1 }] },
  float: true,
  margin: 4,
  resizable: {
    handles: 's,e,w,se,sw,',
  },
}
