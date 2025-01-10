import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import { css } from 'styled-components'

import { useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
} from '@mm/core/forms'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomUserMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  CheckBoxInput,
  Modal,
  Text,
  TextInput,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { EmojiInput } from '@mm/core-web/ui/components/inputs/emojis'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

type FeedbackModalValues = {
  positiveFeedback: string
  negativeFeedback: string
  opinionEmoji: string
  contactConsent: boolean
  shareFeedbackConsent: boolean
}

type FeedbackModalProps = {
  meetingId?: string | number
}

export const FeedbackModal: React.FC<FeedbackModalProps> = observer(
  function FeedbackModal({ meetingId }) {
    const { t } = useTranslation()
    const theme = useTheme()
    const { closeOverlazy, openOverlazy } = useOverlazyController()

    const { editAuthenticatedUserSettings } = useBloomUserMutations()

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ settings, orgSettings }) => ({
            settings: settings({
              map: ({
                hasViewedFeedbackModalOnce,
                doNotShowFeedbackModalAgain,
              }) => ({
                hasViewedFeedbackModalOnce,
                doNotShowFeedbackModalAgain,
              }),
            }),
            orgSettings: orgSettings({
              map: ({ id }) => ({ id }),
            }),
          }),
        }),
      },
      { subscriptionId: 'FeedbackModal' }
    )

    const handleSubmitFeedback = useCallback(
      async (
        values: Partial<{
          positiveFeedback: string
          negativeFeedback: string
          opinionEmoji: string
          contactConsent: boolean
        }>
      ) => {
        try {
          await fetch(
            'https://webhooks.fivetran.com/webhooks/c073e589-5e17-420a-815a-de87ab8e242a',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                rating: values.opinionEmoji,
                what_right: values.positiveFeedback,
                work_on: values.negativeFeedback,
                user_id: subscription().data.currentUser.id,
                org_id: subscription().data.currentUser.orgSettings.id,
                meeting_id: meetingId ? meetingId : '',
                contact_consent: values.contactConsent,
              }),
            }
          )
          closeOverlazy({
            type: 'Modal',
            name: 'FeedbackModal',
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error submitting this feedback`),
            error: new UserActionError(e),
          })
        }
      },
      [t, openOverlazy, closeOverlazy]
    )

    const doNotShowAgainSelected = useCallback(() => {
      editAuthenticatedUserSettings({
        doNotShowFeedbackModalAgain:
          !subscription().data.currentUser.settings.doNotShowFeedbackModalAgain,
      })
    }, [
      editAuthenticatedUserSettings,
      subscription().data.currentUser.settings.doNotShowFeedbackModalAgain,
    ])

    return (
      <>
        <Modal
          id={'FeedbackModal'}
          onHide={() => closeOverlazy({ type: 'Modal', name: 'FeedbackModal' })}
          isPositionedLowerRight={true}
        >
          <CreateForm
            values={
              {
                positiveFeedback: '',
                negativeFeedback: '',
                opinionEmoji: '',
                contactConsent: false,
                shareFeedbackConsent: true,
              } as FeedbackModalValues
            }
            validation={
              {
                positiveFeedback: formValidators.string({
                  additionalRules: [
                    maxLength({
                      maxLength: 200,
                      customErrorMsg: t(
                        `Can't exceed {{maxLength}} characters`,
                        {
                          maxLength: 200,
                        }
                      ),
                    }),
                  ],
                }),
                negativeFeedback: formValidators.string({
                  additionalRules: [
                    maxLength({
                      maxLength: 200,
                      customErrorMsg: t(
                        `Can't exceed {{maxLength}} characters`,
                        {
                          maxLength: 200,
                        }
                      ),
                    }),
                  ],
                }),
                opinionEmoji: formValidators.string({
                  additionalRules: [],
                }),
                contactConsent: formValidators.boolean({
                  additionalRules: [],
                }),
                shareFeedbackConsent: formValidators.boolean({
                  additionalRules: [],
                }),
              } satisfies GetParentFormValidation<FeedbackModalValues>
            }
            onSubmit={handleSubmitFeedback}
            isLoading={false}
          >
            {({ fieldNames, hasError, onSubmit, values }) => (
              <>
                <Modal.Header
                  css={css`
                    background-color: ${(props) =>
                      props.theme.colors.feedbackModalBackgroundColor};
                    border-top-right-radius: ${toREM(4)};
                    border-top-left-radius: ${toREM(4)};
                  `}
                  buttonType={'secondaryTransparent'}
                  isPositionedLowerRight={true}
                ></Modal.Header>
                <Modal.Body
                  css={css`
                    background-color: ${(props) =>
                      props.theme.colors.feedbackModalBackgroundColor};
                  `}
                >
                  <div>
                    <Text
                      type='large'
                      weight='semibold'
                      color={{ color: theme.colors.feedbackModalTextColor }}
                      css={css`
                        padding-top: ${theme.sizes.spacing24};
                        line-height: 1;
                      `}
                    >
                      {t('Our product team would love your feedback!')}
                    </Text>
                    <div
                      css={css`
                        padding-top: ${theme.sizes.spacing16};
                      `}
                    >
                      <Text
                        type='h2'
                        weight='normal'
                        color={{ color: theme.colors.feedbackModalTextColor }}
                      >
                        {t(`Overall, how do you feel about the new`)}&nbsp;
                      </Text>
                      <Text
                        type='h2'
                        color={{ color: theme.colors.feedbackModalTextColor }}
                      >
                        {t(`meeting`)}&nbsp;
                      </Text>
                      <Text
                        type='h2'
                        weight='normal'
                        color={{ color: theme.colors.feedbackModalTextColor }}
                      >
                        {t(`experience?`)}
                      </Text>
                    </div>
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding-top: ${theme.sizes.spacing32};
                      `}
                    >
                      <EmojiInput
                        name={fieldNames.opinionEmoji}
                        id={'opinionEmoji'}
                      />
                    </div>
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding-top: ${theme.sizes.spacing4};
                      `}
                    >
                      <Text
                        type='small'
                        fontStyle='italic'
                        color={{ color: theme.colors.feedbackModalTextColor }}
                      >
                        {t(`Select an emoji that reflects your opinion.`)}
                      </Text>
                    </div>

                    <Text
                      css={css`
                        padding-top: ${theme.sizes.spacing24};
                      `}
                      color={{ color: theme.colors.feedbackModalTextColor }}
                      type='body'
                    >
                      {t('What did we get')}&nbsp;
                    </Text>
                    <Text
                      type='body'
                      weight='semibold'
                      color={{ color: theme.colors.feedbackModalTextColor }}
                    >
                      {t(`right`)}
                    </Text>
                    <Text
                      type='body'
                      color={{ color: theme.colors.feedbackModalTextColor }}
                    >
                      {'?'}
                    </Text>
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding-top: ${toREM(11)};
                      `}
                    >
                      <TextInput
                        name={fieldNames.positiveFeedback}
                        id={'positiveFeedback'}
                        placeholder={t('Let us know your thoughts...')}
                        width={'100%'}
                        height={`${toREM(118)}`}
                      />
                    </div>
                    <Text
                      css={css`
                        padding-top: ${theme.sizes.spacing24};
                      `}
                      color={{ color: theme.colors.feedbackModalTextColor }}
                      type='body'
                    >
                      {t('What do we')}&nbsp;
                    </Text>
                    <Text
                      type='body'
                      weight='semibold'
                      color={{ color: theme.colors.feedbackModalTextColor }}
                    >
                      {t(`need to work on`)}
                    </Text>
                    <Text
                      type='body'
                      color={{ color: theme.colors.feedbackModalTextColor }}
                    >
                      {'?'}
                    </Text>

                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding-top: ${toREM(11)};
                      `}
                    >
                      <TextInput
                        name={fieldNames.negativeFeedback}
                        id={'negativeFeedback'}
                        placeholder={t('Let us know your thoughts...')}
                        width={'100%'}
                        height={`${toREM(118)}`}
                      />
                    </div>
                    <div
                      css={css`
                        padding-top: ${theme.sizes.spacing24};
                      `}
                    >
                      <CheckBoxInput
                        css={css`
                          color: ${(props) =>
                            props.theme.colors
                              .feedbackModalTextColor} !important;
                        `}
                        iconSize={'lg'}
                        checkboxIntention='white'
                        filterIcon={false}
                        value={values?.contactConsent}
                        id='contactConsent'
                        name={'contactConsent'}
                        text={
                          <>
                            <Text
                              type='body'
                              color={{
                                color:
                                  theme.colors.feedbackModalSecondaryTextColor,
                              }}
                              css={css`
                                padding-left: ${(props) =>
                                  props.theme.sizes.spacing8};
                              `}
                            >
                              {t('May we contact you to help us get')}&nbsp;
                            </Text>
                            <Text
                              type='body'
                              weight='semibold'
                              color={{
                                color:
                                  theme.colors.feedbackModalSecondaryTextColor,
                              }}
                            >
                              {t('even better')}
                            </Text>
                            <Text
                              type='body'
                              color={{
                                color:
                                  theme.colors.feedbackModalSecondaryTextColor,
                              }}
                            >
                              {'?'}
                            </Text>
                          </>
                        }
                      />
                    </div>
                    <div
                      css={css`
                        padding-top: ${theme.sizes.spacing8};
                      `}
                    >
                      <CheckBoxInput
                        css={css`
                          color: ${(props) =>
                            props.theme.colors
                              .feedbackModalTextColor} !important;
                        `}
                        id='shareFeedbackConsent'
                        name={'shareFeedbackConsent'}
                        iconSize={'lg'}
                        checkboxIntention='white'
                        filterIcon={false}
                        value={values?.shareFeedbackConsent}
                        text={
                          <>
                            <Text
                              type='body'
                              color={{
                                color:
                                  theme.colors.feedbackModalSecondaryTextColor,
                              }}
                              css={css`
                                padding-left: ${(props) =>
                                  props.theme.sizes.spacing8};
                              `}
                            >
                              {t('Share this feedback with our product team.')}
                            </Text>
                          </>
                        }
                      />
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer
                  css={css`
                    display: flex;
                    justify-content: space-between;
                    background-color: ${(props) =>
                      props.theme.colors.feedbackModalBackgroundColor};
                  `}
                >
                  <BtnText
                    intent='secondaryTransparent'
                    width='fitted'
                    ariaLabel={t('Skip')}
                    onClick={() => {
                      closeOverlazy({ type: 'Modal', name: 'FeedbackModal' })
                    }}
                  >
                    <Text
                      weight='semibold'
                      type='body'
                      color={{
                        color: theme.colors.feedbackModalSecondaryTextColor,
                      }}
                    >
                      {t('Skip')}
                    </Text>
                  </BtnText>
                  <BtnText
                    onClick={onSubmit}
                    intent='primary'
                    width='fitted'
                    ariaLabel={t('Submit')}
                    type='button'
                    disabled={hasError || !values?.shareFeedbackConsent}
                    tooltip={
                      hasError
                        ? {
                            msg: t('Please complete all required fields.'),
                            position: 'top left',
                            type: 'lighter',
                          }
                        : !values?.shareFeedbackConsent
                          ? {
                              msg: (
                                <Text
                                  type='body'
                                  color={{
                                    color: theme.colors.captionTextColor,
                                  }}
                                >
                                  {t(
                                    `Check "Share this feedback with our product team" to submit`
                                  )}
                                </Text>
                              ),
                              position: 'top left',
                              type: 'lighter',
                            }
                          : undefined
                    }
                  >
                    <Text weight='semibold' type='body'>
                      {t('Submit')}
                    </Text>
                  </BtnText>
                </Modal.Footer>
              </>
            )}
          </CreateForm>
          <div
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing32};
              padding-left: ${(props) => props.theme.sizes.spacing24};
              background-color: ${(props) =>
                props.theme.colors.feedbackModalBackgroundColor};
              border-bottom-right-radius: ${toREM(4)};
              border-bottom-left-radius: ${toREM(4)};
            `}
          >
            <CheckBoxInput
              onChange={doNotShowAgainSelected}
              css={css`
                color: ${(props) =>
                  props.theme.colors.feedbackModalTextColor} !important;
              `}
              iconSize={'lg'}
              checkboxIntention='white'
              filterIcon={false}
              value={
                subscription().data.currentUser.settings
                  .doNotShowFeedbackModalAgain
              }
              id='dontShowAgain'
              name={'dontShowAgain'}
              text={
                <Text
                  type='body'
                  color={{
                    color: theme.colors.feedbackModalSecondaryTextColor,
                  }}
                  css={css`
                    padding-left: ${(props) => props.theme.sizes.spacing8};
                  `}
                >
                  {t(`Don't show me again`)}
                </Text>
              }
            />
          </div>
        </Modal>
      </>
    )
  }
)

export default FeedbackModal
