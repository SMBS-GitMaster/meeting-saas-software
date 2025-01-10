import React, { useCallback, useMemo, useState } from 'react'
import { css, keyframes } from 'styled-components'

import { type Id } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { useBloomMetricMutations } from '@mm/core-bloom/metrics/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  ITooltipProps,
  Icon,
  Menu,
  StickyDrawer,
  Text,
  TextAreaInput,
  toREM,
  useStickyDrawerController,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID } from '@mm/bloom-web/pages/layout/consts'

interface IMetricCellNotesStickyDrawerProps {
  isLoading: boolean
  title: string
  disabled: boolean
  dateRange: string | JSX.Element
  score: string
  scoreNodeId: Id
  hasMetScore: boolean
  notes: string
  stickToElementRef: React.MutableRefObject<Maybe<HTMLElement> | undefined>
  tooltip?: ITooltipProps
  initialEditMode?: boolean
}

export const MetricCellNotesStickyDrawer: React.FC<
  IMetricCellNotesStickyDrawerProps
> = ({
  title,
  dateRange,
  disabled,
  tooltip,
  score,
  scoreNodeId,
  hasMetScore,
  notes,
  stickToElementRef,
  initialEditMode,
  isLoading,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { closeStickyDrawer } = useStickyDrawerController()
  const { openOverlazy } = useOverlazyController()

  const { editMetricScore } = useBloomMetricMutations()

  const [textInputEditState, setTextInputEditState] =
    useState(!!initialEditMode)

  const memoizedFormValues = useMemo(() => {
    return {
      noteText: notes,
    }
  }, [notes])

  const onSaveNote = useCallback(
    async (opts: { noteText: string }) => {
      try {
        await editMetricScore({ id: scoreNodeId, notesText: opts.noteText })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Failed to save note.`),
          error: new UserActionError(error),
        })
      }
      setTextInputEditState(false)
      closeStickyDrawer()
    },
    [scoreNodeId, closeStickyDrawer, editMetricScore, openOverlazy, t]
  )

  const onDeleteNote = useCallback(async () => {
    try {
      await editMetricScore({ id: scoreNodeId, notesText: null })
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Failed to delete note.`),
        error: new UserActionError(error),
      })
      setTextInputEditState(false)
    }

    closeStickyDrawer()
  }, [openOverlazy, t, editMetricScore, closeStickyDrawer, scoreNodeId])

  const onEditNote = useCallback(() => {
    setTextInputEditState((current) => !current)
  }, [setTextInputEditState])

  return (
    <>
      <StickyDrawer
        id={'MetricCellNotesStickyDrawer'}
        onClose={() => closeStickyDrawer()}
        stickToElementRef={stickToElementRef}
        usePopper={true}
        enableUnderlyingClick
        width={toREM(576)}
        mainBodyContentElementId={MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID}
        css={css`
          min-height: ${toREM(127)};
          border-radius: ${(props) => props.theme.sizes.br1};
          background-color: ${(props) =>
            props.theme.colors.metricCellNoteBackgroundColor} !important;
          animation: ${fadeIn} 500ms linear;
        `}
      >
        <StickyDrawer.Header
          css={css`
            padding: ${(props) => props.theme.sizes.spacing24}
              ${(props) => props.theme.sizes.spacing16} 0
              ${(props) => props.theme.sizes.spacing16};
            background-color: ${(props) =>
              props.theme.colors.metricCellNoteBackgroundColor} !important;
            display: flex;
            align-items: flex-start;
          `}
        >
          <StickyDrawer.Title
            css={css`
              color: ${(props) => props.theme.colors.metricCellNoteTextColor};
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            `}
          >
            <Text type='body' weight='semibold'>
              {title}
            </Text>
            <div>
              {typeof dateRange === 'string' ? (
                <Text
                  type='body'
                  weight='normal'
                  fontStyle='italic'
                  css={css`
                    margin-right: ${(props) => props.theme.sizes.spacing4};
                  `}
                >
                  {dateRange}
                </Text>
              ) : (
                { dateRange }
              )}
              <Text type='body' weight='normal' fontStyle='italic'>
                {t('(')}
              </Text>
              <Text
                fontStyle='italic'
                type='body'
                weight='normal'
                color={{
                  color: hasMetScore
                    ? theme.colors.metricCellNoteGoalSuccessColor
                    : theme.colors.metricCellNoteGoalFailureColor,
                }}
              >
                {`${score}`}
              </Text>
              <Text type='body' weight='normal' fontStyle='italic'>
                {t(')')}
              </Text>
            </div>
          </StickyDrawer.Title>
          <div
            css={css`
              display: flex;
              justify-content: flex-end;
            `}
          >
            <Menu
              position='bottom left'
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={(e) => {
                      onEditNote()
                      close(e)
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                      `}
                    >
                      <Icon iconSize='lg' iconName={'editIcon'} />
                      <Text
                        css={css`
                          padding-left: ${(props) =>
                            props.theme.sizes.spacing8};
                        `}
                      >
                        {t('Edit note')}
                      </Text>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      onDeleteNote()
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                      `}
                    >
                      <Icon iconSize='lg' iconName={'trashIcon'} />
                      <Text
                        css={css`
                          padding-left: ${(props) =>
                            props.theme.sizes.spacing8};
                        `}
                      >
                        {t('Delete note')}
                      </Text>
                    </div>
                  </Menu.Item>
                </>
              )}
            >
              <BtnIcon
                intent='naked'
                size='lg'
                iconProps={{
                  iconName: 'moreVerticalIcon',
                }}
                ariaLabel={t('more')}
                tag={'span'}
                disabled={disabled}
              />
            </Menu>
            <StickyDrawer.Actions>
              <StickyDrawer.CloseButton smallMargin={true} />
            </StickyDrawer.Actions>
          </div>
        </StickyDrawer.Header>
        <StickyDrawer.Body
          css={css`
            padding: ${(props) => props.theme.sizes.spacing16}
              ${(props) => props.theme.sizes.spacing16}
              ${(props) => props.theme.sizes.spacing24}
              ${(props) => props.theme.sizes.spacing16};
            overflow-y: auto;
            height: auto;
          `}
        >
          <EditForm
            isLoading={isLoading}
            disabled={disabled}
            disabledTooltip={tooltip}
            values={memoizedFormValues}
            validation={
              {
                noteText: formValidators.string({
                  additionalRules: [required(), maxLength({ maxLength: 1000 })],
                }),
              } satisfies GetParentFormValidation<{ noteText: string }>
            }
            sendDiffs={false}
            autosave={false}
            onSubmit={async () => {
              // NO-OP
              return
            }}
          >
            {({ fieldNames, hasError, values }) => {
              if (!values) {
                return <Text type='body'>{t('Loading...')}</Text>
              }

              return (
                <TextAreaInput
                  name={fieldNames.noteText}
                  textAreaWithoutHoverState={true}
                  id={'noteTextId'}
                  isEditFromExternalState={textInputEditState}
                  customEditModeFooterContent={() => (
                    <div
                      css={css`
                        display: flex;
                        flex-flow: row-nowrap;
                        justify-content: flex-end;
                      `}
                    >
                      <div>
                        <BtnText
                          intent='tertiary'
                          ariaLabel={t('Cancel')}
                          onClick={() => {
                            setTextInputEditState(false)
                            closeStickyDrawer()
                          }}
                        >
                          {t('Cancel')}
                        </BtnText>

                        <BtnText
                          intent='primary'
                          ariaLabel={t('save')}
                          tooltip={disabled && tooltip ? tooltip : undefined}
                          disabled={hasError || disabled}
                          onClick={() => onSaveNote(values)}
                        >
                          {t('Save')}
                        </BtnText>
                      </div>
                    </div>
                  )}
                />
              )
            }}
          </EditForm>
        </StickyDrawer.Body>
      </StickyDrawer>
    </>
  )
}

const fadeIn = keyframes`
  from {  
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`

export default MetricCellNotesStickyDrawer
