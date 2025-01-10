import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  ESpecialSessionMeetingType,
  useBloomMeetingMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, TextEllipsis, toREM } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useAction } from '../../performance/mobx'
import { getSpecialSessionsTextLookup } from '../agenda/lookups'

export const StartSpecialSessionModal = observer(
  function StartSpecialSessionModal(props: {
    meetingId: Id
    specialSessionType: ESpecialSessionMeetingType
  }) {
    const diResolver = useDIResolver()

    const { closeOverlazy, openOverlazy } = useOverlazyController()
    const { getTime } = useTimeController()
    const { startSpecialSession } = useBloomMeetingMutations()
    const { t } = useTranslation()

    const { meetingId, specialSessionType } = props

    const selectedMeetingTypeText =
      getSpecialSessionsTextLookup(diResolver)[props.specialSessionType]

    const onStartSpecialSessionMeeting = useAction(
      async (opts: {
        specialSessionType: ESpecialSessionMeetingType
        meetingId: Id
      }) => {
        const { specialSessionType, meetingId } = opts
        const seconds = getTime()

        try {
          startSpecialSession({
            meetingId,
            meetingStartTime: seconds,
            mode: specialSessionType,
          })
          return closeOverlazy({
            type: 'Modal',
            name: 'StartSpecialSessionModal',
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(
              `Failed to start special session. Please reload and try again`
            ),
            error: new UserActionError(e),
          })
        }
      }
    )

    return (
      <Modal
        id={'StartSpecialSessionModal'}
        onHide={() =>
          closeOverlazy({
            type: 'Modal',
            name: 'StartSpecialSessionModal',
          })
        }
      >
        <Modal.Header
          css={css`
            padding-bottom: 0;
            color: ${(props) => props.theme.colors.bodyTextDefault};
          `}
        >
          <Modal.Title
            css={css`
              max-width: ${toREM(480)};
              margin-right: ${toREM(34)};
            `}
          >
            <TextEllipsis
              lineLimit={3}
              wordBreak={true}
              weight={'semibold'}
              css={css`
                font-size: inherit;
                line-height: inherit;
              `}
            >
              {t('Start your {{ss}} session?', {
                ss: selectedMeetingTypeText,
              })}
            </TextEllipsis>
          </Modal.Title>
        </Modal.Header>

        <Modal.Footer
          css={css`
            padding-top: ${(prop) => prop.theme.sizes.spacing32} !important;
          `}
        >
          <BtnText
            intent='tertiary'
            ariaLabel={t('Cancel')}
            onClick={() =>
              closeOverlazy({
                type: 'Modal',
                name: 'StartSpecialSessionModal',
              })
            }
          >
            {t('Cancel')}
          </BtnText>
          <BtnText
            intent='primary'
            ariaLabel={t('Start meeting')}
            onClick={() =>
              onStartSpecialSessionMeeting({ meetingId, specialSessionType })
            }
          >
            {t('Start')}
          </BtnText>
        </Modal.Footer>
      </Modal>
    )
  }
)

export default StartSpecialSessionModal
