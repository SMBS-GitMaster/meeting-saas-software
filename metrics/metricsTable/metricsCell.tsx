import { observer } from 'mobx-react'
import React, { useCallback, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import {
  FormContext,
  FormFieldArrayContext,
  RecordOfFieldTypeToFormValue,
  getFieldStateFromPropsOrContext,
  verifyFormContextMatchesField,
} from '@mm/core/forms'

import {
  METRIC_RULE_TO_SIGN_MAP,
  MetricCellStateType,
  MetricGoalInfoType,
  MetricRules,
  MetricUnits,
} from '@mm/core-bloom/metrics'
import {
  getMetricCellState,
  getMetricNumberFormatted,
  getMetricRoundedNumber,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
} from '@mm/core-bloom/metrics/computed'

import { useTranslation } from '@mm/core-web/i18n'
import {
  ITooltipProps,
  Tooltip,
  getTextStyles,
  useTheme,
} from '@mm/core-web/ui'
import { Clickable } from '@mm/core-web/ui/components/clickable'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'
import { toREM } from '@mm/core-web/ui/responsive/sizeConversion'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

const type = 'MetricCellInput'
type FieldValue = RecordOfFieldTypeToFormValue[typeof type]

export interface IMetricsCellProps {
  customGoal: Maybe<{ goal: MetricGoalInfoType; metricRule: MetricRules }>
  goal: MetricGoalInfoType
  scoreNodeId: Maybe<Id>
  metricRule: MetricRules
  hasNote: boolean
  hasFormula: boolean
  hasProgressiveTracking: boolean
  name: string
  id: Id
  metricUnit: MetricUnits
  metricTitle: string
  dateRange: string | JSX.Element
  notesText: Maybe<string>
  overlazyScoreNodeId: Maybe<Id>
  disabled?: boolean
  error?: string
  value?: Maybe<FieldValue>
  tooltip?: ITooltipProps
  handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
  onChange?: (value: FieldValue, event?: React.SyntheticEvent) => void
  onBlur?: (event?: Maybe<React.SyntheticEvent>) => void
  onFocus?: (event: Maybe<React.SyntheticEvent>) => void
}

interface IMetricCellStylesProps {
  hasNote: IMetricsCellProps['hasNote']
  hasFormula: IMetricsCellProps['hasFormula']
  cellState: MetricCellStateType
  customGoal: IMetricsCellProps['customGoal']
  hasError: boolean
  isEditing: boolean
}

export const MetricsCell = observer(function MetricsCell(
  props: IMetricsCellProps
) {
  const theme = useTheme()
  const { t } = useTranslation()
  const diResolver = useDIResolver()
  const { openOverlazy, updateOverlazyProps, closeOverlazy } =
    useOverlazyController()

  const formContext = React.useContext(FormContext)
  const formFieldArrayContext = React.useContext(FormFieldArrayContext)
  const context = formFieldArrayContext || formContext
  const stickToElementRef = React.useRef<Maybe<HTMLDivElement>>()
  const [isInputFocused, setIsInputFocused] = useState(false)

  const {
    customGoal,
    hasNote,
    hasFormula,
    scoreNodeId,
    hasProgressiveTracking,
    goal,
    overlazyScoreNodeId,
    name,
    disabled: isDisabled = false,
    tooltip: tooltipProps,
    onBlur,
    onChange,
    onFocus,
    metricUnit,
    metricTitle,
    metricRule,
    dateRange,
    notesText,
    handleSetOverlazyScoreNodeId,
  } = props

  const fontColor: Record<MetricCellStateType, string> = {
    ON_TRACK: theme.colors.metricCellOnTrackTextColor,
    OFF_TRACK: theme.colors.metricCellOffTrackTextColor,
    FORMULA_ON_TRACK: theme.colors.metricCellOnTrackWithFormulaTextColor,
    FORMULA_OFF_TRACK: theme.colors.metricCellOffTrackWithFormulaTextColor,
    FORMULA_EMPTY: theme.colors.bodyTextDefault,
    PROGRESSIVE_TRACK: theme.colors.bodyTextDefault,
    EMPTY: theme.colors.bodyTextDefault,
  }

  const { fieldValue, fieldErrorMessage, disabled, tooltip } =
    getFieldStateFromPropsOrContext<FieldValue>({
      context,
      isDisabled,
      name: props.name,
      tooltipProps: tooltipProps || null,
      value: props.value || null,
      error: props.error || null,
      required: null,
    })

  verifyFormContextMatchesField({ name: props.name, fieldValue, context, type })

  const cellState = useMemo(
    () =>
      getMetricCellState({
        value: fieldValue,
        goal,
        customGoal,
        hasFormula,
        hasProgressiveTracking,
        metricUnit,
        metricRule,
        diResolver,
      }),
    [
      fieldValue,
      goal,
      customGoal,
      hasFormula,
      hasProgressiveTracking,
      metricUnit,
      metricRule,
      diResolver,
    ]
  )

  const isEmptyCell = cellState === 'EMPTY' || cellState === 'FORMULA_EMPTY'
  const isEditing = isInputFocused === true && !hasFormula
  const openTooltipForMetricCellInFocus =
    isInputFocused &&
    (!!fieldErrorMessage || (fieldValue && fieldValue.length > 7))

  const customGoalText = useMemo(() => {
    if (customGoal && isSingleValueMetricGoal(customGoal.goal)) {
      return t(`Custom Goal: {{customGoal}}`, {
        customGoal: `${METRIC_RULE_TO_SIGN_MAP[customGoal.metricRule]} ${
          customGoal.goal.valueFormatted
        }`,
      })
    } else if (customGoal && isMinMaxMetricGoal(customGoal.goal)) {
      return t(`Custom Goal: {{customGoal}}`, {
        customGoal: `${METRIC_RULE_TO_SIGN_MAP[customGoal.metricRule]} ${
          customGoal.goal.minData.minFormatted
        } - ${customGoal.goal.maxData.maxFormatted}`,
      })
    } else {
      return null
    }
  }, [customGoal, t])

  const metricFormattedFieldValue = useMemo(() => {
    if (!!fieldErrorMessage) {
      return t('ERROR')
    } else if (cellState === 'FORMULA_EMPTY') {
      return t('N/A')
    } else {
      if (metricUnit === 'YESNO' && fieldValue && fieldValue.length) {
        if (fieldValue.toLowerCase() === 'yes') {
          return t('Yes')
        } else if (fieldValue.toLowerCase() === 'no') {
          return t('No')
        } else {
          return fieldValue || ''
        }
      }
      return getMetricNumberFormatted({
        units: metricUnit,
        value: getMetricRoundedNumber({
          value: fieldValue || '',
          applyGreaterThanOneThousandRounding: true,
        }),
        disablePrefix: false,
        disableSuffix: false,
      })
    }
  }, [
    cellState,
    fieldValue,
    fieldErrorMessage,
    metricUnit,
    t,
    getMetricRoundedNumber,
  ])

  const onInputValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value, event)
      } else if (context) {
        context.onFieldChange(name, event.target.value)
      } else {
        throw new Error(`No onChange provided for this field`)
      }
    },
    [name, onChange, context]
  )

  const handleBlur = useCallback(
    (e?: React.FocusEvent<HTMLInputElement>) => {
      setIsInputFocused(false)
      onBlur && onBlur(e)
      context && context.onSetIsTouchedByFieldName(name)
    },
    [setIsInputFocused, onBlur, name, context]
  )

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsInputFocused(true)

      onFocus && onFocus(e)
      context && context.onSetIsFocusedByFieldName(name)
    },
    [setIsInputFocused, onFocus, context, name]
  )

  const handleSetIsInputFocused = useCallback(() => {
    if (hasFormula || disabled) {
      return null
    }
    setIsInputFocused(true)
  }, [setIsInputFocused, hasFormula, disabled])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        return handleBlur()
      }
    },
    [handleBlur]
  )

  const openCellNotesOverlazy = React.useCallback(() => {
    if (!scoreNodeId) {
      return
    }
    closeOverlazy({ type: 'StickyDrawer' })

    // Note: when opening one metric cell note, then opening another one by clicking the note icon, we run into the issue that the original
    // sitcky drawer does not dismount, thus not properly resetting the initialEditMode state textInputEditState. We cannot close the active sticky
    // drawer within overlazy controller since updates are batched, so we have to close here, then open the note.
    setTimeout(() => {
      //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
      handleSetOverlazyScoreNodeId(scoreNodeId)
      openOverlazy('MetricCellNotesStickyDrawer', {
        isLoading: false,
        title: metricTitle,
        hasMetScore:
          cellState === 'ON_TRACK' || cellState === 'FORMULA_ON_TRACK',
        initialEditMode: !hasNote && !disabled,
        disabled,
        tooltip,
        scoreNodeId,
        dateRange,
        score: getMetricNumberFormatted({
          units: metricUnit,
          value: fieldValue || '',
        }),
        notes: notesText || '',
        stickToElementRef,
      })
    }, 0)
  }, [
    disabled,
    tooltip,
    metricUnit,
    openOverlazy,
    metricTitle,
    cellState,
    hasNote,
    dateRange,
    fieldValue,
    notesText,
    stickToElementRef,
    scoreNodeId,
    handleSetOverlazyScoreNodeId,
    closeOverlazy,
  ])

  const handleRef = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      stickToElementRef.current = ref
    }
  }, [])

  React.useEffect(() => {
    //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
    // HACK N SLASH: We have to have this check since the upateOverlazy would update n times depending on how many times the metricCell is rendered
    // on the table. So if I update the notes, score or title, it would fire this useEffect n times, with the UI reflecting the update from
    // the last instance of the metricsCell component. This should be handled under TTD-1389 or potentially TTD-2088 would fix this.
    if (scoreNodeId === overlazyScoreNodeId) {
      return updateOverlazyProps('MetricCellNotesStickyDrawer', {
        notes: notesText || '',
        score: getMetricNumberFormatted({
          units: metricUnit,
          value: fieldValue || '',
        }),
        title: metricTitle,
        stickToElementRef,
      })
    }
  }, [
    notesText,
    updateOverlazyProps,
    metricTitle,
    metricUnit,
    fieldValue,
    scoreNodeId,
    overlazyScoreNodeId,
    stickToElementRef,
  ])

  const inputRender = isEditing ? (
    <Tooltip
      msg={!!fieldErrorMessage ? fieldErrorMessage : fieldValue}
      isOpen={openTooltipForMetricCellInFocus}
      position='bottom center'
      offset={toREM(8)}
      type={'light'}
    >
      <StyledInput
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={onInputValueChange}
        onKeyDown={handleKeyDown}
        // autoFocus is fine here as we are only autoFocusing
        // when user clicks on it
        autoFocus={isInputFocused} // eslint-disable-line
        value={fieldValue}
        color={fontColor[cellState]}
      />
    </Tooltip>
  ) : (
    <Clickable
      clicked={handleSetIsInputFocused}
      css={css`
        align-items: center;
        display: flex;
        height: 100%;
        width: 100%;

        ${(hasFormula || disabled) &&
        css`
          cursor: auto;
        `}
      `}
    >
      {metricFormattedFieldValue.length >= 9 ? (
        <Tooltip
          msg={metricFormattedFieldValue}
          position='bottom center'
          offset={theme.sizes.spacing8}
          type={'light'}
        >
          <span
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <TextEllipsis
              type={'body'}
              wordBreak={true}
              lineLimit={1}
              color={{
                color: !!fieldErrorMessage
                  ? theme.colors.metricCellErrorTextColor
                  : fontColor[cellState],
              }}
              tooltipProps={{
                position: 'bottom center',
                offset: theme.sizes.spacing8,
                type: 'light',
              }}
              css={css`
                display: inline-block;
                overflow: hidden;
                padding-left: ${toREM(3)};
                text-align: center;
                text-overflow: ellipsis;
                width: ${toREM(70)};
                white-space: nowrap;

                ${hasFormula &&
                cellState === 'FORMULA_EMPTY' &&
                css`
                  color: ${theme.colors.metricCellNAFormulaTextColor};
                `}
              `}
            >
              {metricFormattedFieldValue}
            </TextEllipsis>
          </span>
        </Tooltip>
      ) : (
        <TextEllipsis
          type={'body'}
          wordBreak={true}
          lineLimit={1}
          alwaysShowTooltipOnMouseOver={metricFormattedFieldValue.length >= 9}
          color={{
            color: !!fieldErrorMessage
              ? theme.colors.metricCellErrorTextColor
              : fontColor[cellState],
          }}
          tooltipProps={{
            position: 'bottom center',
            offset: theme.sizes.spacing8,
            type: 'light',
          }}
          css={css`
            display: inline-block;
            overflow: hidden;
            padding-left: ${toREM(3)};
            text-align: center;
            text-overflow: ellipsis;
            width: ${toREM(70)};
            white-space: nowrap;

            ${hasFormula &&
            cellState === 'FORMULA_EMPTY' &&
            css`
              color: ${theme.colors.metricCellNAFormulaTextColor};
            `}
          `}
        >
          {metricFormattedFieldValue}
        </TextEllipsis>
      )}
    </Clickable>
  )

  return (
    <MetricCellsStyles
      hasError={!!fieldErrorMessage}
      hasNote={hasNote}
      hasFormula={hasFormula}
      cellState={cellState}
      customGoal={customGoal}
      ref={handleRef}
      isEditing={isEditing}
    >
      {!isEmptyCell ? (
        <Tooltip
          msg={customGoalText}
          position='top center'
          offset={toREM(10)}
          type={'light'}
        >
          <StyledCellContainer isEditing={isEditing}>
            {inputRender}
            <div className='underline' />
          </StyledCellContainer>
        </Tooltip>
      ) : (
        <StyledCellContainer isEditing={isEditing}>
          {inputRender}
          <div className='underline' />
        </StyledCellContainer>
      )}
      {!isEmptyCell && (
        <Tooltip
          msg={
            hasNote
              ? t('View note')
              : !hasNote && disabled && tooltip
                ? tooltip.msg
                : t('Add note')
          }
          position='top center'
          offset={toREM(16)}
          type={'light'}
        >
          {!hasNote && disabled ? (
            <span>
              <div className='noteTab'></div>
            </span>
          ) : (
            <Clickable clicked={openCellNotesOverlazy}>
              <span>
                <div className='noteTab'></div>
              </span>
            </Clickable>
          )}
        </Tooltip>
      )}
    </MetricCellsStyles>
  )
})

