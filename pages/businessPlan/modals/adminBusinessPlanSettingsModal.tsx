import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import {
  type Id,
  queryDefinition,
  useAction,
  useComputed,
  useSubscription,
} from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomBusinessPlanMutations,
  useBloomBusinessPlanNode,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  SelectInputSingleSelection,
  Text,
  TextEllipsis,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface IAdminBusinessPlanSettingsModalValues {
  businessPlanId: Maybe<Id>
}

// this is a typescript hack to stop singleInputSelection from incorrectly inferring
// the type for TValueType based on this value.
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const SPECIAL_NO_BP_VALUE: string = '__SPECIAL_NO_BP_VALUE__'

export const AdminBusinessPlanSettingsModal = observer(
  function AdminBusinessPlanSettingsModal() {
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { setV3BusinessPlanId } = useBloomBusinessPlanMutations()
    const { closeOverlazy, openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ isOrgAdmin, id, orgSettings }) => ({
            isOrgAdmin,
            id,
            orgSettings: orgSettings({
              map: ({ v3BusinessPlanId }) => ({ v3BusinessPlanId }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        businessPlans: queryDefinition({
          def: useBloomBusinessPlanNode(),
          sort: { title: 'asc' },
          map: ({ id, title, isShared }) => ({
            id,
            title,
            isShared,
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `AdminBusinessPlanSettingsModal`,
      }
    )

    const businessPlanId =
      subscription().data.currentUser?.orgSettings.v3BusinessPlanId
    const memoizedBuisnessPlanFormValues = useMemo(() => {
      return {
        businessPlanId: businessPlanId ?? SPECIAL_NO_BP_VALUE,
      }
    }, [businessPlanId])

    const getBusinessPlanLookup = useComputed(
      () => {
        const lookup = (subscription().data.businessPlans?.nodes || []).map(
          (bp) => {
            return {
              value: bp.id,
              text: bp.title,
            }
          }
        )

        const noBpOption = { value: SPECIAL_NO_BP_VALUE, text: t('No plan') }

        return [noBpOption, ...lookup]
      },
      {
        name: 'AdminBusinessPlanSettingsModal-getBusinessPlanLookup',
      }
    )

    const onSubmit = useAction(
      async (values: IAdminBusinessPlanSettingsModalValues) => {
        try {
          const businessPlanId =
            values.businessPlanId === SPECIAL_NO_BP_VALUE
              ? null
              : values.businessPlanId

          await setV3BusinessPlanId({ businessPlanId })

          openOverlazy('Toast', {
            type: 'success',
            text: t('Main {{bp}} successfully {{action}}', {
              action:
                SPECIAL_NO_BP_VALUE === values.businessPlanId
                  ? t('removed')
                  : t('set'),
              bp: terms.businessPlan.singular,
            }),
            undoClicked: () => {
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              )
            },
          })

          closeOverlazy({
            type: 'Modal',
            name: 'AdminBusinessPlanSettingsModal',
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error setting main {{bp}}`, {
              bp: terms.businessPlan.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      }
    )

    return (
      <EditForm
        isLoading={subscription().querying}
        values={memoizedBuisnessPlanFormValues as { businessPlanId: Maybe<Id> }}
        validation={
          {
            businessPlanId: formValidators.stringOrNumber({
              errorMessage: t('Please select a {{bp}}', {
                bp: terms.businessPlan.lowercaseSingular,
              }),
            }),
          } as GetParentFormValidation<IAdminBusinessPlanSettingsModalValues>
        }
        autosave={false}
        sendDiffs={false}
        onSubmit={async () => {
          //no-op
        }}
      >
        {({ fieldNames, hasError, values }) => {
          return (
            <>
              {!values ? null : (
                <Modal
                  id={'AdminBusinessPlanSettingsModal'}
                  onHide={() =>
                    closeOverlazy({
                      type: 'Modal',
                      name: 'AdminBusinessPlanSettingsModal',
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
                        {t('Select main {{bp}} for organization.', {
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
                        {t(
                          'Select a plan to represent your entire organization. This plan will appear in presentation mode as the default {{bp}} to all org members. (Hidden tiles will not be visible.)',
                          {
                            bp: terms.businessPlan.lowercaseSingular,
                          }
                        )}
                      </Text>
                    </div>
                    <SelectInputSingleSelection<Id>
                      id={'businessPlanId'}
                      unknownItemText={t('Unknown {{bp}}', {
                        bp: terms.businessPlan.lowercaseSingular,
                      })}
                      width={'100%'}
                      specialValue={SPECIAL_NO_BP_VALUE}
                      name={fieldNames.businessPlanId}
                      formControl={{
                        label: t('Main {{bp}}', {
                          bp: terms.businessPlan.lowercaseSingular,
                        }),
                      }}
                      renderInternalSearchbar={{
                        placeholder: t('Search by plan title'),
                      }}
                      options={getBusinessPlanLookup()}
                      placeholder={t('Select a {{bp}}', {
                        bp: terms.businessPlan.lowercaseSingular,
                      })}
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
                          name: 'AdminBusinessPlanSettingsModal',
                        })
                      }
                    >
                      {t('Cancel')}
                    </BtnText>
                    <BtnText
                      intent='primary'
                      ariaLabel={t('Save')}
                      onClick={() => {
                        onSubmit({ businessPlanId: values.businessPlanId })
                      }}
                      disabled={hasError}
                    >
                      {t('Save')}
                    </BtnText>
                  </Modal.Footer>
                </Modal>
              )}
            </>
          )
        }}
      </EditForm>
    )
  }
)

export default AdminBusinessPlanSettingsModal
