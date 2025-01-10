import React from 'react'
import { css, useTheme } from 'styled-components'

import { Id } from '@mm/gql'

import { GenerateArrayFieldName, OnFieldChange } from '@mm/core/forms'

import { UserAvatarColorType } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  SelectInputSingleSelection,
  Text,
  UserAvatar,
  toREM,
} from '@mm/core-web/ui'

import { userMeetingPermissionLevelOptions } from '../createMeeting/createMeetingConstants'
import { ICreateMeetingProps } from '../createMeeting/createMeetingTypes'

export type TManageAttendeesAndPermissionsCardFormProps = {
  id: Id
  permissions: string
  firstName: string
  lastName: string
  fullName: string
  avatar: Maybe<string>
  userAvatarColor: UserAvatarColorType
}

export function ManageAttendeesAndPermissionsCard(props: {
  isCollapsible: boolean
  values: Array<TManageAttendeesAndPermissionsCardFormProps>
  generateFieldName: GenerateArrayFieldName<
    ICreateMeetingProps['meetingAttendees'][number]
  >
  fieldArrayPropNames: {
    [TKey in keyof Omit<
      TManageAttendeesAndPermissionsCardFormProps,
      'id'
    >]: TKey
  }
  onFieldChange: OnFieldChange<ICreateMeetingProps['meetingAttendees'][number]>
  onParentFieldChange: OnFieldChange<ICreateMeetingProps>
  parentFormValues: ICreateMeetingProps
}) {
  const { sizes } = useTheme()
  const { t } = useTranslation()

  return (
    <>
      {props.values.map((value) => {
        return (
          <div
            key={value.id}
            css={css`
              display: flex;
              flex-direction: row;
              align-items: center;
              width: 100%;
            `}
          >
            <UserAvatar
              css={css`
                margin-right: ${sizes.spacing8};
              `}
              firstName={value.firstName}
              lastName={value.lastName}
              avatarUrl={value.avatar}
              userAvatarColor={value.userAvatarColor}
              size={'s'}
              tooltipPosition={'top center'}
            />
            <Text type='body' weight='semibold'>
              {value.fullName}
            </Text>
            <SelectInputSingleSelection
              css={css`
                margin-left: auto;
                flex-grow: 0;
              `}
              isPermissionsVariant={true}
              id={'permissions'}
              wrapOverflow={true}
              caretIconSize={'md2'}
              dropdownMenuWidth={toREM(200)}
              placement='bottom-end'
              height={'auto'}
              name={props.generateFieldName({
                id: value.id,
                propName: props.fieldArrayPropNames.permissions,
              })}
              unknownItemText={t('Unknown type')}
              options={userMeetingPermissionLevelOptions}
              onChange={(changedValue) => {
                const meetingAttendeeToTarget =
                  props.parentFormValues.meetingAttendees.find(
                    (attendee) => attendee.id === value.id
                  )
                if (!meetingAttendeeToTarget) {
                  return
                }

                const updatedMeetingAttendee = {
                  ...meetingAttendeeToTarget,
                  permissions: changedValue.toString(),
                }
                const updatedMeetingAttendeesWithPermissions = [
                  ...props.parentFormValues.meetingAttendees.filter(
                    (attendee) => attendee.id !== updatedMeetingAttendee.id
                  ),
                  updatedMeetingAttendee,
                ]

                props.onParentFieldChange(
                  'meetingAttendees',
                  updatedMeetingAttendeesWithPermissions
                )

                props.onFieldChange(
                  props.generateFieldName({
                    id: value.id,
                    propName: props.fieldArrayPropNames.permissions,
                  }),
                  changedValue
                )
              }}
            />
          </div>
        )
      })}
    </>
  )
}