const StyledInput = styled.input<{ color: string }>`
  width: 100%;
  height: ${toREM(20)};
  padding-right: ${(props) => props.theme.sizes.spacing4};
  padding-left: ${(props) => props.theme.sizes.spacing4};
  text-align: center;
  background-color: transparent;
  outline: none;
  border: 0;
  color: ${(props) => props.color};

  ${getTextStyles({ type: 'body' })}
`

const StyledCellContainer = styled.div<{ isEditing: boolean }>`
  position: relative;
  width: 100%;
  height: ${(props) =>
    props.isEditing ? 'auto' : props.theme.sizes.spacing32};
`

export const MetricCellsStyles = styled.div<IMetricCellStylesProps>`
  position: relative;
  width: ${toREM(72)};
  height: ${(props) => props.theme.sizes.spacing32};
  border-radius: ${(props) => props.theme.sizes.br1};
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  border: ${(props) => props.theme.sizes.smallSolidBorder};
  border-color: ${(props) => props.theme.colors.metricCellDefaultBorderColor};
  background-color: ${(props) =>
    props.theme.colors.metricCellDefaultBackgroundColor};

  ${({ hasError }) =>
    hasError &&
    css`
      border: ${(props) => props.theme.sizes.smallDashedBorder}
        ${(props) => props.theme.colors.metricCellErrorBorderColor} !important;
    `}

  .underline {
    width: ${({ theme }) => theme.sizes.spacing40};
    position: absolute;
    right: ${toREM(15)};

    ${({ isEditing }) => css`
      bottom: ${isEditing ? toREM(0) : toREM(6)};
    `}
  }

  .noteTab {
    height: ${(prop) => prop.theme.sizes.spacing12};
    width: ${(prop) => prop.theme.sizes.spacing12};
    border-radius: ${(props) => props.theme.sizes.br1};
    position: absolute;
    top: -${toREM(1)};
    right: -${toREM(1)};
  }

  &:hover,
  &:focus {
    border: ${(props) =>
      `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.metricCellDefaultBorderHoverColor}`};
  }

  ${({ customGoal, cellState }) =>
    !customGoal
      ? ''
      : cellState === 'EMPTY'
        ? css`
            .underline {
              border-bottom: ${(props) => props.theme.sizes.smallSolidBorder};
              border-color: ${(props) => props.theme.colors.bodyTextDefault};
            }
          `
        : cellState === 'PROGRESSIVE_TRACK'
          ? css`
              .underline {
                border-bottom: ${(props) => props.theme.sizes.smallSolidBorder};
                border-color: ${(props) => props.theme.colors.bodyTextDefault};
              }
            `
          : cellState === 'OFF_TRACK'
            ? css`
                .underline {
                  border-bottom: ${(props) =>
                    props.theme.sizes.smallSolidBorder};
                  border-color: ${(props) =>
                    props.theme.colors.metricCellOffTrackTextColor};
                }
              `
            : cellState === 'ON_TRACK'
              ? css`
                  .underline {
                    border-bottom: ${(props) =>
                      props.theme.sizes.smallSolidBorder};
                    border-color: ${(props) =>
                      props.theme.colors.metricCellOnTrackTextColor};
                  }
                `
              : cellState === 'FORMULA_EMPTY'
                ? css`
                    .underline {
                      border-bottom: ${(props) =>
                        props.theme.sizes.smallSolidBorder};
                      border-color: ${(props) =>
                        props.theme.colors.metricCustomGoalHeaderGoalTextColor};
                    }
                  `
                : cellState === 'FORMULA_OFF_TRACK'
                  ? css`
                      .underline {
                        border-bottom: ${(props) =>
                          props.theme.sizes.smallSolidBorder};
                        border-color: ${(props) =>
                          props.theme.colors
                            .metricCellOffTrackWithFormulaTextColor};
                      }
                    `
                  : cellState === 'FORMULA_ON_TRACK'
                    ? css`
                        .underline {
                          border-bottom: ${(props) =>
                            props.theme.sizes.smallSolidBorder};
                          border-color: ${(props) =>
                            props.theme.colors
                              .metricCellOnTrackWithFormulaTextColor};
                        }
                      `
                    : css`
                        .underline {
                          border: none;
                        }
                      `}
  ${({ cellState, hasNote }) =>
    cellState === 'OFF_TRACK'
      ? css`
          ${hasNote && offTrackCellNoteStyles}

          &:hover,
          &:focus {
            ${offTrackCellNoteStyles}
          }
        `
      : cellState === 'ON_TRACK'
        ? css`
            ${hasNote && onTrackCellNoteStyles}

            &:hover,
          &:focus {
              ${onTrackCellNoteStyles}
            }
          `
        : cellState === 'PROGRESSIVE_TRACK' || cellState === 'EMPTY'
          ? css`
              ${hasNote && progressiveTrackAndEmptyCellNoteStyles}

              &:hover,
          &:focus {
                ${progressiveTrackAndEmptyCellNoteStyles}
              }
            `
          : cellState === 'FORMULA_EMPTY' ||
              cellState === 'FORMULA_OFF_TRACK' ||
              cellState === 'FORMULA_ON_TRACK'
            ? css`
                ${hasNote && formulaCellNoteStyles}

                background-color: ${(props) =>
                  props.theme.colors.metricsCellFormulaBackgroundColor};

                &:hover,
                &:focus {
                  ${formulaCellNoteStyles}
                }
              `
            : css`
                .noteTab {
                  border: none;
                }
              `}

  ${({ cellState }) =>
    cellState === 'OFF_TRACK'
      ? css`
          background-color: ${(props) =>
            props.theme.colors.metricCellOffTrackBackgroundColor};

          border: ${(props) => props.theme.sizes.smallSolidBorder}
            ${(props) => props.theme.colors.metricCellOffTrackBorderColor};
          color: ${(props) => props.theme.colors.metricCellOffTrackTextColor};

          &:hover,
          &:focus {
            border-color: ${(props) =>
              props.theme.colors.metricCellOffTrackBorderHoverColor};

            .noteTab {
              border-color: ${(props) =>
                props.theme.colors.metricCellOffTrackBorderHoverColor};
              background: linear-gradient(
                to top right,
                ${(props) =>
                    props.theme.colors.metricCellOffTrackBackgroundColor}
                  calc(50% - 1px),
                ${(props) =>
                  props.theme.colors.metricCellOffTrackBorderHoverColor},
                ${(props) =>
                    props.theme.colors.metricCellOffTrackHasNotesTabColor}
                  calc(50% + 1px)
              );
            }
          }
        `
      : cellState === 'ON_TRACK'
        ? css`
            background-color: ${(props) =>
              props.theme.colors.metricCellOnTrackBackgroundColor};
            border: ${(props) => props.theme.sizes.smallSolidBorder}
              ${(props) => props.theme.colors.metricCellOnTrackBorderColor};
            color: ${(props) => props.theme.colors.metricCellOnTrackTextColor};

            &:hover,
            &:focus {
              border-color: ${(props) =>
                props.theme.colors.metricCellOnTrackBorderHoverColor};

              .noteTab {
                border-color: ${(props) =>
                  props.theme.colors.metricCellOnTrackBorderHoverColor};
                background: linear-gradient(
                  to top right,
                  ${(props) =>
                      props.theme.colors.metricCellOnTrackBackgroundColor}
                    calc(50% - 1px),
                  ${(props) =>
                    props.theme.colors.metricCellOnTrackBorderHoverColor},
                  ${(props) =>
                      props.theme.colors.metricCellOnTrackHasNotesTabColor}
                    calc(50% + 1px)
                );
              }
            }
          `
        : cellState === 'FORMULA_EMPTY'
          ? css`
              border-color: ${(props) =>
                props.theme.colors.metricCellFormulaBorderColor};

              &:hover,
              &:focus {
                border: ${(props) => props.theme.sizes.smallSolidBorder}
                  ${(props) =>
                    props.theme.colors.metricCellFormulaBorderHoverColor};

                .noteTab {
                  border-color: ${(props) =>
                    props.theme.colors.metricCellFormulaBorderHoverColor};
                  background: linear-gradient(
                    to top right,
                    ${(props) =>
                        props.theme.colors.metricCellDefaultBackgroundColor}
                      calc(50% - 1px),
                    ${(props) =>
                      props.theme.colors.metricCellFormulaBorderHoverColor},
                    ${(props) =>
                        props.theme.colors.metricCellDefaultBorderColor}
                      calc(50% + 1px)
                  );
                }
              }
            `
          : cellState === 'FORMULA_ON_TRACK'
            ? css`
                border-color: ${(props) =>
                  props.theme.colors.metricCellFormulaBorderColor};
                color: ${(props) =>
                  props.theme.colors.metricCellOnTrackWithFormulaTextColor};

                &:hover,
                &:focus {
                  border-color: ${(props) =>
                    props.theme.colors.metricCellFormulaBorderHoverColor};

                  .noteTab {
                    border-color: ${(props) =>
                      props.theme.colors.metricCellFormulaBorderHoverColor};
                    background: linear-gradient(
                      to top right,
                      ${(props) =>
                          props.theme.colors.metricCellDefaultBackgroundColor}
                        calc(50% - 1px),
                      ${(props) =>
                        props.theme.colors.metricCellFormulaBorderHoverColor},
                      ${(props) =>
                          props.theme.colors
                            .metricCellNotesTabTopRightDefaultColor}
                        calc(50% + 1px)
                    );
                  }
                }
              `
            : cellState === 'FORMULA_OFF_TRACK'
              ? css`
                  border-color: ${(props) =>
                    props.theme.colors.metricCellFormulaBorderColor};
                  color: ${(props) =>
                    props.theme.colors.metricCellOffTrackWithFormulaTextColor};

                  &:hover,
                  &:focus {
                    border-color: ${(props) =>
                      props.theme.colors.metricCellFormulaBorderHoverColor};

                    .noteTab {
                      border-color: ${(props) =>
                        props.theme.colors.metricCellFormulaBorderHoverColor};
                      background: linear-gradient(
                        to top right,
                        ${(props) =>
                            props.theme.colors.metricCellDefaultBackgroundColor}
                          calc(50% - 1px),
                        ${(props) =>
                          props.theme.colors.metricCellFormulaBorderHoverColor},
                        ${(props) =>
                            props.theme.colors
                              .metricCellNotesTabTopRightDefaultColor}
                          calc(50% + 1px)
                      );
                    }
                  }
                `
              : cellState === 'EMPTY' || cellState === 'PROGRESSIVE_TRACK'
                ? css`
                    border: ${(props) => props.theme.sizes.smallSolidBorder};
                    border-color: ${(props) =>
                      props.theme.colors.metricCellDefaultBorderColor};

                    &:hover,
                    &:focus {
                      .noteTab {
                        border-color: ${(props) =>
                          props.theme.colors.metricCellDefaultBorderHoverColor};
                        background: linear-gradient(
                          to top right,
                          ${(props) =>
                              props.theme.colors
                                .metricCellDefaultBackgroundColor}
                            calc(50% - 1px),
                          ${(props) =>
                            props.theme.colors
                              .metricCellDefaultBorderHoverColor},
                          ${(props) =>
                              props.theme.colors
                                .metricCellNotesTabTopRightDefaultColor}
                            calc(50% + 1px)
                        );
                      }
                    }
                  `
                : css`
                    border: ${(props) => props.theme.sizes.smallSolidBorder};
                    border-color: ${(props) =>
                      props.theme.colors.metricCellDefaultBackgroundColor};

                    &:hover,
                    &:focus {
                      .noteTab {
                        border-color: ${(props) =>
                          props.theme.colors.metricCellDefaultBorderHoverColor};
                        background: linear-gradient(
                          to top right,
                          ${(props) =>
                              props.theme.colors
                                .metricCellDefaultBackgroundColor}
                            calc(50% - 1px),
                          ${(props) =>
                            props.theme.colors
                              .metricCellDefaultBorderHoverColor},
                          ${(props) =>
                              props.theme.colors
                                .metricCellNotesTabTopRightDefaultColor}
                            calc(50% + 1px)
                        );
                      }
                    }
                  `}
`

