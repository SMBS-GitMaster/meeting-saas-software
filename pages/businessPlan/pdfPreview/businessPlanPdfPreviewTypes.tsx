import {
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
  TBusinessPlanTileProps,
} from '../businessPlanTypes'

export interface IBusinessPlanPdfPreviewProps {
  getTileToRender: (tile: TBusinessPlanTileProps) => React.JSX.Element | null
  getBusinessPlanData: () => IBusinessPlanViewData
  getBusinessPlanActions: () => IBusinessPlanViewActions
}

export interface IBusinessPlanPdfPreviewContainerProps {
  getBusinessPlanData: () => IBusinessPlanViewData
  getTileToRender: (tile: TBusinessPlanTileProps) => React.JSX.Element | null
  getBusinessPlanActions: () => IBusinessPlanViewActions
  children: (props: IBusinessPlanPdfPreviewViewProps) => JSX.Element
}

export interface IBusinessPlanPdfPreviewViewProps {
  getData: () => IBusinessPlanPdfPreviewViewData & {
    getTileToRender: (tile: TBusinessPlanTileProps) => React.JSX.Element | null
  }
  getActions: () => IBusinessPlanPdfPreviewViewActions
}

export interface IBusinessPlanPdfPreviewViewData extends IBusinessPlanViewData {
  pdfPageState: {
    pdfPreviewPageLayout: TBusinessPlanPdfPageLayout
  }
}

export interface IBusinessPlanPdfPreviewViewActions
  extends IBusinessPlanViewActions {
  onHandleDownloadPDF: () => void
  onHandleResetPdfLayout: () => void
  onHandleSetPdfPreviewPageLayout: (
    pageLayout: TBusinessPlanPdfPageLayout
  ) => void
}

export type TBusinessPlanPdfPageLayout = 'PORTRAIT' | 'LANDSCAPE'
