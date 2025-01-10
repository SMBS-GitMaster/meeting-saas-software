import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { css } from 'styled-components'

import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomLookupNode,
  useBloomUserMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Modal,
  SelectInputSingleSelection,
  Text,
  toREM,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const SetUserTimezoneModal = observer(function SetUserTimezoneModal() {
  const [selectedTimezone, setSelectedTimezone] = useState<Maybe<string>>(null)

  const { closeOverlazy, openOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const { editAuthenticatedUserSettings } = useBloomUserMutations()

  const subscription = useSubscription(
    {
      bloomLookup: queryDefinition({
        def: useBloomLookupNode(),
        target: {
          id: 'BLOOM_LOOKUP',
        },
        map: ({ timezones }) => ({
          timezones: timezones({ map: ({ iANA_Name }) => ({ iANA_Name }) }),
        }),
      }),
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ id, settings }) => ({
          id,
          settings: settings({ map: ({ timezone }) => ({ timezone }) }),
        }),
      }),
    },
    {
      subscriptionId: `SetUserTimezoneModal`,
    }
  )

  const onSaveUserTimezone = async () => {
    if (selectedTimezone) {
      try {
        await editAuthenticatedUserSettings({
          timezone: selectedTimezone,
        })
        closeOverlazy({ type: 'Modal', name: 'SetUserTimezoneModal' })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Issue updating your timezone`),
          error: new UserActionError(e),
        })
      }
    }
  }

  const timezoneLookup = subscription().querying
    ? []
    : subscription()
        .data.bloomLookup.timezones.sort((a, b) =>
          a.iANA_Name.localeCompare(b.iANA_Name)
        )
        .map((t) => ({
          text: t.iANA_Name,
          value: t.iANA_Name,
        }))

  useEffect(() => {
    if (subscription().data.currentUser.settings.timezone) {
      setSelectedTimezone(subscription().data.currentUser.settings.timezone)
    }
  }, [subscription().data.currentUser.settings.timezone])

  return (
    <Modal
      id={'SetUserTimezoneModal'}
      onHide={() =>
        closeOverlazy({
          type: 'Modal',
          name: 'SetUserTimezoneModal',
        })
      }
    >
      <Modal.Header
        css={css`
          padding-bottom: 0;
        `}
      >
        <Modal.Title>{t('Set up your time zone')}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        css={css`
          padding-top: ${(props) => props.theme.sizes.spacing16};
          overflow-y: unset !important;
          padding-bottom: 0 !important;
        `}
      >
        <div
          css={css`
            max-width: ${toREM(432)};
            margin-bottom: ${(prop) => prop.theme.sizes.spacing32};
          `}
        >
          <Text type={'body'}>
            {t(
              `Setting your time zone will ensure that certain new features run smoothy.`
            )}
          </Text>
          <Text
            type={'body'}
            css={css`
              margin-top: ${(prop) => prop.theme.sizes.spacing16};
            `}
          >
            {t(
              `Change your zone? You can always change your time zone in your profile page or in your meeting settings.`
            )}
          </Text>
        </div>
        <SelectInputSingleSelection
          id='setUserTimezoneSingleSelection'
          name='setUserTimezoneSingleSelection'
          placeholder={t('Start typing or choose from drop down')}
          value={selectedTimezone}
          unknownItemText={t('Unknown timezone')}
          options={timezoneLookup}
          formControl={{
            label: t('Choose a timezone'),
          }}
          width='100%'
          onChange={(v) => {
            setSelectedTimezone(v)
          }}
        />
      </Modal.Body>
      <Modal.Footer
        css={css`
          padding-top: ${(prop) => prop.theme.sizes.spacing16} !important;
        `}
      >
        <BtnText
          intent='tertiary'
          ariaLabel={t('Cancel')}
          onClick={() =>
            closeOverlazy({
              type: 'Modal',
              name: 'SetUserTimezoneModal',
            })
          }
        >
          {t('Cancel')}
        </BtnText>
        <BtnText
          intent='primary'
          ariaLabel={t('Save')}
          onClick={onSaveUserTimezone}
          disabled={selectedTimezone == null}
        >
          {t('Save')}
        </BtnText>
      </Modal.Footer>
    </Modal>
  )
})

export default SetUserTimezoneModal
