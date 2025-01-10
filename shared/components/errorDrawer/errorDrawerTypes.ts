import { UserDrawerViewType } from '@mm/core-bloom'

export interface IErrorDrawerProps {
  title: string
  retry: () => void
}

export interface IErrorDrawerViewProps {
  data: {
    title: string
    retry: () => void
    drawerView: UserDrawerViewType
    drawerIsRenderedInMeeting: boolean
  }
  actionHandlers: IErrorDrawerActionHandlers
}

export interface IErrorDrawerActionHandlers {
  onHandleGoBack: () => void
}

export interface IErrorDrawerContainerProps {
  title: string
  retry: () => void
  children: (props: IErrorDrawerViewProps) => JSX.Element
}
