import DOMPurify from 'dompurify'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'
import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'
import { useMMErrorLogger } from '@mm/core/logging'

import {
  getUsersMeetingsLookup,
  useBloomCustomTerms,
  useBloomIssueNode,
  useBloomIssuesMutations,
  useBloomNoteQueries,
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
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

interface IMoveToAnotherMeetingModalValues {
  meetingId: Id
}

interface IMoveIssueToAnotherMeetingModalProps {
  issueId: Id
  currentMeetingId: Id
}

export const MoveIssueToAnotherMeetingModal: React.FC<IMoveIssueToAnotherMeetingModalProps> =
  observer(function MoveIssueToAnotherMeetingModal({
    issueId,
    currentMeetingId,
  }) {
    const [issueNotesHTML, setIssueNotesHTML] = useState<Maybe<string>>(null)

    const { closeOverlazy, openOverlazy } = useOverlazyController()

    const { getNoteById } = useBloomNoteQueries()
    const { logError } = useMMErrorLogger()
    const { moveIssueToAnotherMeeting } = useBloomIssuesMutations()
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    const meetingsListLookupSubscription = useEditMeetingsLookupSubscription()

    const subscription = useSubscription(
      {
        issue: queryDefinition({
          def: useBloomIssueNode(),
          map: ({ title, notesId, assignee }) => ({
            title,
            notesId,
            assignee: assignee({
              map: ({ fullName }) => ({
                fullName,
              }),
            }),
          }),
          target: { id: issueId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `MoveIssueToAnotherMeetingModal-${issueId}`,
      }
    )

    const meetingsLookup = getUsersMeetingsLookup({
      meetings:
        meetingsListLookupSubscription().data.user?.meetings.nodes ?? [],
      includePersonalMeeting: false,
      removeCurrentMeetingId: {
        currentMeetingId: currentMeetingId,
      },
    })

    const notesId = subscription().data.issue?.notesId
    const onGetNoteById = useCallback(async () => {
      if (notesId) {
        try {
          const response = await getNoteById({ noteId: notesId })
          setIssueNotesHTML(response.html)
        } catch (e) {
          logError(e, {
            context: `Error fetching note data for issue ${issueId} with notesId ${notesId}`,
          })
        }
      }
    }, [issueId, notesId, getNoteById, logError, setIssueNotesHTML])

    const onSubmit = async (values: IMoveToAnotherMeetingModalValues) => {
      try {
        await moveIssueToAnotherMeeting({
          issueId: issueId,
          recurrenceId: values.meetingId,
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t(`{{issue}} moved`, {
            issue: terms.issue.singular,
          }),
          // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410
          undoClicked: () =>
            console.log(
              '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
            ),
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error moving {{issue}}`, {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
      }
      closeOverlazy({ type: 'Modal', name: 'MoveIssueToAnotherMeetingModal' })
    }

    useEffect(() => {
      if (!subscription().querying) {
        onGetNoteById()
      }
    }, [subscription().querying, onGetNoteById])

    return (
      <CreateForm
        isLoading={subscription().querying}
        values={{
          meetingId: '' as Id,
        }}
        validation={
          {
            meetingId: formValidators.stringOrNumber({
              additionalRules: [required()],
            }),
          } satisfies GetParentFormValidation<{
            meetingId: Id
          }>
        }
        onSubmit={onSubmit}
      >
        {({ fieldNames, onSubmit, hasError }) => {
          return (
            <Modal
              id={'MoveIssueToAnotherMeetingModal'}
              onHide={() =>
                closeOverlazy({
                  type: 'Modal',
                  name: 'MoveIssueToAnotherMeetingModal',
                })
              }
            >
              <Modal.Header
                css={css`
                  padding-bottom: 0;
                `}
              >
                <Modal.Title>{t('Move to another meeting')}</Modal.Title>
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
                    {t('Send this {{issue}} to the following meeting:', {
                      issue: terms.issue.lowercaseSingular,
                    })}
                  </Text>
                </div>
                <div
                  css={css`
                    max-width: ${toREM(432)};
                    margin-bottom: ${(prop) => prop.theme.sizes.spacing32};
                  `}
                >
                  <div>
                    <Text wordBreak={true}>
                      <Text weight='bold'>{terms.issue.singular}:</Text>{' '}
                      {subscription().data?.issue?.title}
                    </Text>
                  </div>
                  <div>
                    <Text>
                      <Text weight='bold'>{t('Owner')}:</Text>{' '}
                      {subscription().data?.issue?.assignee.fullName}
                    </Text>
                  </div>
                  <div>
                    <Text>
                      <Text weight='bold'>{t('Details')}:</Text>{' '}
                    </Text>
                    {issueNotesHTML && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(issueNotesHTML),
                        }}
                        css={css`
                          max-height: ${toREM(256)};
                          overflow: auto;
                        `}
                      />
                    )}
                  </div>
                </div>
                <SelectInputSingleSelection
                  id={'moveToAnotherMeetingModalSelectInputSingleSelection'}
                  placeholder={t('Start typing or choose from drop down')}
                  options={meetingsLookup}
                  unknownItemText={t('Unknown meeting')}
                  name={fieldNames.meetingId}
                  formControl={{
                    label: t('Choose meeting'),
                  }}
                  width='100%'
                />
              </Modal.Body>
              <Modal.Footer
                css={css`
                  padding-top: ${(prop) =>
                    prop.theme.sizes.spacing16} !important;
                `}
              >
                <BtnText
                  intent='tertiary'
                  ariaLabel={t('Cancel')}
                  onClick={() =>
                    closeOverlazy({
                      type: 'Modal',
                      name: 'MoveIssueToAnotherMeetingModal',
                    })
                  }
                >
                  {t('Cancel')}
                </BtnText>
                <BtnText
                  intent='primary'
                  ariaLabel={t('Move')}
                  onClick={onSubmit}
                  disabled={hasError}
                >
                  {t('Move')}
                </BtnText>
              </Modal.Footer>
            </Modal>
          )
        }}
      </CreateForm>
    )
  })

export default MoveIssueToAnotherMeetingModal
