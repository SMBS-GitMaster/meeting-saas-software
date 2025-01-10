import { useWindow } from '@mm/core/ssr'

const allPopupTypes = [
  'usersTooltip',
  'dropdown',
  'v1HoverModal',
  'featureModal',
  'starVotingModal',
  'onlyV3Msg',
] as const
type PopupType = (typeof allPopupTypes)[number]

interface IMessage {
  popup: PopupType
  isOpen?: boolean
}

interface IProps {
  callBack: (event: MessageEvent<IMessage>) => void
  eventsName?: [string]
}

export function useBloomPostMessage(options?: IProps) {
  const window = useWindow()

  if (options?.callBack) {
    window.addEventListener(
      'message',
      (event: MessageEvent<IMessage>) => {
        if (!options.eventsName?.length) {
          return options.callBack(event)
        }
        if (options.eventsName.some((item) => item === event.data.popup)) {
          options.callBack(event)
        }
      },
      false
    )
  }

  const sendMessage = (message: IMessage) => {
    window.parent.postMessage(message, '*')
  }

  return { sendMessage } as const
}
