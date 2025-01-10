import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomBusinessPlanMutations,
  useBloomCustomTerms,
  useBloomMeetingNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useNavigation } from '@mm/core-web/router'
import {
  BtnText,
  Loading,
  SelectInputSingleSelection,
  Text,
  TextEllipsis,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { paths } from '@mm/bloom-web/router/paths'

import { useAction, useComputed } from '../../performance/mobx'
import { getBusinessPlanPermissions } from '../businessPlanPermissions'

interface ICreateBusinessPlanModalValues {
  meetingId: Id
}

export const CreateBusinessPlanModal = observer(
  function CreateBusinessPlanModal() {
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { navigate } = useNavigation()
    const { createBusinessPlanForMeeting } = useBloomBusinessPlanMutations()
    const { closeOverlazy, openOverlazy } = useOverlazyController()
    const { t } = useTranslation()

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ isOrgAdmin, id }) => ({
            isOrgAdmin,
            id,
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        meetings: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ id, name, businessPlanId, currentMeetingAttendee }) => ({
            id,
            name,
            businessPlanId,
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `CreateBusinessPlanModal`,
      }
    )

    const getMeetingsLookupForCreateBusinessPlan = useComputed(
      () => {
        return (subscription().data.meetings?.nodes || []).map((meeting) => {
          const { canCreateBusinessPlan } = getBusinessPlanPermissions({
            currentUserPermissions:
              meeting.currentMeetingAttendee.permissions ?? null,
            isOrgAdmin: !!subscription().data.currentUser?.isOrgAdmin,
          })

          if (!canCreateBusinessPlan.allowed) {
            return {
              value: meeting.id,
              text: meeting.name,
              disabled: true,
              tooltip: {
                msg: canCreateBusinessPlan.message,
              },
            }
          } else if (meeting.businessPlanId) {
            return {
              value: meeting.id,
              text: meeting.name,
              disabled: true,
              tooltip: {
                msg: t('This meeting already has a {{bp}} attached', {
                  bp: terms.businessPlan.lowercaseSingular,
                }),
              },
            }
          } else {
            return {
              value: meeting.id,
              text: meeting.name,
            }
          }
        })
      },
      { name: `createBusinessPlanModal-getMeetingsLookupForCreateBusinessPlan` }
    )

    const onHandleNavigateToBusinessPlan = useAction(
      (opts: { businessPlanId: Id }) => {
        const { businessPlanId } = opts
        return navigate(paths.businessPlan({ businessPlanId }))
      }
    )

    const onSubmit = useAction(
      async (values: ICreateBusinessPlanModalValues) => {
        try {
          const businessPlanId = await createBusinessPlanForMeeting({
            meetingId: values.meetingId,
          })
          onHandleNavigateToBusinessPlan({ businessPlanId })

          closeOverlazy({
            type: 'Modal',
            name: 'CreateBusinessPlanModal',
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error creating {{bp}}`, {
              bp: terms.businessPlan.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      }
    )

    return (
      <CreateForm
        isLoading={subscription().querying}
        values={
          {
            meetingId: null,
          } as { meetingId: Maybe<string> }
        }
        validation={
          {
            meetingId: formValidators.stringOrNumber({
              additionalRules: [required()],
              errorMessage: t('Please select a meeting'),
            }),
          } satisfies GetParentFormValidation<{
            meetingId: Maybe<string>
          }>
        }
        onSubmit={async (values) => {
          if (!values.meetingId) return

          await onSubmit({
            meetingId: values.meetingId,
          })
        }}
      >
        {({ values, fieldNames, onSubmit, hasError }) => {
          if (!values) {
            return <Loading />
          }

          return (
            <Modal
              id={'CreateBusinessPlanModal'}
              onHide={() =>
                closeOverlazy({
                  type: 'Modal',
                  name: 'CreateBusinessPlanModal',
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
                    max-width: ${toREM(460)};
                    padding-right: ${toREM(34)};
                  `}
                >
                  <TextEllipsis
                    lineLimit={1}
                    wordBreak={true}
                    css={css`
                      font-size: inherit;
                      font-weight: inherit;
                    `}
                  >
                    {t('Add {{bp}}', {
                      bp: terms.businessPlan.lowercaseSingular,
                    })}
                  </TextEllipsis>
                </Modal.Title>
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
                    margin-bottom: ${(prop) => prop.theme.sizes.spacing32};
                    max-width: ${toREM(432)};
                  `}
                >
                  <Text
                    type={'body'}
                    color={{ color: theme.colors.bodyTextDefault }}
                  >
                    {t('Choose a meeting to create a {{bp}}', {
                      bp: terms.businessPlan.lowercaseSingular,
                    })}
                  </Text>
                </div>
                <SelectInputSingleSelection
                  id={'selectMeetingForCreateBusinessPlan'}
                  name={fieldNames.meetingId}
                  unknownItemText={t('Unknown meeting')}
                  options={getMeetingsLookupForCreateBusinessPlan()}
                  placeholder={t('Select a meeting')}
                  formControl={{
                    label: t('Select a meeting'),
                  }}
                  width={'100%'}
                  disableOptionOnSelect={false}
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
                      name: 'CreateBusinessPlanModal',
                    })
                  }
                >
                  {t('Cancel')}
                </BtnText>
                <BtnText
                  intent='primary'
                  ariaLabel={t('Save')}
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
  }
)

export default CreateBusinessPlanModal
