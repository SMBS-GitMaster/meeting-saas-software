import DOMPurify from 'dompurify'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  useBloomHeadlineMutations,
  useBloomHeadlineNode,
  useBloomMeetingNode,
  useBloomNoteQueries,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Modal,
  SelectInputMultipleSelection,
  Text,
  toREM,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getCopyHeadlineToMeetingsModalPermissions } from './copyHeadlineToMeetingsModalPermissions'

interface ICopyHeadlineToMeetingsModalValues {
  meetingIds: Array<Id>
}

interface ICopyHeadlineToMeetingsModalProps {
  headlineToCopyId: Id
  currentMeetingId: Id
}

export const CopyHeadlineToMeetingsModal: React.FC<ICopyHeadlineToMeetingsModalProps> =
  observer(function CopyHeadlineToMeetingsModal({
    headlineToCopyId,
    currentMeetingId,
  }) {
    const [headlineNotesTextAndHtml, setHeadlineNotesTextAndHtml] =
      useState<Maybe<{ text: string; html: string }>>(null)

    const terms = useBloomCustomTerms()
    const { closeOverlazy, openOverlazy } = useOverlazyController()

    const { copyHeadlineToMeetings } = useBloomHeadlineMutations()
    const { getNoteById } = useBloomNoteQueries()
    const { logError } = useMMErrorLogger()
    const { t } = useTranslation()

    const meetingsListLookupSubscription = useEditMeetingsLookupSubscription()

    const subscription = useSubscription(
      {
        headline: queryDefinition({
          def: useBloomHeadlineNode(),
          map: ({ title, notesId, assignee }) => ({
            title,
            notesId,
            assignee: assignee({
              map: ({ fullName }) => ({
                fullName,
              }),
            }),
          }),
          target: { id: headlineToCopyId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ name, currentMeetingAttendee }) => ({
            name,
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
          }),
          target: { id: currentMeetingId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `CopyHeadlineToMeetingsModal-${headlineToCopyId}`,
      }
    )

    const { canCreateHeadlinesInMeeting } = useMemo(() => {
      return getCopyHeadlineToMeetingsModalPermissions(
        subscription().data.meeting?.currentMeetingAttendee.permissions ?? null
      )
    }, [subscription().data.meeting?.currentMeetingAttendee.permissions])

    const meetingsLookup = useMemo(() => {
      return getUsersMeetingsLookup({
        meetings:
          meetingsListLookupSubscription().data.user?.meetings.nodes ?? [],
        includePersonalMeeting: false,
        removeCurrentMeetingId: {
          currentMeetingId,
        },
      })
    }, [
      meetingsListLookupSubscription().data.user?.meetings.nodes,
      currentMeetingId,
    ])

    const notesTextForEtherpad = useMemo(() => {
      const translatedMeeting = t('Meeting')
      const translatedOwner = t('Owner')
      const translatedDetails = t('Details')

      return `\n${translatedMeeting}: ${subscription().data.meeting?.name}\n${
        terms.headline.singular
      }: ${subscription().data.headline?.title}\n${translatedOwner}: ${
        subscription().data.headline?.assignee.fullName
      }\n${translatedDetails}: ${headlineNotesTextAndHtml?.text || ''}`
    }, [
      subscription().data.meeting?.name,
      terms.headline.singular,
      subscription().data.headline?.title,
      subscription().data.headline?.assignee.fullName,
      headlineNotesTextAndHtml?.text,
      t,
    ])

    const onGetNoteById = useCallback(async () => {
      const notesId = subscription().data.headline?.notesId
      if (notesId) {
        try {
          const response = await getNoteById({ noteId: notesId })
          setHeadlineNotesTextAndHtml({
            text: response.text,
            html: response.html,
          })
        } catch (e) {
          logError(e, {
            context: `Error fetching note data for headline ${headlineToCopyId} with notesId ${notesId}`,
          })
        }
      }
    }, [
      headlineToCopyId,
      subscription().data.headline?.notesId,
      getNoteById,
      logError,
      setHeadlineNotesTextAndHtml,
    ])

    const onSubmit = useCallback(
      async (values: ICopyHeadlineToMeetingsModalValues) => {
        try {
          // Note: The copyHeadlineToMeetings mutation can take like 20+ seconds to complete.
          // Since we use mobx for toasts, we can dismount this component and the toasts will
          // still toast. UX request was to do the mutation in the background and not wait for it to complete
          // with the modal open.
          closeOverlazy({ type: 'Modal', name: 'CopyHeadlineToMeetingsModal' })
          await copyHeadlineToMeetings({
            headlineToCopyId,
            meetingIds: values.meetingIds,
            notesText: notesTextForEtherpad,
          })
          openOverlazy('Toast', {
            type: 'success',
            text: t(`{{headline}} copied`, {
              headline: terms.headline.singular,
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
            text: t(`Error copying {{headline}}`, {
              headline: terms.headline.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      },
      [
        closeOverlazy,
        openOverlazy,
        headlineToCopyId,
        terms.headline,
        notesTextForEtherpad,
        copyHeadlineToMeetings,
        t,
      ]
    )

    useEffect(() => {
      if (!subscription().querying) {
        onGetNoteById()
      }
    }, [subscription().querying, onGetNoteById])

    return (
      <CreateForm
        isLoading={subscription().querying}
        disabled={!canCreateHeadlinesInMeeting.allowed}
        disabledTooltip={
          !canCreateHeadlinesInMeeting.allowed
            ? { msg: canCreateHeadlinesInMeeting.message }
            : undefined
        }
        values={{
          meetingIds: [] as Array<Id>,
        }}
        validation={
          {
            meetingIds: formValidators.array({
              additionalRules: [required()],
            }),
          } satisfies GetParentFormValidation<{
            meetingIds: Array<Id>
          }>
        }
        onSubmit={onSubmit}
      >
        {({ fieldNames, onSubmit, hasError }) => {
          return (
            <Modal
              id={'CopyHeadlineToMeetingsModal'}
              onHide={() =>
                closeOverlazy({
                  type: 'Modal',
                  name: 'CopyHeadlineToMeetingsModal',
                })
              }
            >
              <Modal.Header
                css={css`
                  padding-bottom: 0;
                `}
              >
                <Modal.Title>
                  {t('Copy headline to another meeting/s')}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body
                css={css`
                  padding-top: ${(props) => props.theme.sizes.spacing16};
                  max-width: ${toREM(480)};
                  padding-bottom: 0 !important;
                `}
              >
                <Text
                  type={'body'}
                  css={css`
                    padding-bottom: ${(prop) => prop.theme.sizes.spacing24};
                  `}
                >
                  {t('Share this {{headline}} with the following meeting/s:', {
                    headline: terms.headline.lowercaseSingular,
                  })}
                </Text>

                <div
                  css={css`
                    padding-bottom: ${(prop) => prop.theme.sizes.spacing24};
                  `}
                >
                  <div>
                    <Text wordBreak={true}>
                      <Text weight='semibold'>{terms.headline.singular}:</Text>{' '}
                      {subscription().data?.headline?.title}
                    </Text>
                  </div>
                  <div>
                    <Text>
                      <Text weight='semibold'>{t('Owner')}:</Text>{' '}
                      {subscription().data?.headline?.assignee.fullName}
                    </Text>
                  </div>
                  <div>
                    <Text>
                      <Text weight='semibold'>{t('Details')}:</Text>{' '}
                    </Text>
                    {headlineNotesTextAndHtml?.html && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            headlineNotesTextAndHtml.html
                          ),
                        }}
                        css={css`
                          max-height: ${toREM(256)};
                          overflow: auto;
                        `}
                      />
                    )}
                  </div>
                </div>
                <SelectInputMultipleSelection
                  id={'copyHeadlineToMeetingsModalSelectInputSingleSelection'}
                  placeholder={t('Start typing or choose from drop down')}
                  options={meetingsLookup}
                  unknownItemText={t('Unknown meeting')}
                  name={fieldNames.meetingIds}
                  formControl={{
                    label: t('Choose meeting/s'),
                  }}
                  width='100%'
                />
              </Modal.Body>
              <Modal.Footer
                css={css`
                  padding-top: ${(prop) => prop.theme.sizes.spacing16};
                `}
              >
                <BtnText
                  intent='tertiary'
                  ariaLabel={t('Cancel')}
                  onClick={() =>
                    closeOverlazy({
                      type: 'Modal',
                      name: 'CopyHeadlineToMeetingsModal',
                    })
                  }
                >
                  {t('Cancel')}
                </BtnText>
                <BtnText
                  intent='primary'
                  ariaLabel={t('Copy')}
                  onClick={onSubmit}
                  disabled={hasError}
                  tooltip={
                    hasError
                      ? {
                          msg: t('Please complete all required fields.'),
                          position: 'top center',
                        }
                      : undefined
                  }
                >
                  {t('Share')}
                </BtnText>
              </Modal.Footer>
            </Modal>
          )
        }}
      </CreateForm>
    )
  })

export default CopyHeadlineToMeetingsModal
