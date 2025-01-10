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

export type TManageMembersAndPermissionsCardFormProps = {
  id: Id
  permissions: string
  firstName: string
  lastName: string
  fullName: string
  avatar: Maybe<string>
  userAvatarColor: UserAvatarColorType
}

export function ManageMembersAndPermissionsCard(props: {
  isCollapsible: boolean
  values: Array<TManageMembersAndPermissionsCardFormProps>
  generateFieldName: GenerateArrayFieldName<
    ICreateMeetingProps['meetingMembers'][number]
  >
  fieldArrayPropNames: {
    [TKey in keyof Omit<TManageMembersAndPermissionsCardFormProps, 'id'>]: TKey
  }
  onFieldChange: OnFieldChange<ICreateMeetingProps['meetingMembers'][number]>
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
                const meetingMemberToTarget =
                  props.parentFormValues.meetingMembers.find(
                    (member) => member.id === value.id
                  )

                if (!meetingMemberToTarget) {
                  return
                }

                const updatedMeetingMember = {
                  ...meetingMemberToTarget,
                  permissions: changedValue.toString(),
                }
                const updatedMeetingMembersWithPermissions = [
                  ...props.parentFormValues.meetingMembers.filter(
                    (member) => member.id !== updatedMeetingMember.id
                  ),
                ]
                props.onParentFieldChange(
                  'meetingMembers',
                  updatedMeetingMembersWithPermissions
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
