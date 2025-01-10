import { makeAutoObservable } from 'mobx'

import { Id } from '@mm/gql'

import { createDIHook } from '@mm/core/di/resolver'

import { IMMTheme } from '@mm/core-web/ui'

class MeetingColorController {
  meetingColorByMeetingId: Record<Id, string> = {}

  constructor() {
    makeAutoObservable(this)
  }

  public setMeetingColors = (opts: {
    meetingIds: Array<Id>
    theme: IMMTheme
  }) => {
    const MEETING_TITLE_COLORS = [
      opts.theme.colors.workspacePersonalTileMeetingTitleColor1,
      opts.theme.colors.workspacePersonalTileMeetingTitleColor2,
      opts.theme.colors.workspacePersonalTileMeetingTitleColor3,
      opts.theme.colors.workspacePersonalTileMeetingTitleColor4,
      opts.theme.colors.workspacePersonalTileMeetingTitleColor5,
      opts.theme.colors.workspacePersonalTileMeetingTitleColor6,
    ]

    const colorByMeetingId: Record<Id, string> = {}
    let currentColorIndex = 0

    opts.meetingIds.forEach((mId) => {
      colorByMeetingId[mId] = MEETING_TITLE_COLORS[currentColorIndex]

      if (currentColorIndex === MEETING_TITLE_COLORS.length - 1) {
        currentColorIndex = 0
      } else {
        currentColorIndex += 1
      }
    })

    this.meetingColorByMeetingId = colorByMeetingId
  }
}

export const DI_NAME = 'bloom-web/shared/controllers/meetingColorController'

export const getMeetingColorController = (diResolver: IDIResolver) =>
  diResolver.getOrCreate(DI_NAME, () => new MeetingColorController())

export const useMeetingColorController = createDIHook(
  DI_NAME,
  getMeetingColorController
)
