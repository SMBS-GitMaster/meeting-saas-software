import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  CreateForm,
  FormFieldArray,
  GetParentFormValidation,
  formFieldArrayValidators,
  formValidators,
  required,
} from '@mm/core/forms'

import {
  TMeetingAgendaType,
  TMeetingType,
  UserAvatarColorType,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  BtnText, // CheckBoxInput,
  Loading,
  SelectInputSingleSelection,
  SelectUserInputMultipleSelection,
  Text,
  TextInput,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { Card } from '@mm/core-web/ui/components/card'

import { BloomHeader } from '../../layout/header/bloomHeader'
import { ManageAttendeesAndPermissionsCard } from '../meetingSharedForms/manageAttendeesAndPermissions'
import { ManageMembersAndPermissionsCard } from '../meetingSharedForms/manageMembersAndPermissions'
import { getAgendaTypeOpts, getMeetingTypeOpts } from './createMeetingConstants'
import {
  ICreateMeetingProps,
  ICreateMeetingViewProps,
} from './createMeetingTypes'

export type TMemberOrAttendee = Array<{
  id: Id
  permissions: string
  firstName: string
  lastName: string
  fullName: string
  avatar: Maybe<string>
  userAvatarColor: UserAvatarColorType
}>

export const CreateMeetingView = observer(function CreateMeetingView(
  props: ICreateMeetingViewProps
) {
  const { t } = useTranslation()
  const { sizes } = useTheme()

  const [isAttendeesCardExpanded, setIsAttendeesCardExpanded] =
    React.useState(true)
  const expandOrCollapseAttendeesCard = () =>
    setIsAttendeesCardExpanded(!isAttendeesCardExpanded)

  const [isMembersCardExpanded, setIsMembersCardExpanded] =
    React.useState(false)

  const expandOrCollapseMembersCard = () =>
    setIsMembersCardExpanded(!isMembersCardExpanded)

  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={t('New meeting')}
        defaultPropsForDrawers={{ meetingId: null }}
      ></BloomHeader>
      <div
        css={css`
          justify-content: center;
          display: flex;
          align-items: center;
          width: 100%;
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: ${sizes.spacing24};
          `}
        >
          <CreateForm
            isLoading={false}
            values={{
              meetingName: '',
              meetingType: '' as TMeetingType,
              showBusinessPlan: true,
              agendaType: '' as TMeetingAgendaType,
              meetingAttendees: [
                {
                  id: props.data.currentUser().value,
                  permissions: 'ADMIN',
                  ...props.data.currentUser().metadata,
                },
              ] as TMemberOrAttendee,
              meetingAttendeesIds: [] as Array<Id>,
              meetingMembersIds: [] as Array<Id>,
              meetingMembers: [] as TMemberOrAttendee,
            }}
            onSubmit={props.getActionHandlers().onCreateMeeting}
            validation={
              {
                meetingName: formValidators.string({
                  additionalRules: [required()],
                }),
                meetingType: formValidators.string({
                  additionalRules: [required()],
                }),
                agendaType: formValidators.string({
                  additionalRules: [required()],
                }),
                showBusinessPlan: formValidators.boolean({
                  additionalRules: [],
                }),
                meetingAttendees: formValidators.array({
                  additionalRules: [],
                }),
                meetingMembers: formValidators.array({
                  additionalRules: [],
                }),
                meetingAttendeesIds: formValidators.array({
                  additionalRules: [],
                }),
                meetingMembersIds: formValidators.array({
                  additionalRules: [],
                }),
              } satisfies GetParentFormValidation<ICreateMeetingProps>
            }
          >
            {({
              onSubmit,
              values: parentFormValues,
              onFieldChange: onParentFieldChange,
              fieldNames,
              hasError,
            }) => {
              const meetingAttendeeIds =
                parentFormValues?.meetingAttendees.map(
                  (attendee) => attendee.id
                ) || []

              const meetingMemberOptions =
                meetingAttendeeIds &&
                props.data
                  .userOpts()
                  .filter(
                    (usersSelectedAsAttendees) =>
                      !meetingAttendeeIds.includes(
                        usersSelectedAsAttendees.value
                      ) &&
                      usersSelectedAsAttendees.value !==
                        props.data.currentUser().value
                  )
                  .map((availableUsers) => ({
                    value: availableUsers.value,
                    metadata: availableUsers.metadata,
                  }))

              const availableUsers = props.data
                .userOpts()
                .filter(
                  (user) =>
                    !parentFormValues?.meetingMembersIds.some(
                      (member) => member === user.value
                    )
                )

              if (!parentFormValues) {
                return <Loading />
              } else {
                return (
                  <div
                    css={css`
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    `}
                  >
                    <Card
                      css={css`
                        margin-bottom: ${sizes.spacing16};
                        min-width: ${toREM(848)};
                      `}
                    >
                      <Card.Header
                        css={css`
                          padding-left: ${sizes.spacing8};
                        `}
                        renderLeft={
                          <div
                            css={`
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Card.Title>{t('General')}</Card.Title>
                          </div>
                        }
                      ></Card.Header>
                      <Card.Body
                        css={css`
                          padding: 0 ${sizes.spacing24} ${sizes.spacing24}
                            ${sizes.spacing24};
                        `}
                      >
                        <div
                          css={css`
                            display: flex;
                          `}
                        >
                          <TextInput
                            id={'meetingName'}
                            name={fieldNames.meetingName}
                            formControl={{
                              label: t('Meeting name'),
                            }}
                            placeholder={t('Type a meeting name')}
                            css={css`
                              padding-right: ${sizes.spacing24};
                            `}
                          />
                        </div>
                        <div
                          css={css`
                            display: flex;
                            padding-top: ${sizes.spacing24};
                            justify-content: space-between;
                          `}
                        >
                          <div
                            css={css`
                              display: flex;
                              flex-direction: column;
                              padding-right: ${sizes.spacing24};
                            `}
                          >
                            <SelectInputSingleSelection
                              id={'meetingType'}
                              name={fieldNames.meetingType}
                              options={getMeetingTypeOpts()}
                              unknownItemText={t('Unknown meeting type')}
                              placeholder={t(
                                'Start typing or select from dropdown'
                              )}
                              formControl={{
                                label: t('Meeting type'),
                              }}
                              width={'380px'}
                            />
                            {/*
                            <div
                              css={css`
                                display: flex;
                                align-items: center;
                              `}
                            >
                              <CheckBoxInput
                                id={'showBusinessPlan'}
                                name={fieldNames.showBusinessPlan}
                              />
                              <Text
                                type='body'
                                weight='semibold'
                                css={css`
                                  display: block;
                                  padding-left: ${sizes.spacing8};
                                `}
                              >
                                {t('Business Plan')}
                              </Text>
                            </div>
                            <Text
                              type='small'
                              color={{ color: colors.inputTextFieldTextColor }}
                              css={css`
                                display: block;
                                padding-left: ${toREM(33)};
                              `}
                            >
                              {t(
                                'Choose to show the business plan for this meeting.'
                              )}
                            </Text>*/}
                          </div>
                          <div
                            css={css`
                              align-items: flex-end;
                            `}
                          >
                            <SelectInputSingleSelection
                              id={'agendaType'}
                              name={fieldNames.agendaType}
                              options={getAgendaTypeOpts()}
                              unknownItemText={t('Unknown agenda type')}
                              placeholder={t(
                                'Start typing or select from dropdown'
                              )}
                              formControl={{
                                label: t('Agenda type'),
                              }}
                              width={'380px'}
                            />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                    <Card
                      css={css`
                        min-width: ${toREM(848)};
                        margin-bottom: ${sizes.spacing16};
                      `}
                    >
                      <Card.Header
                        css={css`
                          padding-left: ${sizes.spacing8};
                        `}
                        renderLeft={
                          <div
                            css={`
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Card.Title>{t('Attendees')}</Card.Title>
                          </div>
                        }
                        renderRight={
                          <BtnIcon
                            iconProps={{
                              iconName: isAttendeesCardExpanded
                                ? 'chevronDownIcon'
                                : 'chevronRightIcon',
                              iconSize: 'lg',
                            }}
                            size='lg'
                            intent='tertiaryTransparent'
                            ariaLabel={t('Expand or collapse attendees card')}
                            tag='button'
                            onClick={expandOrCollapseAttendeesCard}
                          />
                        }
                      ></Card.Header>

                      {isAttendeesCardExpanded && (
                        <Card.Body
                          css={css`
                            padding-left: ${sizes.spacing24};
                            padding-right: ${sizes.spacing24};
                            margin-bottom: ${sizes.spacing16};
                            max-width: 848px;
                          `}
                        >
                          <SelectUserInputMultipleSelection
                            id={'meetingAttendeesIds'}
                            name={fieldNames.meetingAttendeesIds}
                            options={availableUsers}
                            unknownItemText={t('Unknown user')}
                            width='100%'
                            placeholder={t(
                              'Start typing or select from dropdown'
                            )}
                            formControl={{
                              label: t('Add meeting attendee'),
                            }}
                            css={css`
                              padding-bottom: ${sizes.spacing16};
                            `}
                            displayClearAll={false}
                            onChange={(value) => {
                              const selectedUsers = availableUsers.filter(
                                (user) => value.includes(user.value)
                              )

                              const newAttendees = selectedUsers.map((user) => {
                                return {
                                  id: user.value,
                                  permissions:
                                    parentFormValues.meetingAttendees.find(
                                      (attendee) => attendee.id === user.value
                                    )?.permissions || 'EDIT',
                                  firstName: user?.metadata.firstName ?? '',
                                  lastName: user?.metadata.lastName ?? '',
                                  fullName: user?.metadata.fullName ?? '',
                                  avatar: user?.metadata.avatar ?? '',
                                  userAvatarColor:
                                    user?.metadata.userAvatarColor ?? 'COLOR1',
                                }
                              })

                              const updatedMeetingAttendees =
                                parentFormValues.meetingAttendees
                                  ? parentFormValues.meetingAttendees.filter(
                                      (existingAttendee) =>
                                        value.includes(existingAttendee.id)
                                    )
                                  : []

                              const newUniqueAttendees = newAttendees.filter(
                                (newAttendee) =>
                                  !updatedMeetingAttendees.some(
                                    (existingAttendee) =>
                                      existingAttendee.id === newAttendee.id
                                  )
                              )

                              const currentUser = {
                                id: props.data.currentUser().value,
                                permissions: 'ADMIN',
                                ...props.data.currentUser().metadata,
                              }

                              const finalUpdatedMeetingAttendees = [
                                currentUser,
                                ...updatedMeetingAttendees,
                                ...newUniqueAttendees,
                              ]

                              onParentFieldChange(
                                fieldNames.meetingAttendeesIds,
                                value
                              )
                              onParentFieldChange(
                                fieldNames.meetingAttendees,
                                finalUpdatedMeetingAttendees
                              )
                            }}
                          />
                          <FormFieldArray<{
                            parentFormValues: ICreateMeetingProps
                            arrayFieldName: typeof fieldNames.meetingAttendees
                          }>
                            name={fieldNames.meetingAttendees}
                            validation={{
                              permissions: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              firstName: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              lastName: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              fullName: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              avatar: formFieldArrayValidators.string({
                                optional: true,
                              }),
                              userAvatarColor: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                            }}
                          >
                            {({
                              values,
                              generateFieldName,
                              onFieldChange,
                              fieldArrayPropNames,
                            }) => {
                              return (
                                <ManageAttendeesAndPermissionsCard
                                  isCollapsible={true}
                                  values={values}
                                  parentFormValues={parentFormValues}
                                  generateFieldName={generateFieldName}
                                  onFieldChange={onFieldChange}
                                  onParentFieldChange={onParentFieldChange}
                                  fieldArrayPropNames={fieldArrayPropNames}
                                />
                              )
                            }}
                          </FormFieldArray>
                        </Card.Body>
                      )}
                    </Card>
                    <Card
                      css={css`
                        min-width: ${toREM(848)};
                        margin-bottom: ${sizes.spacing16};
                      `}
                    >
                      <Card.Header
                        css={css`
                          padding-left: ${sizes.spacing8};
                        `}
                        renderLeft={
                          <div
                            css={`
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Card.Title>{t('Non-attendees')}</Card.Title>
                          </div>
                        }
                        renderRight={
                          <BtnIcon
                            iconProps={{
                              iconName: isMembersCardExpanded
                                ? 'chevronDownIcon'
                                : 'chevronRightIcon',
                              iconSize: 'lg',
                            }}
                            size='lg'
                            intent='tertiaryTransparent'
                            ariaLabel={t('Expand or collapse members card')}
                            tag='button'
                            onClick={expandOrCollapseMembersCard}
                          />
                        }
                      ></Card.Header>
                      {isMembersCardExpanded && (
                        <Card.Body
                          css={css`
                            max-width: ${toREM(848)};
                            padding-right: ${sizes.spacing24};
                            padding-left: ${sizes.spacing24};
                            margin-bottom: ${sizes.spacing16};
                          `}
                        >
                          <Text
                            type='body'
                            css={css`
                              margin-bottom: ${sizes.spacing16};
                            `}
                          >
                            {t(
                              `Non-attendees are other users in the system who have access to this meeting. They aren't official attendees and won't be displayed on the attendee list during check-in, but can view and interact with the meeting and contents.`
                            )}
                          </Text>
                          <Text
                            type='body'
                            css={css`
                              padding-bottom: ${sizes.spacing8};
                            `}
                          >
                            {t(
                              `In addition to those listed below, all system administrators can also view this meeting.`
                            )}
                          </Text>
                          <SelectUserInputMultipleSelection
                            css={css`
                              padding-bottom: ${sizes.spacing16};
                            `}
                            id={'meetingMembersIds'}
                            unknownItemText={t('Unknown user')}
                            name={fieldNames.meetingMembersIds}
                            options={meetingMemberOptions}
                            width='100%'
                            displayClearAll={false}
                            placeholder={t(
                              'Start typing or select from dropdown'
                            )}
                            formControl={{
                              label: t('Add non-attendee'),
                            }}
                            onChange={(value) => {
                              const selectedUsers = meetingMemberOptions.filter(
                                (user) => value.includes(user.value)
                              )
                              const newMembers = selectedUsers.map((user) => ({
                                id: user.value,
                                permissions:
                                  parentFormValues.meetingMembers.find(
                                    (member) => member.id === user.value
                                  )?.permissions || 'EDIT',
                                firstName: user?.metadata.firstName ?? '',
                                lastName: user?.metadata.lastName ?? '',
                                fullName: user?.metadata.fullName ?? '',
                                avatar: user?.metadata.avatar ?? '',
                                userAvatarColor:
                                  user?.metadata.userAvatarColor ?? 'COLOR1',
                              }))

                              const updatedMeetingMembers =
                                parentFormValues.meetingMembers
                                  ? parentFormValues.meetingMembers.filter(
                                      (existingMember) =>
                                        value.includes(existingMember.id)
                                    )
                                  : []

                              const newUniqueMembers = newMembers.filter(
                                (newMember) =>
                                  !updatedMeetingMembers.some(
                                    (existingMember) =>
                                      existingMember.id === newMember.id
                                  )
                              )

                              const finalUpdatedMeetingMembers = [
                                ...updatedMeetingMembers,
                                ...newUniqueMembers,
                              ]

                              onParentFieldChange(
                                fieldNames.meetingMembersIds,
                                value
                              )
                              onParentFieldChange(
                                fieldNames.meetingMembers,
                                finalUpdatedMeetingMembers
                              )
                            }}
                          />
                          <FormFieldArray<{
                            parentFormValues: ICreateMeetingProps
                            arrayFieldName: typeof fieldNames.meetingMembers
                          }>
                            name={fieldNames.meetingMembers}
                            validation={{
                              permissions: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              firstName: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              lastName: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              fullName: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              avatar: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                              userAvatarColor: formFieldArrayValidators.string({
                                additionalRules: [],
                              }),
                            }}
                          >
                            {({
                              values,
                              onFieldChange,
                              generateFieldName,
                              fieldArrayPropNames,
                            }) => {
                              return (
                                <ManageMembersAndPermissionsCard
                                  isCollapsible={true}
                                  values={values}
                                  generateFieldName={generateFieldName}
                                  fieldArrayPropNames={fieldArrayPropNames}
                                  onFieldChange={onFieldChange}
                                  parentFormValues={parentFormValues}
                                  onParentFieldChange={onParentFieldChange}
                                />
                              )
                            }}
                          </FormFieldArray>
                        </Card.Body>
                      )}
                    </Card>
                    <BtnText
                      css={css`
                        margin-left: auto;
                      `}
                      onClick={onSubmit}
                      intent='primary'
                      width='fitted'
                      ariaLabel={t('Launch meeting')}
                      type='button'
                      disabled={hasError}
                    >
                      <Text type='body' weight='semibold'>
                        {t('Launch meeting')}
                      </Text>
                    </BtnText>
                  </div>
                )
              }
            }}
          </CreateForm>
        </div>
      </div>
    </>
  )
})
