export interface IQuarterlyAlignmentMeetingContainerProps {
  children: (props: IQuarterlyAlignmentMeetingViewProps) => JSX.Element
}

export interface IQuarterlyAlignmentMeetingViewProps {
  data: () => IQuarterlyAlignmentMeetingData
  actions: () => IQuarterlyAlignmentMeetingActions
}

export interface IQuarterlyAlignmentMeetingData {
  mockPropString: string
}

export interface IQuarterlyAlignmentMeetingActions {}
