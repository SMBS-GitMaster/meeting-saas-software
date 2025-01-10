import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'

import { useBloomWorkspaceNode } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Modal,
  SelectInputMultipleSelection,
  Text,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface ISaveMetricChartToWorkspaceModalValues {
  workspaceIds: Array<string>
}

export const SaveMetricChartToWorkspaceModal = observer(
  function SaveMetricChartToWorkspaceModal() {
    const { closeOverlazy } = useOverlazyController()

    const theme = useTheme()
    const { t } = useTranslation()

    const subscription = useSubscription(
      {
        workspaces: queryDefinition({
          def: useBloomWorkspaceNode(),
          map: ({ name, archived }) => ({
            name,
            archived,
          }),
          filter: { and: [{ archived: false }] },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      { subscriptionId: 'SaveMetricChartToWorkspaceModal' }
    )

    const workspacesLookup: Array<{
      value: Id
      text: string
    }> = (subscription().data?.workspaces?.nodes || []).map((workspace) => {
      return {
        value: workspace.id,
        text: workspace.name,
      }
    })

    const onSubmit = async (values: ISaveMetricChartToWorkspaceModalValues) => {
      //@TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1879 - use saveMetricTabToWorkspace
      console.log(
        '@TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1879 SaveMetricChartToWorkspaceModal onSubmit',
        values
      )
      closeOverlazy({ type: 'Modal', name: 'SaveMetricChartToWorkspaceModal' })
    }

    return (
      <CreateForm
        isLoading={subscription().querying}
        values={
          {
            workspaceIds: [],
          } as ISaveMetricChartToWorkspaceModalValues
        }
        validation={
          {
            workspaceIds: formValidators.array({}),
          } satisfies GetParentFormValidation<ISaveMetricChartToWorkspaceModalValues>
        }
        onSubmit={onSubmit}
      >
        {({ fieldNames, onSubmit, hasError, values }) => {
          return (
            <>
              {!values ? null : (
                <Modal
                  id={'SaveMetricChartToWorkspaceModal'}
                  onHide={() =>
                    closeOverlazy({
                      type: 'Modal',
                      name: 'SaveMetricChartToWorkspaceModal',
                    })
                  }
                >
                  <Modal.Header
                    css={css`
                      padding-bottom: 0;
                      color: ${(props) => props.theme.colors.bodyTextDefault};
                    `}
                  >
                    <Modal.Title>{t('Save to workspaces')}</Modal.Title>
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
                      `}
                    >
                      <Text
                        type={'body'}
                        color={{ color: theme.colors.bodyTextDefault }}
                      >
                        {t(
                          'Save this chart configuration as a tile to any of your workspaces.'
                        )}
                      </Text>
                    </div>
                    <SelectInputMultipleSelection
                      id={'workspaceIdsId'}
                      name={fieldNames.workspaceIds}
                      options={workspacesLookup}
                      placeholder={t('Type here to search')}
                      formControl={{ label: t('Choose workspaces') }}
                      unknownItemText={t('Unknown workspace')}
                      width={'100%'}
                    />
                  </Modal.Body>
                  <Modal.Footer
                    css={css`
                      padding-top: ${(prop) =>
                        prop.theme.sizes.spacing32} !important;
                    `}
                  >
                    <BtnText
                      intent='tertiary'
                      ariaLabel={t('Cancel')}
                      onClick={() =>
                        closeOverlazy({
                          type: 'Modal',
                          name: 'SaveMetricChartToWorkspaceModal',
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
                      {t('Create Tile')}
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

export default SaveMetricChartToWorkspaceModal
