import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import {
  CreateForm,
  FormFieldArray,
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

import { RoleInput } from './roleInput'
import {
  SupervisorInput,
  SupervisorInputMetadata,
} from './selectSupervisorInput'

export const CREATE_ORG_CHART_SEAT_DRAWER_ID = 'CreateOrgChartSeatDrawer'

export interface ICreateOrgChartSeatValues {
  positionTitle: string
  userIds: Array<Id>
  roles: Array<{
    id: Id
    name: string
  }>
  supervisorSeatId: Maybe<Id>
  createAnotherCheckedInDrawer: boolean
}

export interface ICreateOrgChartSeatDrawerActions {
  onCreateSeat: (opts: {
    values: ICreateOrgChartSeatValues
    onListItemCreated: (opts: { itemId: Id; temporaryId: Id }) => void
  }) => Promise<void>
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
  onSupervisorChange: (supervisorId: Maybe<Id>) => void
  onCreateSeatDrawerClosed: () => void
}

export interface ICreateOrgChartSeatDrawerProps {
  getData: () => {
    getUserOptions: () => Array<{
      value: Id
      metadata: UserOptionMetadata
    }>
    getSupervisorOptions: () => Array<{
      value: Id
      metadata: SupervisorInputMetadata
    }>
    getInitialSupervisorSeatId: () => Maybe<Id>
  }
  getActions: () => ICreateOrgChartSeatDrawerActions
}

const initialValues: BOmit<ICreateOrgChartSeatValues, 'supervisorSeatId'> = {
  positionTitle: '',
  userIds: [],
  roles: [],
  createAnotherCheckedInDrawer: false,
}

export default observer(function CreateOrgChartSeatDrawer(
  props: ICreateOrgChartSeatDrawerProps
) {
  const { closeOverlazy } = useOverlazyController()

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()

  const getValues = useComputed(
    () => {
      return {
        ...initialValues,
        supervisorSeatId: props.getData().getInitialSupervisorSeatId(),
      }
    },
    {
      name: 'CreateOrgChartSeatDrawer.getValues',
    }
  )

  return (
    <CreateForm
      isLoading={false}
      values={getValues()}
      disabled={false}
      disabledTooltip={
        // !currentUserPermissions.canCreateTodosInMeeting.allowed
        //   ? {
        //       msg: currentUserPermissions.canCreateTodosInMeeting.message,
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
          userIds: formValidators.array({}),
          roles: formValidators.array({}),
          supervisorSeatId: formValidators.stringOrNumber({
            optional: true,
          }),
          createAnotherCheckedInDrawer: formValidators.boolean({}),
        } satisfies GetParentFormValidation<ICreateOrgChartSeatValues>
      }
      onSubmit={async (values, onListItemCreated) =>
        await props.getActions().onCreateSeat({ values, onListItemCreated })
      }
    >
      {({ hasError, fieldNames, onFieldChange, onResetForm, onSubmit }) => {
        return (
          <Drawer
            id={CREATE_ORG_CHART_SEAT_DRAWER_ID}
            type='create'
            showEmbeddedDrawer={false}
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                CREATE_ORG_CHART_SEAT_DRAWER_ID
              ]
            }
            footerText={t('Create another seat')}
            saveDisabled={hasError}
            saveDisabledTooltip={
              // !currentUserPermissions.canCreateTodosInMeeting.allowed
              //   ? {
              //       msg: currentUserPermissions.canCreateTodosInMeeting.message,
              //       type: 'light',
              //       position: 'top left',
              //     }
              //   : undefined
              undefined
            }
            drawerHasUnsavedChanges
            onHandleCloseDrawerWithUnsavedChangesProtection={
              props.getActions().onHandleCloseDrawerWithUnsavedChangesProtection
            }
            onResetForm={onResetForm}
            closeOverlazyDrawer={() => {
              closeOverlazy({ type: 'Drawer' })
              props.getActions().onCreateSeatDrawerClosed()
            }}
            onSaveClicked={onSubmit}
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
                      formControl={{
                        label: t(`Seat title`),
                        required: true,
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
                        parentFormValues: ICreateOrgChartSeatValues
                        arrayFieldName: typeof fieldNames.roles
                      }>
                        name={fieldNames.roles}
                        validation={{
                          name: formValidators.string({}),
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
                      name={fieldNames.supervisorSeatId}
                      options={props.getData().getSupervisorOptions()}
                      unknownItemText={t('Unknown seat')}
                      placeholder={t('Type or choose assigned supervisor')}
                      formControl={{
                        label: t('Supervisor of seat'),
                      }}
                      width={'100%'}
                      onChange={(newValue) => {
                        onFieldChange(fieldNames.supervisorSeatId, newValue)
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
    </CreateForm>
  )
})
