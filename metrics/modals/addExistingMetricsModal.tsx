import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'

import {
  UserAvatarColorType,
  useBloomCustomTerms,
  useBloomMeetingNode,
} from '@mm/core-bloom'

import { useBloomMetricMutations } from '@mm/core-bloom/metrics/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  SelectMetricsInputMultipleSelection,
  Text,
  useTheme,
} from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface IAddExistingMetricsModalValues {
  metricIds: Array<Id>
}

interface IAddExistingMetricsModalProps {
  currentMeetingId: Id
}

export const AddExistingMetricsModal = observer(
  function AddExistingMetricsModal({
    currentMeetingId,
  }: IAddExistingMetricsModalProps) {
    const { closeOverlazy, openOverlazy } = useOverlazyController()

    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const theme = useTheme()
    const { addExistingMetricToMeeting } = useBloomMetricMutations()

    const subscription = useSubscription(
      {
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ metricAddExistingLookup }) => ({
            metricAddExistingLookup: metricAddExistingLookup({
              map: ({ title, meetings, assignee }) => ({
                title,
                meetings: meetings({
                  map: ({ id, name }) => ({ id, name }),
                }),
                assignee: assignee({
                  map: ({
                    id,
                    firstName,
                    lastName,
                    fullName,
                    avatar,
                    userAvatarColor,
                  }) => ({
                    id,
                    firstName,
                    lastName,
                    fullName,
                    avatar,
                    userAvatarColor,
                  }),
                }),
              }),
            }),
          }),
          target: {
            id: currentMeetingId,
          },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      { subscriptionId: 'AddExistingMetricsModal' }
    )

    const metricsLookup: Array<{
      value: Id
      metadata: {
        metricName: string
        firstName: string
        lastName: string
        fullName: string
        avatar: Maybe<string>
        userAvatarColor: UserAvatarColorType
        meetings: Array<{ id: Id; name: string }>
      }
    }> = useMemo(() => {
      return (
        subscription().data.meeting?.metricAddExistingLookup.nodes || []
      ).map((metric) => {
        return {
          value: metric.id,
          metadata: {
            metricName: metric.title,
            firstName: metric.assignee.firstName,
            lastName: metric.assignee.lastName,
            fullName: metric.assignee.fullName,
            avatar: metric.assignee.avatar || null,
            userAvatarColor: metric.assignee.userAvatarColor,
            meetings: metric.meetings.nodes || [],
          },
        }
      })
    }, [subscription().data.meeting?.metricAddExistingLookup.nodes])

    const onSubmit = async (values: IAddExistingMetricsModalValues) => {
      try {
        await Promise.all(
          values.metricIds.map(async (metricId) => {
            return await addExistingMetricToMeeting({
              metricId,
              meetingId: currentMeetingId,
            })
          })
        )

        closeOverlazy({ type: 'Modal', name: 'AddExistingMetricsModal' })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error adding {{metrics}} to meeting`, {
            metrics: terms.metric.lowercasePlural,
          }),
          error: new UserActionError(error),
        })
      }
    }

    return (
      <CreateForm
        isLoading={subscription().querying}
        values={
          {
            metricIds: [],
          } as IAddExistingMetricsModalValues
        }
        validation={
          {
            metricIds: formValidators.array({}),
          } as GetParentFormValidation<IAddExistingMetricsModalValues>
        }
        onSubmit={onSubmit}
      >
        {({ fieldNames, onSubmit, hasError, values }) => {
          return (
            <>
              {!values ? null : (
                <Modal
                  id={'AddExistingMetricsModal'}
                  onHide={() =>
                    closeOverlazy({
                      type: 'Modal',
                      name: 'AddExistingMetricsModal',
                    })
                  }
                >
                  <Modal.Header
                    css={css`
                      padding-bottom: 0;
                      color: ${(props) => props.theme.colors.bodyTextDefault};
                    `}
                  >
                    <Modal.Title>
                      {t('Add exisiting {{metrics}}', {
                        metrics: terms.metric.lowercasePlural,
                      })}
                    </Modal.Title>
                  </Modal.Header>

                  <Modal.Body
                    css={css`
                      padding-top: ${(props) => props.theme.sizes.spacing32};
                      overflow-y: unset !important;
                      padding-bottom: 0 !important;
                    `}
                  >
                    <div
                      css={css`
                        margin-bottom: ${(prop) => prop.theme.sizes.spacing4};
                      `}
                    >
                      <Text
                        type={'body'}
                        weight={'semibold'}
                        color={{ color: theme.colors.bodyTextDefault }}
                      >
                        {t('Search for {{metrics}}', {
                          metrics: terms.metric.lowercasePlural,
                        })}
                      </Text>
                    </div>
                    <SelectMetricsInputMultipleSelection
                      id={'metricIdsId'}
                      unknownItemText={t('Unknown {{metric}}', {
                        metric: terms.metric.lowercaseSingular,
                      })}
                      name={fieldNames.metricIds}
                      options={metricsLookup}
                      placeholder={t('Type here to search')}
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
                          name: 'AddExistingMetricsModal',
                        })
                      }
                    >
                      {t('Cancel')}
                    </BtnText>
                    <BtnText
                      intent='primary'
                      ariaLabel={t('Add')}
                      onClick={onSubmit}
                      disabled={hasError}
                    >
                      {t('Add')}
                    </BtnText>
                  </Modal.Footer>
                </Modal>
              )}
            </>
          )
        }}
      </CreateForm>
    )
  }
)

export default AddExistingMetricsModal
