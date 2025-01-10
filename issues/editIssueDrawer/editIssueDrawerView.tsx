import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { getDateDisplayUserLocale, guessTimezone } from '@mm/core/date'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  ActionButton,
  BtnIcon,
  BtnText,
  CheckBoxInput,
  Drawer,
  GridContainer,
  GridItem,
  Icon,
  Loading,
  Menu,
  NotesBox,
  SelectInputCategoriesSingleSelection,
  SelectInputSingleSelection,
  Text,
  TextInput,
  Timer,
  renderListOption,
  renderSelectedOptionSmallAvatar,
  shouldOptionBeIncludedInFilteredOptions,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { getRecordOfOverlazyDrawerIdToDrawerTitle } from '@mm/bloom-web/bloomProvider/overlazy'
import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'
import { useComputed } from '@mm/bloom-web/pages/performance/mobx'
import {
  ContextAwareBanner,
  CustomDrawerHeaderContent,
} from '@mm/bloom-web/shared'

import {
  IEditIssueDrawerViewProps,
  IEditIssueValues,
} from './editIssueDrawerTypes'

const EDIT_ISSUE_DRAWER_ID = 'EditIssueDrawer'

export const EditIssueDrawerView = observer(function EditIssueDrawerView(
  props: IEditIssueDrawerViewProps
) {
  const { closeOverlazy, openOverlazy } = useOverlazyController()

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()

  const data = props.getData()
  const actions = props.getActions()

  const userTimezone = data.currentUser?.settings.timezone || guessTimezone()

  const { canEditIssuesInMeeting, canCreateTodosInMeeting } =
    data.getCurrentUserPermissions()

  const issue = data.getIssue()
  const isCurrentMeetingIssueMeeting = data.meetingId === issue.meetingId

  const isDisabledDrawer =
    !isCurrentMeetingIssueMeeting || !canEditIssuesInMeeting.allowed

  const disabledTooltip = !canEditIssuesInMeeting.allowed
    ? {
        msg: canEditIssuesInMeeting.message,
      }
    : !isCurrentMeetingIssueMeeting
      ? {
          msg: t('This {{issue}} is not attached to your meeting.', {
            issue: terms.issue.lowercaseSingular,
          }),
        }
      : undefined

  const memoizedIssueFormValues = useComputed(
    () => {
      const issue = data.getIssue()
      return {
        completed: issue.completed,
        title: issue.title,
        ownerId: issue.ownerId,
        meetingId: issue.meetingId,
        addToDepartmentPlan: issue.addToDepartmentPlan,
        notesId: issue.notesId,
      } as IEditIssueValues
    },
    {
      name: `EditIssueDrawerView_memoizedIssueFormValues`,
    }
  )

  return (
    <>
      <EditForm
        // this key helps the drawer rerender in embedded view when switching between items,
        // we use the id from props to prevent a rerender once the data loads.
        key={`${EDIT_ISSUE_DRAWER_ID}_${issue.id}`}
        isLoading={data.isLoading}
        disabled={isDisabledDrawer}
        disabledTooltip={disabledTooltip}
        values={memoizedIssueFormValues()}
        validation={
          {
            completed: formValidators.boolean({
              additionalRules: [],
            }),
            title: formValidators.string({
              additionalRules: [
                required(),
                maxLength({
                  maxLength: MEETING_TITLES_CHAR_LIMIT,
                  customErrorMsg: t(`Can't exceed {{maxLength}} characters`, {
                    maxLength: MEETING_TITLES_CHAR_LIMIT,
                  }),
                }),
              ],
            }),
            ownerId: formValidators.stringOrNumber({
              additionalRules: [required()],
            }),
            meetingId: formValidators.stringOrNumber({
              additionalRules: [required()],
            }),
            addToDepartmentPlan: formValidators.boolean({
              additionalRules: [],
            }),
            notesId: formValidators.stringOrNumber({ additionalRules: [] }),
          } satisfies GetParentFormValidation<IEditIssueValues>
        }
        onSubmit={actions.editIssue}
      >
        {({ hasError, saveState, onResetForm, values, fieldNames }) => {
          return (
            <Drawer
              id={EDIT_ISSUE_DRAWER_ID}
              type='edit'
              showEmbeddedDrawer={
                data.drawerIsRenderedInMeeting && data.drawerView === 'EMBEDDED'
              }
              headerText={
                getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                  EDIT_ISSUE_DRAWER_ID
                ]
              }
              footerText={t('Archive')}
              saveState={saveState}
              saveAndCloseDisabled={hasError || isDisabledDrawer}
              saveDisabledTooltip={disabledTooltip}
              drawerHasUnsavedChanges={
                hasError || saveState === 'unsaved' || saveState == 'saving'
              }
              onHandleCloseDrawerWithUnsavedChangesProtection={
                actions.onHandleCloseDrawerWithUnsavedChangesProtection
              }
              footerActionTextClicked={actions.archiveIssue}
              onResetForm={onResetForm}
              footerTextDisabled={true}
              footerTextDisabledTooltip={{
                msg: t('Coming soon'),
              }}
              closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
              customHeaderContent={({ drawerHeaderWidth }) => (
                <>
                  <CustomDrawerHeaderContent
                    drawerHeaderWidth={drawerHeaderWidth}
                    meetingId={data.meetingId}
                    context={{
                      notesId: issue.notesId,
                      ownerId: issue.ownerId,
                      ownerFullName: issue.ownerFullName,
                      type: 'Issue',
                      title: issue.title,
                    }}
                    renderContextTodoOptions={{ canCreateTodosInMeeting }}
                    renderDrawerViewMenuOptions={
                      data.drawerIsRenderedInMeeting
                        ? {
                            drawerView: data.drawerView,
                            onHandleChangeDrawerViewSetting:
                              actions.onHandleChangeDrawerViewSetting,
                          }
                        : undefined
                    }
                    customContentForMenuItem={
                      !issue.addToDepartmentPlan
                        ? (close) => {
                            return (
                              <Menu.Item
                                disabled={isDisabledDrawer}
                                tooltip={
                                  disabledTooltip
                                    ? {
                                        ...disabledTooltip,
                                        position: 'top left',
                                      }
                                    : undefined
                                }
                                onClick={(e) => {
                                  openOverlazy(
                                    'MoveIssueToAnotherMeetingModal',
                                    {
                                      issueId: issue.id,
                                      currentMeetingId: issue.meetingId,
                                    }
                                  )
                                  close(e)
                                }}
                                css={css`
                                  padding: ${theme.sizes.spacing8}
                                    ${theme.sizes.spacing16};
                                `}
                              >
                                <div
                                  css={css`
                                    display: flex;
                                    justify-content: flex-start;
                                    white-space: nowrap;
                                  `}
                                >
                                  <Icon
                                    iconName={'forwardIcon'}
                                    iconSize={'lg'}
                                    css={css`
                                      margin-right: ${theme.sizes.spacing8};
                                    `}
                                  />
                                  <Text type={'body'}>
                                    {t('Move to another meeting')}
                                  </Text>
                                </div>
                              </Menu.Item>
                            )
                          }
                        : undefined
                    }
                    customContentForButtons={() => {
                      if (issue.addToDepartmentPlan) {
                        return <></>
                      }

                      return (
                        <BtnIcon
                          intent='tertiaryTransparent'
                          size='lg'
                          iconProps={{
                            iconName: 'forwardIcon',
                          }}
                          disabled={isDisabledDrawer}
                          tooltip={
                            disabledTooltip
                              ? { ...disabledTooltip, position: 'top left' }
                              : undefined
                          }
                          onClick={() =>
                            openOverlazy('MoveIssueToAnotherMeetingModal', {
                              issueId: issue.id,
                              currentMeetingId: issue.meetingId,
                            })
                          }
                          ariaLabel={t('share to')}
                          tag={'span'}
                          css={css`
                            padding: 0;
                            margin: 0;
                          `}
                        />
                      )
                    }}
                  />
                </>
              )}
              customSubHeaderContent={
                issue.context && issue.context.fromNodeTitle != null
                  ? ({ isExpanded }) => (
                      <>
                        {issue.context && (
                          <ContextAwareBanner
                            fromNodeTitle={issue.context.fromNodeTitle}
                            fromNodeType={issue.context.fromNodeType}
                            customXPadding={
                              data.drawerIsRenderedInMeeting &&
                              data.drawerView === 'EMBEDDED' &&
                              !isExpanded
                                ? theme.sizes.spacing16
                                : undefined
                            }
                          />
                        )}
                      </>
                    )
                  : undefined
              }
            >
              {() => {
                if (!values) {
                  return <Loading size='small' />
                }
                return (
                  <GridContainer columns={12} withoutMargin={true}>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: 0;
                      `}
                    >
                      <GridItem
                        s={12}
                        m={6}
                        withoutXPadding={true}
                        css={css`
                          display: flex;
                          justify-content: space-between;
                          width: 100%;
                          flex-flow: wrap;
                          gap: ${theme.sizes.spacing24};
                        `}
                      >
                        {issue.addToDepartmentPlan ? (
                          <BtnText
                            disabled={isDisabledDrawer}
                            tooltip={
                              isDisabledDrawer ? disabledTooltip : undefined
                            }
                            css={css`
                              height: 100%;
                              display: flex;
                              padding: ${(props) =>
                                `${props.theme.sizes.spacing10} ${props.theme.sizes.spacing16}`};
                            `}
                            ariaLabel={t('Move to short term')}
                            intent='secondary'
                            onClick={() =>
                              actions.onMoveIssueToShortTerm(issue.id)
                            }
                          >
                            {t('Move to short term')}
                          </BtnText>
                        ) : (
                          <>
                            <Timer startMinutes={'03'} />

                            <ActionButton
                              css={css`
                                height: 100%;
                                display: flex;
                                padding: ${(props) =>
                                  `${props.theme.sizes.spacing10} ${props.theme.sizes.spacing16}`};
                              `}
                              id={'completed'}
                              name={fieldNames.completed}
                              type='TOGGLE'
                              isLargeFont={true}
                              text={t('Solved')}
                              tooltip={
                                disabledTooltip
                                  ? {
                                      ...disabledTooltip,
                                      position: 'left center',
                                      offset: `${toREM(-40)}`,
                                    }
                                  : undefined
                              }
                            />
                          </>
                        )}
                      </GridItem>
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <TextInput
                        id={'title'}
                        name={fieldNames.title}
                        formControl={{
                          label: terms.issue.singular,
                          caption: issue.fromMergedIssues
                            ? t(
                                `Merged: ${getDateDisplayUserLocale({
                                  secondsSinceEpochUTC: issue.dateCreated,
                                  userTimezone,
                                })}`
                              )
                            : t(
                                `Date Created: ${getDateDisplayUserLocale({
                                  secondsSinceEpochUTC: issue.dateCreated,
                                  userTimezone,
                                })}`
                              ),
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
                      <SelectInputCategoriesSingleSelection
                        id={'ownerId'}
                        name={fieldNames.ownerId}
                        options={data.getMeetingAttendeesAndOrgUsersLookup()}
                        unknownItemText={t('Unknown owner')}
                        placeholder={t('Type or choose owner')}
                        formControl={{
                          label: t('Owner'),
                        }}
                        width={'100%'}
                        renderListOption={renderListOption}
                        renderSelectedOption={renderSelectedOptionSmallAvatar}
                        shouldOptionBeIncludedInFilteredOptions={
                          shouldOptionBeIncludedInFilteredOptions
                        }
                        disableOptionOnSelect={false}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-bottom: 0;
                      `}
                    >
                      <SelectInputSingleSelection
                        id={'meetingId'}
                        name={fieldNames.meetingId}
                        options={data.meetingLookup}
                        placeholder={t('Attach to meeting')}
                        unknownItemText={t('Unknown meeting')}
                        formControl={{
                          label: t('Attach to meeting'),
                        }}
                        width={'100%'}
                        disabled={true}
                        tooltip={{
                          msg: t(
                            'Select send to meeting in the {{issue}} list to send this {{issue}} to another meeting',
                            {
                              issue: terms.issue.lowercaseSingular,
                            }
                          ),
                          position: 'top center',
                        }}
                        disableOptionOnSelect={false}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: 0;
                      `}
                    >
                      <CheckBoxInput
                        css={css`
                          padding-top: ${(props) => props.theme.sizes.spacing4};
                        `}
                        id='addToDepartmentPlan'
                        name={fieldNames.addToDepartmentPlan}
                        text={terms.longTermIssue.singular}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-bottom: 0;
                      `}
                    >
                      <NotesBox
                        id={'notesId'}
                        name={fieldNames.notesId}
                        formControl={{
                          label: t('Details'),
                        }}
                        disabled={!canEditIssuesInMeeting.allowed}
                        text={data.issueNotesText}
                        tooltip={
                          !canEditIssuesInMeeting.allowed
                            ? {
                                msg: canEditIssuesInMeeting.message,
                                position: 'top center',
                              }
                            : undefined
                        }
                        width={'100%'}
                        createNotes={actions.createNotes}
                      />
                    </GridItem>
                  </GridContainer>
                )
              }}
            </Drawer>
          )
        }}
      </EditForm>
    </>
  )
})
