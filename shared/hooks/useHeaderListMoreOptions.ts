import { type Id } from '@mm/gql'

import { useWindow } from '@mm/core/ssr'

import { useBrowserEnvironment } from '@mm/core-web/envs'

import { useAction } from '@mm/bloom-web/pages/performance/mobx'

interface IMeetingData {
  id: Id
  meetingType: string
}

const allListTypes = ['issues', 'headlines', 'goals', 'todos'] as const
type ListType = (typeof allListTypes)[number]
const listTypesV1: Record<ListType, string> = {
  goals: 'rocks',
  headlines: 'headlines',
  todos: 'todos',
  issues: 'issues',
}

export function useHeaderListMoreOptions(meetingData: IMeetingData) {
  const { v1Url } = useBrowserEnvironment()
  const window = useWindow()

  const openUrl = useAction(function openUrl(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  })

  const onUpload = useAction(function onUpload(listType: ListType) {
    openUrl(
      `${v1Url}upload/${meetingData.meetingType}/${listTypesV1[listType]}?recurrence=${meetingData.id}`
    )
  })

  const onExport = useAction(function onExport() {
    openUrl(`${v1Url}${meetingData.meetingType}/ExportAll/${meetingData.id}`)
  })

  const onPrint = useAction(function onPrint(listType: ListType) {
    openUrl(
      `${v1Url}${meetingData.meetingType}/Wizard/${meetingData.id}?showPrintoutModal=true#/${listTypesV1[listType]}`
    )
  })

  return { onUpload, onExport, onPrint } as const
}
