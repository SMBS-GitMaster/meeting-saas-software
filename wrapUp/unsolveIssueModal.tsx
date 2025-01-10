import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id, useAction } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import { PermissionCheckResult, useBloomCustomTerms } from '@mm/core-bloom'

import { useBloomIssuesMutations } from '@mm/core-bloom/issues/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Modal, Text, toREM } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export interface IUnsolveIssueModalProps {
  issueId: Id
  canEditIssuesInMeeting: PermissionCheckResult
}

export interface IUnsolveIssueModalValues {
  issueId: Id
}

export const UnsolveIssueModal = observer(function UnsolveIssueModal(
  props: IUnsolveIssueModalProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { closeOverlazy, openOverlazy } = useOverlazyController()

  const { editIssue } = useBloomIssuesMutations()

  const onSubmit = useAction(async (issueId: Id) => {
    try {
      await editIssue({
        id: issueId,
        completed: false,
        completedTimestamp: null,
      })
      openOverlazy('Toast', {
        type: 'success',
        text: t(`{{issue}} unsolved`, {
          issue: terms.issue.singular,
        }),
        undoClicked: () =>
          console.log(
            '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
          ),
      })
      closeOverlazy({
        type: 'Modal',
        name: 'UnsolveIssueModal',
      })
    } catch (e) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error unsolving this {{issue}}`, {
          issue: terms.issue.lowercaseSingular,
        }),
        error: new UserActionError(e),
      })
    }
  })

  return (
    <CreateForm
      disabled={!props.canEditIssuesInMeeting.allowed}
      disabledTooltip={
        !props.canEditIssuesInMeeting.allowed
          ? {
              msg: props.canEditIssuesInMeeting.message,
              type: 'light',
              position: 'top center',
            }
          : undefined
      }
      isLoading={false}
      values={{
        issueId: props.issueId,
      }}
      validation={
        {
          issueId: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
        } satisfies GetParentFormValidation<IUnsolveIssueModalValues>
      }
      onSubmit={async () => onSubmit(props.issueId)}
    >
      {({ onSubmit }) => (
        <Modal
          id='UnsolveIssueModal'
          contentCss={css`
            width: ${toREM(480)};
          `}
        >
          <Modal.Header>
            <Text type='h2' weight='semibold'>
              {t('Unsolve {{issue}}?', {
                issue: terms.issue.lowercaseSingular,
              })}
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Text>
              {t('Are you sure you want to unsolve this {{issue}}?', {
                issue: terms.issue.lowercaseSingular,
              })}
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <BtnText
              ariaLabel={t('Cancel')}
              intent='tertiaryTransparent'
              onClick={() =>
                closeOverlazy({ type: 'Modal', name: 'UnsolveIssueModal' })
              }
            >
              {t('Cancel')}
            </BtnText>
            <BtnText
              ariaLabel={t('Yes')}
              intent='primary'
              disabled={!props.canEditIssuesInMeeting.allowed}
              tooltip={
                !props.canEditIssuesInMeeting.allowed
                  ? {
                      msg: props.canEditIssuesInMeeting.message,
                      type: 'light',
                      position: 'top center',
                    }
                  : undefined
              }
              onClick={() => onSubmit()}
            >
              {t('Yes')}
            </BtnText>
          </Modal.Footer>
        </Modal>
      )}
    </CreateForm>
  )
})

export default UnsolveIssueModal
