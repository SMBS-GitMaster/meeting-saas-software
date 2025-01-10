import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  matchesRegex,
} from '@mm/core/forms'

import { useBloomMeetingMutations } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Text, TextInput, toREM } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'
import { addHttps } from '@mm/core-web/utils'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface IVideoConferenceModalProps {
  link: Maybe<string> | undefined
  meetingId: Id
}

interface ICreateVideoConferenceModalValues {
  link: string
}

export const VideoConferenceModal = observer(function VideoConferenceModal(
  props: IVideoConferenceModalProps
) {
  const { link, meetingId } = props

  const { t } = useTranslation()
  const { closeOverlazy, openOverlazy } = useOverlazyController()

  const { editMeeting } = useBloomMeetingMutations()

  const modalTitle = link
    ? t('Edit video conference link')
    : t('Add a video conference')
  const secondaryBtnText = link ? t('Remove link') : t('Cancel')

  const openToast = () => {
    openOverlazy('Toast', {
      type: link ? 'info' : 'success',
      text: link ? t('Link updated') : t('Link added'),
      undoClicked: () =>
        console.log(
          '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
        ),
    })
  }

  const onSubmit = async (values: ICreateVideoConferenceModalValues) => {
    try {
      const linkWithHttps = addHttps(values.link)
      await editMeeting({ meetingId, videoConferenceLink: linkWithHttps })
      openToast()
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: link ? t(`Error updating link`) : t(`Error creating link`),
        error: new UserActionError(error),
      })
    }
    closeOverlazy({ type: 'Modal', name: 'VideoConferenceModal' })
  }

  const onRemoveLink = async () => {
    try {
      await editMeeting({ meetingId, videoConferenceLink: '' })
      openOverlazy('Toast', {
        type: 'success',
        text: t('Link removed'),
        undoClicked: () =>
          console.log(
            '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
          ),
      })
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error removing link`),
        error: new UserActionError(error),
      })
    }
  }

  return (
    <CreateForm
      isLoading={false}
      values={
        {
          link: link || '',
        } as ICreateVideoConferenceModalValues
      }
      validation={
        {
          link: formValidators.string({
            additionalRules: [
              matchesRegex(
                /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                'Please add a valid link'
              ),
            ],
          }),
        } satisfies GetParentFormValidation<ICreateVideoConferenceModalValues>
      }
      onSubmit={onSubmit}
    >
      {({ fieldNames, onSubmit, hasError, onFieldChange }) => {
        return (
          <Modal
            id={'VideoConferenceModal'}
            css={css`
              color: ${(props) =>
                props.theme.colors.videoConferenceLinkButtonTextColor};
            `}
          >
            <Modal.Header>
              <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Text
                type='body'
                css={css`
                  margin-bottom: ${(props) => props.theme.sizes.spacing20};
                `}
              >
                {t('Add your Zoom, Teams or another video conference tool.')}
              </Text>
              <TextInput
                name={fieldNames.link}
                id='linkId'
                clearable
                formControl={{
                  label: t('Add a link (url)'),
                }}
                placeholder={t('Link')}
              />
            </Modal.Body>
            <Modal.Footer>
              <BtnText
                intent='tertiary'
                width='medium'
                ariaLabel={secondaryBtnText}
                onClick={() => {
                  onFieldChange('link', '')
                  link && onRemoveLink()
                  closeOverlazy({ type: 'Modal', name: 'VideoConferenceModal' })
                }}
              >
                <Text weight='semibold' type='body'>
                  {secondaryBtnText}
                </Text>
              </BtnText>
              <BtnText
                onClick={onSubmit}
                intent='primary'
                width='fitted'
                ariaLabel={t('saveButton')}
                type='button'
                disabled={hasError}
                css={css`
                  width: ${toREM(97)};
                `}
              >
                <Text weight='semibold' type='body'>
                  {t('Save')}
                </Text>
              </BtnText>
            </Modal.Footer>
          </Modal>
        )
      }}
    </CreateForm>
  )
})

export default VideoConferenceModal
