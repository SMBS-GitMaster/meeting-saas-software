import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import {
  EditForm,
  FormFieldArray,
  FormValuesForSubmit,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Drawer,
  FormControl,
  GridContainer,
  GridItem,
  SelectUserInputMultipleSelection,
  Text,
  TextInput,
  UserOptionMetadata,
  useTheme,
} from '@mm/core-web/ui'

import { getRecordOfOverlazyDrawerIdToDrawerTitle } from '@mm/bloom-web/bloomProvider'
import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { HierarchicalOrgChartSeat } from '../../types'
import { RoleInput } from './roleInput'
import {
  SupervisorInput,
  SupervisorInputMetadata,
} from './selectSupervisorInput'

export const EDIT_ORG_CHART_SEAT_DRAWER_ID = 'EditOrgChartSeatDrawer'

export interface IEditOrgChartSeatValues {
  positionTitle: string
  userIds: Array<Id>
  roles: Array<{
    id: Id
    name: string
  }>
  supervisorId: Maybe<Id>
}

export interface IEditOrgChartSeatDrawerActions {
  onEditSeat: (opts: {
    values: Partial<FormValuesForSubmit<IEditOrgChartSeatValues, true, 'roles'>>
    onListItemCreated: (opts: { itemId: Id; temporaryId: Id }) => void
  }) => Promise<void>
  onEditSeatDrawerClosed: () => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
  onSupervisorChange: (newValue: Maybe<Id>) => void
}

export interface IEditOrgChartSeatDrawerProps {
  getData: () => {
    seat: HierarchicalOrgChartSeat
    getUserOptions: () => Array<{
      value: Id
      metadata: UserOptionMetadata
    }>
    getSupervisorOptions: () => Array<{
      value: Id
      metadata: SupervisorInputMetadata
    }>
  }
  getActions: () => IEditOrgChartSeatDrawerActions
}

