import { observer } from 'mobx-react'
import React, { useContext } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { FormContext, FormFieldArrayContext } from '@mm/core/forms'
import { useDocument, useWindow } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web'

import { BtnIcon, TextInput, toREM } from '@mm/core-web/ui'

export const RoleInput = observer(function RolesInput(props: {
  id: Id
  fieldArrayPropNames: {
    name: string
  }
  formControl: {
    label: string
  }
  roleIndex: number
  numberOfRoles: number
  previousRoleId: Id | undefined
  nextRoleId: Id | undefined
  disabled?: boolean
  tooltip?:
    | {
        msg: string
      }
    | undefined
}) {
  const window = useWindow()
  const document = useDocument()
  const { t } = useTranslation()
  const formContext = useContext(FormContext)
  const formFieldArrayContext = useContext(FormFieldArrayContext)
  const context = formFieldArrayContext || formContext

  const handleTrashClick = () => {
    context.onRemoveFieldArrayItem(props.id)
  }

  const moveCursorToEnd = (el: HTMLElement) => {
    const range = document.createRange()
    const selection = window.getSelection()
    range.setStart(el, el.childNodes.length)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const numberOfRoles = props.numberOfRoles

    // if backspace was hit and the field is empty
    if (e.key === 'Backspace' && e.currentTarget.innerText === '') {
      e.preventDefault()
      if (numberOfRoles > 0) {
        const thisRoleId = props.id
        context.onRemoveFieldArrayItem(thisRoleId)
        // focus the previous field
        requestAnimationFrame(() => {
          const previousFieldId = props.previousRoleId
          if (!previousFieldId) return
          const previousField = document.getElementById(String(previousFieldId))
          if (!previousField) return
          previousField.focus()
          moveCursorToEnd(previousField)
        })
      }
    }

    // if enter was hit
    if (e.key === 'Enter') {
      e.preventDefault()

      // don't do anything if the field is empty
      if (e.currentTarget.innerText === '') return

      // if the user is on the last role field, add a new one
      if (!props.nextRoleId) {
        context.onAddFieldArrayItem(numberOfRoles)
      } else {
        // if the user is on a field that is not the last one, focus the next one
        const nextFieldId = props.nextRoleId
        const nextField = document.getElementById(String(nextFieldId))
        if (!nextField) return
        nextField.focus()
        moveCursorToEnd(nextField)
      }
    }
  }

  function getTrashIconInfo() {
    if (props.disabled) {
      return {
        disabled: true,
        tooltip: {
          msg: props.tooltip?.msg,
          position: 'left center' as const,
        },
      }
    } else {
      return {
        disabled: false,
        tooltip: undefined,
      }
    }
  }

  const trashIconInfo = getTrashIconInfo()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <TextInput
        name={context.generateFieldName({
          id: props.id,
          propName: props.fieldArrayPropNames.name,
        })}
        id={String(props.id)}
        placeholder={t('Role for this position')}
        css={css`
          padding-top: ${({ theme }) => theme.sizes.spacing8} !important;
          padding-bottom: 0 !important;
          flex: 1;
          margin-right: ${({ theme }) => theme.sizes.spacing4};
        `}
        disabled={props.disabled}
        tooltip={
          props.tooltip
            ? {
                msg: props.tooltip.msg,
                position: 'top center',
              }
            : undefined
        }
        onKeyDown={onKeyDown}
      />
      <BtnIcon
        intent='tertiaryTransparent'
        size='md'
        iconProps={{
          iconSize: 'lg',
          iconName: 'trashIcon',
        }}
        css={css`
          padding: 0;
          margin-top: ${toREM(2.85)};
          justify-content: flex-end;
        `}
        ariaLabel={t('Remove role')}
        disabled={trashIconInfo.disabled}
        tooltip={trashIconInfo.tooltip}
        tag={'span'}
        onClick={handleTrashClick}
      />
    </div>
  )
})