const offTrackCellNoteStyles = css`
  .noteTab {
    border: ${(props) =>
      `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.metricCellOffTrackBorderColor}`};
    background: linear-gradient(
      to top right,
      ${(props) => props.theme.colors.metricCellOffTrackBackgroundColor}
        calc(50% - 1px),
      ${(props) => props.theme.colors.metricCellOffTrackBorderColor},
      ${(props) => props.theme.colors.metricCellOffTrackHasNotesTabColor}
        calc(50% + 1px)
    );

    &:hover,
    &:focus {
      border-color: ${(props) =>
        props.theme.colors.metricCellOffTrackBorderHoverColor};
      background: linear-gradient(
        to top right,
        ${(props) => props.theme.colors.metricCellOffTrackBackgroundColor}
          calc(50% - 1px),
        ${(props) => props.theme.colors.metricCellOffTrackBackgroundColor},
        ${(props) => props.theme.colors.metricCellOffTrackHasNotesTabColor}
          calc(50% + 1px)
      );
    }
  }
`
const onTrackCellNoteStyles = css`
  .noteTab {
    border: ${(props) =>
      `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.metricCellOnTrackBorderColor}`};
    background: linear-gradient(
      to top right,
      ${(props) => props.theme.colors.metricCellOnTrackBackgroundColor}
        calc(50% - 1px),
      ${(props) => props.theme.colors.metricCellOnTrackWithFormulaTextColor},
      ${(props) => props.theme.colors.metricCellOnTrackHasNotesTabColor}
        calc(50% + 1px)
    );

    &:hover,
    &:focus {
      border-color: ${(props) =>
        props.theme.colors.metricCellOnTrackBorderHoverColor};
      background: linear-gradient(
        to top right,
        ${(props) => props.theme.colors.metricCellOnTrackBackgroundColor}
          calc(50% - 1px),
        ${(props) => props.theme.colors.metricCellOnTrackBorderHoverColor},
        ${(props) => props.theme.colors.metricCellOnTrackHasNotesTabColor}
          calc(50% + 1px)
      );
    }
  }
`

