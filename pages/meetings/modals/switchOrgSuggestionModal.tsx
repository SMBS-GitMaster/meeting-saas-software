import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useWindow } from '@mm/core/ssr'

import { useBloomAuthHttp } from '@mm/core-bloom/auth'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Text, toREM } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface ISwitchOrgSuggestionModalProps {
  orgId: number
  orgName: string
  meetingId: Id
}

export function SwitchOrgSuggestionModal(
  props: ISwitchOrgSuggestionModalProps
) {
  const { t } = useTranslation()
  const { closeOverlazy, openOverlazy } = useOverlazyController()
  const { v1Url } = useBrowserEnvironment()

  const bloomAuthHttp = useBloomAuthHttp()
  const window = useWindow()

  const bloomAuthSwitchOrg = bloomAuthHttp.switchOrg

  function getNewLocation() {
    const currentLocation = window.location.href

    if (currentLocation.includes('?')) {
      return `${currentLocation}&showSwitchOrgSuccess=true`
    } else {
      return `${currentLocation}?showSwitchOrgSuccess=true`
    }
  }

  const handleSwitchOrgSuggestion = async () => {
    try {
      await bloomAuthSwitchOrg({ v1Url, orgUserId: props.orgId })

      closeOverlazy({ type: 'Modal', name: 'SwitchOrgSuggestionModal' })
      window.location.href = getNewLocation()
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error switching organizations`),
        error: new UserActionError(error),
      })
    }
  }

  return (
    <Modal id={'SwitchOrgSuggestionModal'}>
      <Modal.Header
        css={css`
          max-width: ${toREM(480)};
        `}
      >
        <Modal.Title>
          {t(
            'Attention! Your organization settings are limiting your permissions'
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        css={css`
          display: flex;
          flex-direction: column;
          max-width: ${toREM(480)};
        `}
      >
        <Text
          css={css`
            padding-bottom: ${(props) => props.theme.sizes.spacing16};
          `}
          display='block'
          type={'body'}
          weight={'normal'}
        >
          {t(
            `It looks like your current organization settings may limit your access to this meeting. To participate fully and edit information, you'll need to switch to the appropriate organization.`
          )}
        </Text>
        <div
          css={css`
            align-self: flex-end;
          `}
        >
          <BtnText
            intent={'tertiaryTransparent'}
            ariaLabel={t('Cancel')}
            onClick={() =>
              closeOverlazy({ type: 'Modal', name: 'SwitchOrgSuggestionModal' })
            }
          >
            {t('Cancel')}
          </BtnText>
          <BtnText
            ariaLabel={t('Switch organizations')}
            onClick={handleSwitchOrgSuggestion}
            intent='primary'
          >
            {t('Switch to {{orgName}}', { orgName: props.orgName })}
          </BtnText>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SwitchOrgSuggestionModal
