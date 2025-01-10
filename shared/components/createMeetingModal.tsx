import { observer } from 'mobx-react'
import React from 'react'
import styled from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import {
  type TMeetingType,
  meetingTypeOptions,
  teamTypeOptions,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, SelectInputSingleSelection, TextInput } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'

interface ICreateMeetingModalValues {
  meetingTitle: string
  meetingType: TMeetingType
  teamType: string
}

export const CreateMeetingModal = observer(function CreateMeetingModal() {
  const { closeOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  //@TODO_BLOOM - not mvp
  const onSubmit = async (values: ICreateMeetingModalValues) => {
    console.log('@TODO_BLOOM create meeting onSubmit', values)
    closeOverlazy({ type: 'Modal', name: 'CreateMeetingModal' })
  }

  return (
    <CreateForm
      isLoading={false}
      values={
        {
          meetingTitle: '',
          meetingType: 'L10',
          teamType: '',
        } as ICreateMeetingModalValues
      }
      validation={
        {
          meetingTitle: formValidators.string({
            additionalRules: [
              required(),
              maxLength({
                maxLength: MEETING_TITLES_CHAR_LIMIT,
                customErrorMsg: t(`Can’t exceed {{maxLength}} characters`, {
                  maxLength: MEETING_TITLES_CHAR_LIMIT,
                }),
              }),
            ],
          }),
          meetingType: formValidators.string({
            additionalRules: [required()],
          }),
          teamType: formValidators.string({
            additionalRules: [required()],
          }),
        } satisfies GetParentFormValidation<ICreateMeetingModalValues>
      }
      onSubmit={onSubmit}
    >
      {({ fieldNames, onSubmit, hasError }) => {
        return (
          <Modal
            id={'CreateMeetingModal'}
            onHide={() =>
              closeOverlazy({ type: 'Modal', name: 'CreateMeetingModal' })
            }
          >
            <Modal.Header>
              <Modal.Title> {t('Create a meeting')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <InputPaddingWrapper>
                <TextInput
                  name={fieldNames.meetingTitle}
                  id={'meetingTitle'}
                  formControl={{
                    label: t('Meeting title'),
                  }}
                  placeholder={t('Type a meeting title')}
                />
              </InputPaddingWrapper>
              <InputPaddingWrapper>
                <SelectInputSingleSelection
                  id={'meetingType'}
                  placeholder={t('Select a meeting type')}
                  unknownItemText={t('Unknown type')}
                  options={meetingTypeOptions}
                  name={fieldNames.meetingType}
                  formControl={{
                    label: t('Meeting type'),
                  }}
                />
              </InputPaddingWrapper>
              <InputPaddingWrapper>
                <SelectInputSingleSelection
                  id={'teamType'}
                  placeholder={t('Select a meeting type')}
                  unknownItemText={t('Unknown type')}
                  options={teamTypeOptions}
                  name={fieldNames.teamType}
                  formControl={{
                    label: t('Team type'),
                  }}
                />
              </InputPaddingWrapper>
            </Modal.Body>
            <Modal.Footer>
              <BtnText
                intent='tertiary'
                ariaLabel={t('Cancel')}
                onClick={() =>
                  closeOverlazy({ type: 'Modal', name: 'CreateMeetingModal' })
                }
              >
                {t('Cancel')}
              </BtnText>
              <BtnText
                intent='primary'
                ariaLabel={t('Create')}
                onClick={onSubmit}
                disabled={hasError}
              >
                {t('Create')}
              </BtnText>
            </Modal.Footer>
          </Modal>
        )
      }}
    </CreateForm>
  )
})

const InputPaddingWrapper = styled.div`
  padding: ${(props) => props.theme.sizes.spacing8} 0;

  .contentEditable,
  .singleInput__selectionWrapper {
    vertical-align: bottom;
  }
`

export default CreateMeetingModal
