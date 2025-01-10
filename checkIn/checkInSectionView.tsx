import { observer } from 'mobx-react'
import React, { useCallback, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import {
  EditForm,
  FormFieldArray,
  FormValuesForSubmit,
  GetParentFormValidation,
  formFieldArrayValidators,
  formValidators,
  required,
} from '@mm/core/forms'
import { generateRandomNumber } from '@mm/core/mockDataGeneration/generateMockDataUtils'

import { EMeetingPageType, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Card,
  CheckBoxInput,
  SelectInputSingleSelection,
  Text,
  TextEllipsis,
  UserAvatar,
  toREM,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import { BloomPageEmptyState, getEmptyStateData } from '../shared'
import {
  NO_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE,
  SHOW_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE,
  getCheckInTypeToTextMap,
  getCheckinStyleOpts,
} from './checkInSectionConstants'
import {
  ICheckInSectionFormValues,
  ICheckInSectionViewProps,
  TCheckInResponsiveSizes,
} from './checkInSectionTypes'

export const CheckInSectionView = observer(function CheckInSectionView(
  props: ICheckInSectionViewProps
) {
  const { t } = useTranslation()
  const terms = useBloomCustomTerms()
  const { colors } = useTheme()
  const [checkinCardEl, setCheckinCardEl] =
    useState<Maybe<HTMLDivElement>>(null)
  const [showNamesForAttendeeAttendance, setShowNamesForAttendeeAttendance] =
    useState(false)

  const EMPTYSTATE_DATA = getEmptyStateData(terms)

  const { width, ready } = useResizeObserver(checkinCardEl)

  const {
    meetingPageId,
    isLoading,
    currentUser: {
      permissions: { canEditCheckInInMeeting },
    },
    attendees,
    checkIn: {
      iceBreakers,
      currentIceBreakerQuestion,
      isAttendanceVisible,
      checkInType,
      classicCheckinTitle,
      tipOfTheWeek,
    },
  } = props.data
  const { onUpdateCheckIn, onUpdateIceBreakerQuestion } = props.actionHandlers

  const onlyOneAttendeePresent = attendees.length === 1
  const showIceBreakerQuestionButton = canEditCheckInInMeeting.allowed

  const { RESPONSIVE_SIZE, RESPONSIVE_PADDING_VALUE } = useMemo(() => {
    const getResponsiveSize = (): TCheckInResponsiveSizes => {
      if (!ready) return 'UNKNOWN'
      if (width <= 368) return 'XSMALL'
      if (width <= 531) return 'SMALL'
      if (width <= 800) return 'MEDIUM'
      return 'LARGE'
    }

    const getResponsivePaddingValue = () => {
      if (!ready) return 0
      if (width < 800) return 0
      return 80
    }

    return {
      RESPONSIVE_SIZE: getResponsiveSize(),
      RESPONSIVE_PADDING_VALUE: getResponsivePaddingValue(),
    }
  }, [width, ready])

  const gridColumnCount = useMemo(() => {
    if (showNamesForAttendeeAttendance) {
      if (
        attendees.length <
        SHOW_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE[RESPONSIVE_SIZE]
      ) {
        return attendees.length
      } else {
        return SHOW_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE[RESPONSIVE_SIZE]
      }
    } else {
      if (
        attendees.length <
        NO_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE[RESPONSIVE_SIZE]
      ) {
        return attendees.length
      } else {
        return NO_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE[RESPONSIVE_SIZE]
      }
    }
  }, [showNamesForAttendeeAttendance, RESPONSIVE_SIZE, attendees])

  const renderReducedWidthStyles = RESPONSIVE_SIZE !== 'LARGE'
  const renderShowNamesToggleOnNewLine =
    RESPONSIVE_SIZE === 'SMALL' || RESPONSIVE_SIZE === 'XSMALL'

  const stringifiedAttendees = JSON.stringify(attendees)
  const memoizedCheckInFormValues = useMemo(() => {
    return {
      checkInType,
      isAttendanceVisible,
      attendees: (attendees || []).map((attendee) => {
        return {
          id: attendee.id,
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          avatar: attendee.avatar,
          userAvatarColor: attendee.userAvatarColor,
          isPresent: attendee.isPresent,
        }
      }),
    }
    // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2088
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInType, isAttendanceVisible, attendees, stringifiedAttendees])

  const handleNextIceBreakerQuestion = useCallback(() => {
    const newIndex = generateRandomNumber(0, iceBreakers.length - 1)

    return onUpdateIceBreakerQuestion({
      meetingPageId: meetingPageId,
      iceBreakerQuestion: iceBreakers[newIndex],
    })
  }, [onUpdateIceBreakerQuestion, meetingPageId, iceBreakers])

  const handleUpdateCheckIn = useCallback(
    (
      values: Partial<
        FormValuesForSubmit<ICheckInSectionFormValues, true, 'attendees'>
      >
    ) => {
      return onUpdateCheckIn({
        meetingPageId: meetingPageId,
        values,
      })
    },
    [meetingPageId, onUpdateCheckIn]
  )

  const handleUpdateShowNamesForAttendeeAttendanceToggle = useCallback(
    (value: boolean) => {
      setShowNamesForAttendeeAttendance(value)
    },
    []
  )

  return (
    <>
      <EditForm
        isLoading={isLoading}
        values={memoizedCheckInFormValues}
        validation={
          {
            checkInType: formValidators.string({
              additionalRules: [],
            }),
            isAttendanceVisible: formValidators.boolean({
              additionalRules: [required()],
            }),
            attendees: formValidators.arrayOfNodes({
              additionalRules: [required()],
            }),
          } satisfies GetParentFormValidation<ICheckInSectionFormValues>
        }
        onSubmit={handleUpdateCheckIn}
      >
        {({ values, fieldNames }) => (
          <Card
            ref={setCheckinCardEl}
            css={css`
              height: fit-content;
            `}
          >
            <Card.Header
              renderLeft={
                <Card.Title
                  css={css`
                    flex-shrink: 1;
                  `}
                >
                  {props.data.meetingPageName}
                </Card.Title>
              }
              renderRight={
                <div
                  css={css`
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                    flex-shrink: 3;
                    gap: ${RESPONSIVE_SIZE === 'LARGE' ||
                    RESPONSIVE_SIZE === 'MEDIUM'
                      ? css`
                          ${({ theme }) => theme.sizes.spacing24}
                        `
                      : RESPONSIVE_SIZE === 'SMALL'
                        ? css`
                            ${({ theme }) => theme.sizes.spacing20}
                          `
                        : css`
                            ${({ theme }) => theme.sizes.spacing8}
                          `};
                  `}
                >
                  <CheckBoxInput
                    id='isAttendanceVisible'
                    name={fieldNames.isAttendanceVisible}
                    disabled={!canEditCheckInInMeeting.allowed}
                    tooltip={
                      !canEditCheckInInMeeting.allowed
                        ? {
                            msg: canEditCheckInInMeeting.message,
                            position: 'top center',
                          }
                        : undefined
                    }
                    text={
                      <TextEllipsis
                        type='body'
                        weight={'semibold'}
                        lineLimit={1}
                        css={css`
                          word-break: break-all;
                          color: ${(props) =>
                            props.theme.colors.meetingSectionSortByTextColor};
                        `}
                      >
                        {t('Add attendance')}
                      </TextEllipsis>
                    }
                    inputType='toggle'
                  />
                  <div
                    css={`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <Text
                      type='body'
                      weight='semibold'
                      css={css`
                        color: ${(props) =>
                          props.theme.colors.meetingSectionSortByTextColor};
                      `}
                    >
                      {t('Style')}
                      {t(':')}
                    </Text>
                    <div
                      css={css`
                        cursor: pointer;
                      `}
                    >
                      <SelectInputSingleSelection
                        id={'checkInType'}
                        name={fieldNames.checkInType}
                        unknownItemText={t('Unknown type')}
                        tooltip={
                          !canEditCheckInInMeeting.allowed
                            ? {
                                msg: canEditCheckInInMeeting.message,
                                position: 'top left',
                              }
                            : undefined
                        }
                        disabled={!canEditCheckInInMeeting.allowed}
                        options={getCheckinStyleOpts(terms)}
                        width={'auto'}
                        height={'auto'}
                        dropdownMenuWidth={toREM(200)}
                        placement='bottom-end'
                        css={css`
                          ${checkInStyleDropdownCss}

                          ${renderReducedWidthStyles &&
                          css`
                            .selectInput__selectedOption {
                              visibility: hidden;
                              width: 0;
                            }
                          `}
                        `}
                      />
                    </div>
                  </div>
                </div>
              }
            />
            <Card.Body>
              <Card.BodySafeArea>
                <CheckInBodySection
                  marginTop={0}
                  responsivePaddingValue={RESPONSIVE_PADDING_VALUE}
                >
                  <Text type='h3'>
                    {getCheckInTypeToTextMap(terms)[checkInType]}
                  </Text>
                  <CheckInTextContainer>
                    {checkInType === 'ICEBREAKER' && (
                      <>
                        <Text
                          css={css`
                            padding: 0 ${(props) => props.theme.sizes.spacing12};

                            ${!showIceBreakerQuestionButton &&
                            css`
                              padding-bottom: ${(props) =>
                                props.theme.sizes.spacing20};
                            `}
                          `}
                        >{`"${
                          currentIceBreakerQuestion
                            ? currentIceBreakerQuestion
                            : iceBreakers[0]
                        }"`}</Text>
                        {showIceBreakerQuestionButton && (
                          <div
                            css={css`
                              width: 100%;
                              display: flex;
                              justify-content: flex-end;
                              align-content: flex-end;
                            `}
                          >
                            <BtnText
                              intent='tertiaryTransparent'
                              ariaLabel={t('new question')}
                              width={'noPadding'}
                              onClick={handleNextIceBreakerQuestion}
                            >
                              {t('New question')}
                            </BtnText>
                          </div>
                        )}
                      </>
                    )}
                    {checkInType === 'TRADITIONAL' && (
                      <Text
                        color={{ color: colors.checkInSectionQuestionColor }}
                        css={css`
                          padding: 0 ${(props) => props.theme.sizes.spacing12}
                            ${(props) => props.theme.sizes.spacing20}
                            ${(props) => props.theme.sizes.spacing12};
                        `}
                      >{`"${classicCheckinTitle}"`}</Text>
                    )}
                  </CheckInTextContainer>
                </CheckInBodySection>
                {values && values.isAttendanceVisible && (
                  <CheckInBodySection
                    marginTop={40}
                    responsivePaddingValue={RESPONSIVE_PADDING_VALUE}
                  >
                    <div
                      css={css`
                        display: grid;
                        grid-template-columns: repeat(
                          ${renderShowNamesToggleOnNewLine ? `1` : `3`},
                          1fr
                        );
                        grid-template-rows: ${renderShowNamesToggleOnNewLine
                          ? `1`
                          : `3`}fr;
                        padding-bottom: ${({ theme }) => theme.sizes.spacing32};
                      `}
                    >
                      <div
                        css={css`
                          ${renderShowNamesToggleOnNewLine &&
                          css`
                            display: none;
                          `}
                        `}
                      />

                      <Text type='h3'>{t('Who is present?')}</Text>

                      <CheckBoxInput
                        id='showNamesForAttendeeAttendance'
                        name={'showNamesForAttendeeAttendance'}
                        disableFormContext={true}
                        value={showNamesForAttendeeAttendance}
                        onChange={
                          handleUpdateShowNamesForAttendeeAttendanceToggle
                        }
                        text={
                          <Text type='body' weight={'normal'}>
                            {t('Show names')}
                          </Text>
                        }
                        inputType='toggle'
                        css={css`
                          justify-content: flex-end;
                        `}
                      />
                    </div>

                    <FormFieldArray<{
                      parentFormValues: ICheckInSectionFormValues
                      arrayFieldName: typeof fieldNames.attendees
                    }>
                      name={fieldNames.attendees}
                      validation={{
                        firstName: formFieldArrayValidators.string({}),
                        lastName: formFieldArrayValidators.string({}),
                        avatar: formFieldArrayValidators.string({
                          optional: true,
                        }),
                        userAvatarColor: formFieldArrayValidators.string({}),
                        isPresent: formFieldArrayValidators.boolean({
                          additionalRules: [required()],
                        }),
                      }}
                    >
                      {({ generateFieldName, values, fieldArrayPropNames }) => (
                        <>
                          <div
                            css={css`
                              display: grid;
                              grid-template-columns: repeat(
                                ${gridColumnCount},
                                1fr
                              );
                              grid-template-rows: ${gridColumnCount}fr;
                              grid-gap: ${({ theme }) => theme.sizes.spacing16}
                                ${({ theme }) => theme.sizes.spacing24};
                              max-width: ${showNamesForAttendeeAttendance
                                ? toREM(672)
                                : toREM(632)};
                              margin: auto;
                              padding: 0 ${({ theme }) => theme.sizes.spacing24};
                            `}
                          >
                            {values.map((attendee, index) => (
                              <div
                                key={attendee.id}
                                css={css`
                                  display: flex;
                                  flex-direction: ${showNamesForAttendeeAttendance
                                    ? `row`
                                    : `column`};
                                `}
                              >
                                <UserAvatar
                                  firstName={attendee.firstName}
                                  lastName={attendee.lastName}
                                  avatarUrl={attendee.avatar}
                                  userAvatarColor={attendee.userAvatarColor}
                                  size={
                                    showNamesForAttendeeAttendance ? 's' : 'l'
                                  }
                                  adornments={
                                    showNamesForAttendeeAttendance
                                      ? undefined
                                      : { tooltip: true }
                                  }
                                  tooltipPosition={'top center'}
                                  css={css`
                                    order: ${showNamesForAttendeeAttendance
                                      ? `2`
                                      : `1`};
                                  `}
                                />
                                <CheckBoxInput
                                  id={`attendee_${index}`}
                                  name={generateFieldName({
                                    id: attendee.id,
                                    propName: fieldArrayPropNames.isPresent,
                                  })}
                                  css={css`
                                    justify-content: center;
                                    vertical-align: middle;
                                    padding-top: ${showNamesForAttendeeAttendance
                                      ? `0`
                                      : (props) => props.theme.sizes.spacing4};
                                    order: ${showNamesForAttendeeAttendance
                                      ? `1`
                                      : `2`};

                                    ${showNamesForAttendeeAttendance &&
                                    css`
                                      padding-right: ${(props) =>
                                        props.theme.sizes.spacing8};
                                    `}
                                  `}
                                />

                                {showNamesForAttendeeAttendance && (
                                  <TextEllipsis
                                    type={'body'}
                                    lineLimit={1}
                                    tooltipProps={{
                                      position: 'bottom center',
                                    }}
                                    css={css`
                                      word-break: break-all;
                                      order: 3;
                                      padding-left: ${(props) =>
                                        props.theme.sizes.spacing8};
                                    `}
                                  >
                                    {attendee.firstName} {attendee.lastName}
                                  </TextEllipsis>
                                )}
                              </div>
                            ))}
                          </div>
                          {onlyOneAttendeePresent && (
                            <div
                              css={css`
                                width: 100%;
                                display: flex;
                                justify-content: center;
                                padding-top: ${(props) =>
                                  props.theme.sizes.spacing24};
                              `}
                            >
                              <BloomPageEmptyState
                                show={onlyOneAttendeePresent}
                                showBtn={true}
                                emptyState={
                                  EMPTYSTATE_DATA[EMeetingPageType.CheckIn] ??
                                  undefined
                                }
                                fillParentContainer={false}
                                css={css`
                                  padding-bottom: 0;
                                `}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </FormFieldArray>
                  </CheckInBodySection>
                )}
                <CheckInBodySection
                  marginTop={isAttendanceVisible ? 40 : 32}
                  responsivePaddingValue={RESPONSIVE_PADDING_VALUE}
                >
                  <Text type='h3'>{t('Bloom Tip of the Week')}</Text>
                  <span
                    css={css`
                      margin-top: ${toREM(16)};
                      margin-bottom: ${toREM(32)};
                    `}
                  >
                    <Text color={{ color: colors.checkInSectionQuestionColor }}>
                      {tipOfTheWeek}
                    </Text>
                  </span>
                </CheckInBodySection>
              </Card.BodySafeArea>
            </Card.Body>
          </Card>
        )}
      </EditForm>
    </>
  )
})

const CheckInBodySection = styled.div<{
  marginTop: number
  responsivePaddingValue: number
}>`
  display: flex;
  flex-direction: column;
  margin-top: ${({ marginTop }) => `${toREM(marginTop)}`};
  padding: 0
    ${({ responsivePaddingValue }) => `${toREM(responsivePaddingValue)}`};
  text-align: center;
`

const CheckInTextContainer = styled.div`
  background-color: ${(props) =>
    props.theme.colors.checkInSectionQuestionBackgroundColor};
  margin-top: ${toREM(16)};
  padding: ${(props) => props.theme.sizes.spacing28}
    ${(props) => props.theme.sizes.spacing16}
    ${(props) => props.theme.sizes.spacing8}
    ${(props) => props.theme.sizes.spacing16};
  width: 100%;
  align-self: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex-shrink: 1;
`

const checkInStyleDropdownCss = css`
  line-height: 0;
  margin-left: ${({ theme }) => theme.sizes.spacing6};

  .singleInput__selectionWrapper {
    border: none;
  }

  .selectInput__selectedOption {
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0;
    display: flex;
  }

  .selectInput__selectedItemText {
    padding-right: ${({ theme }) => theme.sizes.spacing20};
  }

  [class^='StyledBodyText'] {
    text-overflow: initial;
    overflow: initial;
    max-width: initial;
  }

  [class^='StyledIconWrapper'] {
    right: 0;
  }

  [class^='StyledLi'] {
    padding-right: ${({ theme }) => theme.sizes.spacing16};
  }
`