export default observer(function EditOrgChartSeatDrawer(
  props: IEditOrgChartSeatDrawerProps
) {
  const { closeOverlazy } = useOverlazyController()

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()

  const memoizedEditOrgChartSeatFormValues = useComputed(
    () => {
      const seat = props.getData().seat

      const roles = seat.position?.roles || []

      return {
        positionTitle: seat.position?.title || '',
        userIds: seat.users.nodes.map((u) => u.id),
        roles,
        supervisorId: seat.supervisor?.id ?? null,
      }
    },
    { name: 'EditOrgChartSeatDrawer-memoizedEditOrgChartSeatFormValues' }
  )
  const formValues = memoizedEditOrgChartSeatFormValues()

  const {
    canEditPositionTitle,
    canEditRoles,
    canEditSupervisor,
    canEditUsers,
  } = props.getData().seat.permissions

  return (
    <EditForm
      isLoading={false}
      values={formValues}
      disabled={false}
      disabledTooltip={
        // !currentUserPermissions.canEditTodosInMeeting.allowed
        //   ? {
        //       msg: currentUserPermissions.canEditTodosInMeeting.message,
        //       position: 'top center',
        //     }
        //   : undefined
        undefined
      }
      validation={
        {
          positionTitle: formValidators.string({
            additionalRules: [required()],
          }),
          userIds: formValidators.array({
            optional: true,
          }),
          roles: formValidators.arrayOfNodes({
            additionalRules: [],
          }),
          supervisorId: formValidators.stringOrNumber({
            optional: true,
          }),
        } satisfies GetParentFormValidation<IEditOrgChartSeatValues>
      }
      onSubmit={(values, onListItemCreated) =>
        props.getActions().onEditSeat({ values, onListItemCreated })
      }
    >
      {({ saveState, hasError, onFieldChange, fieldNames, onResetForm }) => {
        return (
          <Drawer
            id={EDIT_ORG_CHART_SEAT_DRAWER_ID}
            type='edit'
            showEmbeddedDrawer={false}
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                EDIT_ORG_CHART_SEAT_DRAWER_ID
              ]
            }
            saveState={saveState}
            saveAndCloseDisabled={hasError}
            saveDisabledTooltip={undefined}
            drawerHasUnsavedChanges={
              hasError || saveState === 'unsaved' || saveState == 'saving'
            }
            onHandleCloseDrawerWithUnsavedChangesProtection={
              props.getActions().onHandleCloseDrawerWithUnsavedChangesProtection
            }
            onResetForm={onResetForm}
            closeOverlazyDrawer={() => {
              closeOverlazy({ type: 'Drawer' })
              props.getActions().onEditSeatDrawerClosed()
            }}
          >
            {() => {
              return (
                <GridContainer columns={12} withoutMargin={true}>
                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <TextInput
                      id={'positionTitle'}
                      name={fieldNames.positionTitle}
                      disabled={!canEditPositionTitle.allowed}
                      tooltip={
                        !canEditPositionTitle.allowed
                          ? {
                              msg: canEditPositionTitle.message,
                              position: 'top center',
                            }
                          : undefined
                      }
                      formControl={{
                        label: t(`Seat title`),
                      }}
                      placeholder={t('Type a title')}
                      width={'100%'}
                    />
                  </GridItem>

                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <SelectUserInputMultipleSelection
                      id={'ownerIds'}
                      name={fieldNames.userIds}
                      disabled={!canEditUsers.allowed}
                      tooltip={
                        !canEditUsers.allowed
                          ? {
                              msg: canEditUsers.message,
                              position: 'top center',
                            }
                          : undefined
                      }
                      options={props.getData().getUserOptions()}
                      placeholder={t('Type or choose assigned employees')}
                      unknownItemText={t('Unknown user')}
                      formControl={{
                        label: t('Employee(s) in seat'),
                      }}
                      width={'100%'}
                    />
                  </GridItem>

                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <FormControl
                      label={t('Roles')}
                      labelFor={fieldNames.roles}
                      width='100%'
                    >
                      <Text
                        type='body'
                        color={{
                          intent: 'deemph',
                        }}
                      >
                        {t(
                          'The top roles and responsibilities written with as few words as possible. Together, they represent greater than 80% of the value this person brings in their role.'
                        )}
                      </Text>
                      <FormFieldArray<{
                        parentFormValues: IEditOrgChartSeatValues
                        arrayFieldName: typeof fieldNames.roles
                      }>
                        name={fieldNames.roles}
                        validation={{
                          name: formValidators.string({
                            optional: true,
                          }),
                        }}
                      >
                        {({
                          values,
                          fieldArrayPropNames,
                          onAddFieldArrayItem,
                        }) => {
                          return (
                            <>
                              {values.map((role, idx) => (
                                <RoleInput
                                  // without values.length added to the key, it will not re-render the component when the number of roles changes
                                  // which causes issues with auto-add/remove on enter/backspacke
                                  key={`${role.id}-${values.length}`}
                                  id={role.id}
                                  fieldArrayPropNames={fieldArrayPropNames}
                                  formControl={{
                                    label: t('Role(s)'),
                                  }}
                                  disabled={!canEditRoles.allowed}
                                  tooltip={
                                    !canEditRoles.allowed
                                      ? {
                                          msg: canEditRoles.message,
                                        }
                                      : undefined
                                  }
                                  roleIndex={idx}
                                  numberOfRoles={values.length}
                                  previousRoleId={values[idx - 1]?.id}
                                  nextRoleId={values[idx + 1]?.id}
                                />
                              ))}

                              <div
                                css={css`
                                  display: flex;
                                  justify-content: flex-end;
                                  align-items: center;
                                  margin-top: ${theme.sizes.spacing12};
                                `}
                              >
                                <BtnText
                                  intent='tertiary'
                                  iconProps={{
                                    iconName: 'plusIcon',
                                  }}
                                  ariaLabel={t('Add role')}
                                  onClick={() => {
                                    onAddFieldArrayItem(values.length)
                                  }}
                                  css={css`
                                    padding-right: ${theme.sizes.spacing16};
                                    padding-left: ${theme.sizes.spacing16};
                                  `}
                                  disabled={!canEditRoles.allowed}
                                  tooltip={
                                    !canEditRoles.allowed
                                      ? {
                                          msg: canEditRoles.message,
                                          position: 'top center',
                                        }
                                      : undefined
                                  }
                                >
                                  <Text type='body' weight='semibold'>
                                    {t('Add role')}
                                  </Text>
                                </BtnText>
                              </div>
                            </>
                          )
                        }}
                      </FormFieldArray>
                    </FormControl>
                  </GridItem>

                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <SupervisorInput
                      id={'supervisorId'}
                      name={fieldNames.supervisorId}
                      options={props.getData().getSupervisorOptions()}
                      unknownItemText={t('Unknown seat')}
                      placeholder={t('Type or choose assigned supervisor')}
                      formControl={{
                        label: t('Supervisor of seat'),
                      }}
                      disabled={
                        !canEditSupervisor.allowed ||
                        props.getData().getSupervisorOptions().length === 0
                      }
                      tooltip={
                        !canEditSupervisor.allowed
                          ? {
                              msg: canEditSupervisor.message,
                              position: 'top center',
                            }
                          : props.getData().getSupervisorOptions().length === 0
                            ? {
                                msg: t(
                                  'Cannot update the supervisor of a root seat unless another root seat exists'
                                ),
                                position: 'top center',
                              }
                            : undefined
                      }
                      width={'100%'}
                      onChange={(newValue) => {
                        // apply immediately so that we don't wait for the form's submit debounce to change the supervisor optimistically
                        // and then center it
                        onFieldChange(fieldNames.supervisorId, newValue, {
                          applyImmediately: true,
                        })
                        props.getActions().onSupervisorChange(newValue)
                      }}
                    />
                  </GridItem>
                </GridContainer>
              )
            }}
          </Drawer>
        )
      }}
    </EditForm>
  )
})
