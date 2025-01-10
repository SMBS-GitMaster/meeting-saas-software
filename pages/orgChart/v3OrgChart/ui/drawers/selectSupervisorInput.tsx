import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import {
  Options,
  SelectInputSingleSelection,
  SelectInputSingleSelectionProps,
  Text,
  UserAvatar,
} from '@mm/core-web/ui'

import { OpenAvatarAndBadge } from '../openAvatarAndBadge'

export type SupervisorInputMetadata = {
  firstUserInSeat: Maybe<{
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }>
  positionTitle: Maybe<string>
  numberOfAdditionalUsersInSeat: number
}

type SupervisorInputProps = Omit<
  SelectInputSingleSelectionProps<
    Id,
    SupervisorInputMetadata,
    Options<Id, SupervisorInputMetadata>
  >,
  | 'renderListOption'
  | 'renderSelectedOption'
  | 'shouldOptionBeIncludedInFilteredOptions'
>

export function SupervisorInput(props: SupervisorInputProps) {
  return (
    <SelectInputSingleSelection<
      Id,
      SupervisorInputMetadata,
      Options<Id, SupervisorInputMetadata>
    >
      {...props}
      renderListOption={renderSeatSelectionListOption}
      renderSelectedOption={renderSeatSelectionListOption}
      shouldOptionBeIncludedInFilteredOptions={
        shouldOptionBeIncludedInFilteredOptions
      }
    />
  )
}

export function renderSeatSelectionListOption(option: {
  metadata: SupervisorInputMetadata
}) {
  return (
    <span
      css={css`
        display: inline-flex;
        align-items: center;
      `}
    >
      {option.metadata.firstUserInSeat && (
        <>
          <UserAvatar
            firstName={option.metadata.firstUserInSeat.firstName}
            lastName={option.metadata.firstUserInSeat.lastName}
            avatarUrl={option.metadata.firstUserInSeat.avatar}
            userAvatarColor={option.metadata.firstUserInSeat.userAvatarColor}
            size={'s'}
            adornments={{ tooltip: true }}
          />
          {option.metadata.numberOfAdditionalUsersInSeat > 0 ? (
            <Text
              css={css`
                padding-left: ${(props) => props.theme.sizes.spacing8};
              `}
              type='body'
            >
              +{option.metadata.numberOfAdditionalUsersInSeat}
            </Text>
          ) : (
            <Text
              css={css`
                padding-left: ${(props) => props.theme.sizes.spacing8};
              `}
              type='body'
            >
              {option.metadata.firstUserInSeat.fullName}
            </Text>
          )}
        </>
      )}

      {option.metadata.firstUserInSeat === null && <OpenAvatarAndBadge />}

      <Text
        css={css`
          padding-left: ${(props) => props.theme.sizes.spacing8};
        `}
        type='body'
        fontStyle='italic'
        ellipsis={{
          widthPercentage: 80,
          removeOnHoverFocus: false,
        }}
      >
        {option.metadata.positionTitle}
      </Text>
    </span>
  )
}

function shouldOptionBeIncludedInFilteredOptions(opts: {
  search: string
  option: { metadata: SupervisorInputMetadata }
}) {
  if (
    opts.option.metadata.firstUserInSeat?.fullName
      .toLowerCase()
      .includes(opts.search.toLowerCase()) ||
    (opts.option.metadata.positionTitle &&
      opts.option.metadata.positionTitle
        .toLowerCase()
        .includes(opts.search.toLowerCase()))
  ) {
    return true
  }
  return false
}