const progressiveTrackAndEmptyCellNoteStyles = css`
  .noteTab {
    border: ${(props) =>
      `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.metricCellDefaultBorderColor}`};
    background: linear-gradient(
      to top right,
      ${(props) => props.theme.colors.metricCellDefaultBackgroundColor}
        calc(50% - 1px),
      ${(props) => props.theme.colors.metricCellFormulaHasNotesTabColor},
      ${(props) => props.theme.colors.metricCellNotesTabTopRightDefaultColor}
        calc(50% + 1px)
    );

    &:hover,
    &:focus {
      border-color: ${(props) =>
        props.theme.colors.metricCellDefaultBorderHoverColor};
      background: linear-gradient(
        to top right,
        ${(props) => props.theme.colors.metricCellDefaultBackgroundColor}
          calc(50% - 1px),
        ${(props) => props.theme.colors.metricCellDefaultBorderHoverColor},
        ${(props) => props.theme.colors.metricCellNotesTabTopRightDefaultColor}
          calc(50% + 1px)
      );
    }
  }
`

const formulaCellNoteStyles = css`
  .noteTab {
    border: ${(props) =>
      `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.metricCellFormulaBorderColor}`};
    background: linear-gradient(
      to top right,
      ${(props) => props.theme.colors.metricCellDefaultBackgroundColor}
        calc(50% - 1px),
      ${(props) => props.theme.colors.metricCellFormulaBorderColor},
      ${(props) => props.theme.colors.metricCellDefaultBorderColor}
        calc(50% + 1px)
    );

    &:hover,
    &:focus {
      border-color: ${(props) =>
        props.theme.colors.metricCellFormulaBorderHoverColor};
      background: linear-gradient(
        to top right,
        ${(props) => props.theme.colors.metricCellDefaultBackgroundColor}
          calc(50% - 1px),
        ${(props) => props.theme.colors.metricCellFormulaBorderHoverColor},
        ${(props) => props.theme.colors.metricCellNotesTabTopRightDefaultColor}
          calc(50% + 1px)
      );
    }
  }
`
