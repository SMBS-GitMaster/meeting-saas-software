import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  BtnText,
  Expandable,
  Text,
  TextInput,
  useModalsController,
} from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

const BaseModal = observer(function BaseModal() {
  const modalId = 'base-modal'
  const { openModal, closeModal } = useModalsController()

  return (
    <div>
      <BtnText
        intent='primary'
        ariaLabel='test'
        type='button'
        onClick={() => openModal(modalId)}
      >
        Simple Modal
      </BtnText>
      <Modal id={modalId}>
        <Modal.Header>
          <Modal.Title>Modal Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Consectetur perferendis veniam enim fuga provident sit, non et
            minima corporis iste fugit magnam ipsum dicta, tempora nemo culpa
            eaque. Repudiandae, at?
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <BtnText
            intent='tertiary'
            ariaLabel='test'
            onClick={() => closeModal(modalId)}
          >
            Cancel
          </BtnText>
          <BtnText intent='primary' ariaLabel='test'>
            Save
          </BtnText>
        </Modal.Footer>
      </Modal>
    </div>
  )
})

const ModalWithInput = observer(function ModalWithInput() {
  const modalId = 'modal-with-input'
  const { openModal, closeModal } = useModalsController()

  return (
    <div>
      <BtnText
        intent='primary'
        ariaLabel='test'
        type='button'
        onClick={() => openModal(modalId)}
      >
        Modal with input
      </BtnText>
      <Modal id={modalId}>
        <Modal.Header>
          <Modal.Title>Edit video conference link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Text>Add your Zoom, Teams or any other video conference tool.</Text>
          <br />
          <br />
          <TextInput
            name={'textInputBasicWithFormsNotRequiredRegSubmit'}
            id={'textInputBasicWithFormsNotRequiredRegSubmit'}
            clearable={true}
            formControl={{
              label: 'Add a link (url)',
            }}
            placeholder={'https://example.com'}
          />
        </Modal.Body>
        <Modal.Footer>
          <BtnText
            intent='tertiary'
            ariaLabel='test'
            onClick={() => closeModal(modalId)}
          >
            Remove Link
          </BtnText>
          <BtnText intent='primary' ariaLabel='test'>
            Save
          </BtnText>
        </Modal.Footer>
      </Modal>
    </div>
  )
})

const CustomWidthModal = observer(function CustomWidthModal() {
  const modalId = 'custom-width-modal'
  const { openModal, closeModal } = useModalsController()

  return (
    <div>
      <Text>
        using contentCss prop to pass styles with the
        <strong>css function</strong> to content container
      </Text>
      <BtnText
        intent='primary'
        ariaLabel='test'
        type='button'
        onClick={() => openModal(modalId)}
      >
        Modal custom css
      </BtnText>
      <Modal
        id={modalId}
        contentCss={css`
          max-width: 800px;
        `}
      >
        <Modal.Header>
          <Modal.Title>Modal Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consectetur
          perferendis veniam enim fuga provident sit, non et minima corporis
          iste fugit magnam ipsum dicta, tempora nemo culpa eaque. Repudiandae,
          at?
        </Modal.Body>
        <Modal.Footer>
          <BtnText
            intent='tertiary'
            ariaLabel='test'
            onClick={() => closeModal(modalId)}
          >
            Cancel
          </BtnText>
          <BtnText intent='primary' ariaLabel='test'>
            Save
          </BtnText>
        </Modal.Footer>
      </Modal>
    </div>
  )
})

export const Modals = () => {
  return (
    <Expandable title='Modals'>
      <>
        <BaseModal />
        <ModalWithInput />
        <CustomWidthModal />
      </>
    </Expandable>
  )
}
