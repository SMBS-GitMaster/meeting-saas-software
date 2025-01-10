import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  formFieldArrayValidators,
  formValidators,
  required,
} from '@mm/core/forms'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { meetingInstanceSummarySendToLookup } from '@mm/core-bloom/meetings/lookups'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Card,
  CheckBoxInput,
  Loading,
  SelectInputSingleSelection,
  Text,
  TextEllipsis,
  sharedScrollbarStyles,
  toREM,
} from '@mm/core-web/ui'

import { useAction, useObservable } from '../pages/performance/mobx'
import {
  IWrapUpActionHandlers,
  IWrapUpConcludeFormValue,
  IWrapUpViewData,
  TWrapUpResponsiveSize,
} from './wrapUpTypes'

export const WrapUpConcludeActions = observer(
  (props: {
    getData: () => Pick<
      IWrapUpViewData,
      | 'isLoading'
      | 'currentUser'
      | 'getCurrentUserPermissions'
      | 'sendEmailSummaryTo'
      | 'includeMeetingNotesInEmailSummary'
      | 'getMeetingNotes'
      | 'archiveCompletedTodos'
      | 'archiveHeadlines'
    >
    getActions: () => Pick<
      IWrapUpActionHandlers,
      'onUpdateWrapUpMeetingValues' | 'onConclude'
    >
    getGridResponsiveSize: () => number
    getWrapUpResponsiveSize: () => TWrapUpResponsiveSize
  }) => {
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    const componentState = useObservable({ viewMoreNotes: false })

    const {
      getData,
      getActions,
      getGridResponsiveSize,
      getWrapUpResponsiveSize,
    } = props

    const { canEditMeetingConcludeActionsInMeeting } =
      getData().getCurrentUserPermissions()

    const renderResponsiveMediumSizeStyles =
      getWrapUpResponsiveSize() === 'MEDIUM'
    const renderResponsiveXSmallDropdownWidth =
      getWrapUpResponsiveSize() === 'XSMALL' ? '100%' : toREM(250)
    const meetingHasThreeNotesOrLess = getData().getMeetingNotes().length <= 3

    const handleToggleViewMoreNotes = useAction(() => {
      componentState.viewMoreNotes = !componentState.viewMoreNotes
    })

    const meetingNotes = getData().getMeetingNotes()
    const memoizedFormValues = useMemo(() => {
      return {
        sendEmailSummaryTo: getData().sendEmailSummaryTo,
        includeMeetingNotesInEmailSummary:
          getData().includeMeetingNotesInEmailSummary,
        meetingNotes,
        archiveCompletedTodos: getData().archiveCompletedTodos,
        archiveHeadlines: getData().archiveHeadlines,
      }
    }, [
      getData().sendEmailSummaryTo,
      getData().includeMeetingNotesInEmailSummary,
      getData().archiveCompletedTodos,
      getData().archiveHeadlines,
      meetingNotes,
    ])

    return (
      <Card.Deemphasize>
        <EditForm
          isLoading={getData().isLoading}
          disabled={!canEditMeetingConcludeActionsInMeeting.allowed}
          disabledTooltip={
            !canEditMeetingConcludeActionsInMeeting.allowed
              ? {
                  msg: canEditMeetingConcludeActionsInMeeting.message,
                  type: 'light',
                  position: 'top center',
                }
              : undefined
          }
          values={memoizedFormValues}
          validation={
            {
              sendEmailSummaryTo: formValidators.stringOrNumber({
                additionalRules: [],
              }),
              includeMeetingNotesInEmailSummary: formValidators.boolean({
                additionalRules: [required()],
              }),
              meetingNotes: formValidators.array({
                additionalRules: [],
              }),
              archiveCompletedTodos: formValidators.boolean({
                additionalRules: [required()],
              }),
              archiveHeadlines: formValidators.boolean({
                additionalRules: [required()],
              }),
            } satisfies GetParentFormValidation<IWrapUpConcludeFormValue>
          }
          onSubmit={getActions().onUpdateWrapUpMeetingValues}
        >
          {({ fieldNames, values }) => {
            if (getData().isLoading) {
              return <Loading showTitle={false} size='small' />
            }

            return (
              <>
                <Card.SectionHeader
                  css={css`
                    padding-top: ${(prop) => prop.theme.sizes.spacing32};
                    padding-bottom: 0;
                  `}
                >
                  <Card.Title>{t('Concluding actions')}</Card.Title>
                  <Text type='body' color={{ intent: 'deemph' }}>
                    {t(
                      'Send summary and archive completed items for the next meeting.'
                    )}
                  </Text>
                </Card.SectionHeader>
                <Card.BodySafeArea
                  css={css`
                    padding-bottom: ${(prop) => prop.theme.sizes.spacing24};
                  `}
                >
                  <div
                    css={css`
                      display: grid;
                      grid-template-columns: repeat(
                        ${getGridResponsiveSize()},
                        1fr
                      );
                      gap: ${(props) => props.theme.sizes.spacing16};
                    `}
                  >
                    <SelectInputSingleSelection
                      id='wrap-up-conclude-send-to'
                      name={fieldNames.sendEmailSummaryTo}
                      options={meetingInstanceSummarySendToLookup}
                      unknownItemText={t('Unknown option')}
                      width={renderResponsiveXSmallDropdownWidth}
                      wrapOverflow={true}
                      formControl={{
                        label: t('Send email summary to'),
                      }}
                      css={css`
                        order: 1;
                      `}
                    />

                    <div
                      css={css`
                        display: flex;
                        flex-flow: column;
                        align-items: flex-start;

                        ${renderResponsiveMediumSizeStyles &&
                        css`
                          order: 3;
                        `}
                      `}
                    >
                      <CheckBoxInput
                        id='wrap-up-conclude-include-notes'
                        name={fieldNames.includeMeetingNotesInEmailSummary}
                        inputType='toggle'
                        text={
                          <Text weight='semibold' type='body'>
                            {t('Include meeting notes')}
                          </Text>
                        }
                        css={css`
                          display: flex;
                          align-items: center;
                          gap: ${(prop) => prop.theme.sizes.spacing8};
                          margin-bottom: ${(prop) =>
                            prop.theme.sizes.spacing12};
                        `}
                      />

                      {values?.includeMeetingNotesInEmailSummary === true && (
                        <>
                          <Text
                            type='body'
                            color={{ intent: 'deemph' }}
                            css={css`
                              margin-bottom: ${toREM(10)};
                            `}
                          >
                            {t(
                              'Select all notes that you wish to include in your summary'
                            )}
                          </Text>
                          <FormFieldArray<{
                            parentFormValues: IWrapUpConcludeFormValue
                            arrayFieldName: typeof fieldNames.meetingNotes
                          }>
                            name={fieldNames.meetingNotes}
                            validation={{
                              title: formFieldArrayValidators.string({}),
                              selected: formFieldArrayValidators.boolean({
                                additionalRules: [required()],
                                defaultValue: false,
                              }),
                            }}
                          >
                            {({
                              fieldArrayPropNames,
                              values,
                              generateFieldName,
                            }) => (
                              <>
                                <div
                                  css={css`
                                    height: ${!componentState.viewMoreNotes
                                      ? toREM(110)
                                      : toREM(220)};
                                    overflow-y: auto;
                                    width: 100%;

                                    ${sharedScrollbarStyles}
                                  `}
                                >
                                  {values.map((node, index) => {
                                    if (
                                      !componentState.viewMoreNotes &&
                                      index > 2
                                    ) {
                                      return
                                    }

                                    return (
                                      <CheckBoxInput
                                        key={index}
                                        iconSize={'lg'}
                                        id={`wrap-up-conclude-meeting-notes-${node.id}`}
                                        name={generateFieldName({
                                          id: node.id,
                                          propName:
                                            fieldArrayPropNames.selected,
                                        })}
                                        text={node.title}
                                        css={css`
                                          display: block;
                                          margin-bottom: ${toREM(12)};
                                        `}
                                      />
                                    )
                                  })}
                                </div>
                                {!meetingHasThreeNotesOrLess && (
                                  <>
                                    {!componentState.viewMoreNotes ? (
                                      <BtnText
                                        intent='tertiaryTransparent'
                                        width='noPadding'
                                        ariaLabel={t('View more notes')}
                                        onClick={handleToggleViewMoreNotes}
                                      >
                                        {t('View more notes')}
                                      </BtnText>
                                    ) : (
                                      <BtnText
                                        intent='tertiaryTransparent'
                                        width='noPadding'
                                        ariaLabel={t('View less notes')}
                                        onClick={handleToggleViewMoreNotes}
                                      >
                                        {t('View less notes')}
                                      </BtnText>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </FormFieldArray>
                        </>
                      )}
                    </div>

                    <div
                      css={css`
                        display: flex;
                        flex-flow: column;

                        ${renderResponsiveMediumSizeStyles &&
                        css`
                          order: 2;
                        `}
                      `}
                    >
                      <CheckBoxInput
                        id='wrap-up-conclude-archive-completed-todos'
                        name={fieldNames.archiveCompletedTodos}
                        inputType='toggle'
                        text={
                          <TextEllipsis
                            lineLimit={1}
                            wordBreak={true}
                            weight='semibold'
                            type='body'
                          >
                            {t('Archive completed {{todos}}', {
                              todos: terms.todo.lowercasePlural,
                            })}
                          </TextEllipsis>
                        }
                        css={css`
                          display: flex;
                          align-items: center;
                          gap: ${(prop) => prop.theme.sizes.spacing8};
                          margin-bottom: ${(prop) =>
                            prop.theme.sizes.spacing16};
                          height: ${toREM(14)};
                        `}
                      />
                      <CheckBoxInput
                        id='wrap-up-conclude-archive-headlines'
                        name={fieldNames.archiveHeadlines}
                        inputType='toggle'
                        text={
                          <TextEllipsis
                            lineLimit={1}
                            wordBreak={true}
                            weight='semibold'
                            type='body'
                          >
                            {t('Archive {{headlines}}', {
                              headlines: terms.headline.lowercasePlural,
                            })}
                          </TextEllipsis>
                        }
                        css={css`
                          display: flex;
                          align-items: center;
                          gap: ${(prop) => prop.theme.sizes.spacing8};
                          margin-bottom: ${(prop) =>
                            prop.theme.sizes.spacing16};
                          height: ${toREM(14)};
                        `}
                      />
                    </div>
                  </div>
                </Card.BodySafeArea>

                <div
                  css={css`
                    padding-bottom: ${(prop) => prop.theme.sizes.spacing24};
                    padding-right: ${(prop) => prop.theme.sizes.spacing24};
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                  `}
                >
                  <BtnText
                    intent='primary'
                    width='small'
                    ariaLabel={t('Conclude meeting')}
                    onClick={() => {
                      values && getActions().onConclude(values)
                    }}
                  >
                    {t('Conclude meeting')}
                  </BtnText>
                </div>
              </>
            )
          }}
        </EditForm>
      </Card.Deemphasize>
    )
  }
)
