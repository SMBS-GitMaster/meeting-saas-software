import { observer } from 'mobx-react'
import React, { useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'
import { useWindow } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  Card,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { addHttps, isValidUrl } from '@mm/core-web/utils'

import { ExternalPageBrokenLink } from './externalPageBrokenLink'
import { ExternalPageSectionIframe } from './externalPageSectionIframe'
import { IExternalPageLinkViewProps } from './externalPageSectionTypes'
import { InlineTextInput } from './inlineTextInput'

export const ExternalPageSectionView = observer(
  function ExternalPageSectionView(props: IExternalPageLinkViewProps) {
    const [showForm, setShowForm] = useState(!props.data.page.externalPageUrl)
    const [pageIsEmbeddable, setPageIsEmbeddable] = useState(true)
    const [isUrlValid, setIsUrlValid] = useState(true)

    const { t } = useTranslation()
    const theme = useTheme()
    const window = useWindow()

    const { canEditExternalLinkInMeeting } = props.data.currentUserPermissions

    const inputErrorMessage = React.useMemo(() => {
      if (!isUrlValid) {
        return t('Please add a valid link')
      } else {
        return undefined
      }
    }, [isUrlValid, t])

    const renderBodyContent = useMemo(() => {
      if (!isUrlValid) {
        return (
          <EmbedPageContainer>
            <ExternalPageBrokenLink alt={t(`You've entered an invalid link.`)}>
              <div>{t(`You've entered an invalid link.`)}</div>
              <div>{t('Try again!')}</div>
            </ExternalPageBrokenLink>
          </EmbedPageContainer>
        )
      } else if (!props.data.page.externalPageUrl) {
        return null
      } else {
        return (
          <EmbedPageContainer>
            <ExternalPageSectionIframe url={props.data.page.externalPageUrl} />
          </EmbedPageContainer>
        )
      }
    }, [props.data.page.externalPageUrl, isUrlValid, t])

    const handleRemoveUrl = async () => {
      await props.actions.onUpdateExternalLink({
        id: props.data.page.id,
        url: null,
      })
      setShowForm(true)
      setPageIsEmbeddable(true)
    }

    const handleSubmitNewUrl = async (newUrl: Maybe<string>) => {
      if (newUrl !== props.data.page.externalPageUrl) {
        const formattedUrl = addHttps(newUrl)
        const isNewUrlValid = isValidUrl(formattedUrl)

        if (!isNewUrlValid) {
          setIsUrlValid(false)
          setPageIsEmbeddable(true)
        } else {
          setIsUrlValid(true)
          const isEmbeddablePage =
            await props.actions.onCheckIfUrlIsEmbeddable(formattedUrl)

          if (isEmbeddablePage) {
            setPageIsEmbeddable(true)
            setShowForm(false)
          } else {
            setPageIsEmbeddable(false)
            setShowForm(true)
          }

          await props.actions.onUpdateExternalLink({
            id: props.data.page.id,
            url: formattedUrl,
          })
        }
      }
    }

    useEffect(() => {
      if (props.data.page.externalPageUrl) {
        const formattedUrl = addHttps(props.data.page.externalPageUrl)
        const isCurrentUrlValid = isValidUrl(formattedUrl)

        const fetchIfEmbeddable = async (currentUrl: string) => {
          const response =
            await props.actions.onCheckIfUrlIsEmbeddable(currentUrl)
          return response
        }

        if (!isCurrentUrlValid) {
          setIsUrlValid(false)
          setPageIsEmbeddable(true)
        } else {
          fetchIfEmbeddable(formattedUrl)
            .then((isEmbeddablePage) => {
              if (isEmbeddablePage) {
                setPageIsEmbeddable(true)
                setShowForm(false)
              } else {
                setPageIsEmbeddable(false)
                setShowForm(true)
              }
            })
            .catch(() => {
              setPageIsEmbeddable(false)
              setShowForm(true)
            })
        }
      } else if (props.data.page.externalPageUrl === '') {
        setPageIsEmbeddable(true)
      }
    }, [props.data.page.externalPageUrl]) // eslint-disable-line

    return (
      <CreateForm
        isLoading={props.data.isLoading}
        values={{
          url: props.data.page.externalPageUrl,
        }}
        disabled={!canEditExternalLinkInMeeting.allowed}
        disabledTooltip={
          !canEditExternalLinkInMeeting.allowed
            ? {
                msg: canEditExternalLinkInMeeting.message,
                position: 'top center',
              }
            : undefined
        }
        validation={
          {
            url: formValidators.string({
              additionalRules: [],
            }),
          } satisfies GetParentFormValidation<{ url: Maybe<string> }>
        }
        onSubmit={async (values) => {
          await handleSubmitNewUrl(values.url)
        }}
      >
        {({ values, fieldNames, onSubmit }) => {
          const isEmptyInput = values?.url === '' || values?.url == null

          return (
            <Card>
              <Card.Header
                renderLeft={
                  <div
                    css={`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <BtnIcon
                      css={`
                        padding: 0;
                      `}
                      iconProps={{
                        iconName: showForm
                          ? 'chevronDownIcon'
                          : 'chevronRightIcon',
                      }}
                      size='lg'
                      intent='tertiaryTransparent'
                      ariaLabel={t('Show/Hide Form')}
                      tag='button'
                      onClick={() => setShowForm(!showForm)}
                    />
                    <Card.Title>{props.data.page.pageName}</Card.Title>
                  </div>
                }
                renderRight={
                  <Menu
                    position='bottom right'
                    content={(close) => (
                      <Menu.Item
                        disabled={!canEditExternalLinkInMeeting.allowed}
                        tooltip={
                          !canEditExternalLinkInMeeting.allowed
                            ? {
                                msg: canEditExternalLinkInMeeting.message,
                                position: 'left center',
                              }
                            : undefined
                        }
                        onClick={async (e) => {
                          await handleRemoveUrl()
                          close(e)
                        }}
                      >
                        <Text type={'body'}>{t('Remove link')}</Text>
                      </Menu.Item>
                    )}
                  >
                    <BtnIcon
                      intent='tertiaryTransparent'
                      iconProps={{
                        iconName: 'moreVerticalIcon',
                        iconSize: 'lg',
                      }}
                      ariaLabel={t('More options')}
                      tag={'button'}
                    />
                  </Menu>
                }
              />
              <Card.Body>
                <ExternalPageFormContainer show={showForm}>
                  {!pageIsEmbeddable && (
                    <div
                      css={css`
                        display: inline-flex;
                        align-items: center;
                        padding: ${theme.sizes.spacing8} 0;
                      `}
                    >
                      <Icon
                        iconSize={'md'}
                        iconName={'infoCircleSolid'}
                        css={css`
                          margin-right: ${theme.sizes.spacing8};
                        `}
                      />
                      <TextEllipsis
                        type={'body'}
                        lineLimit={1}
                        weight={'normal'}
                        wordBreak={true}
                        color={{ color: theme.colors.captionTextColor }}
                      >
                        {t(`It's likely that this link cannot be embedded`)}
                      </TextEllipsis>
                    </div>
                  )}
                  <div
                    css={css`
                      display: flex;
                      gap: ${({ theme }) => theme.sizes.spacing16};
                      width: 100%;
                      align-items: flex-end;
                    `}
                  >
                    <InlineTextInput
                      id={'url'}
                      name={fieldNames.url}
                      leftIconProps={{
                        iconName: 'hyperlinkIcon',
                        iconSize: 'lg',
                        iconColor: {
                          color: theme.colors.externalPageInputIconColor,
                        },
                      }}
                      error={inputErrorMessage}
                      width='100%'
                      formControl={{
                        label: '',
                      }}
                      placeholder={t('Add the web page link here')}
                      onEnter={onSubmit}
                    />
                    <BtnText
                      css={css`
                        margin-bottom: ${toREM(7)};
                        width: ${toREM(65)};
                      `}
                      intent='primary'
                      width='fitted'
                      ariaLabel={t('Save external page link')}
                      disabled={
                        isEmptyInput || !canEditExternalLinkInMeeting.allowed
                      }
                      tooltip={
                        !canEditExternalLinkInMeeting.allowed
                          ? {
                              msg: canEditExternalLinkInMeeting.message,
                              position: 'top left',
                            }
                          : isEmptyInput
                          ? {
                              msg: t(`Please enter a valid link`),
                            }
                          : undefined
                      }
                      onClick={() => onSubmit()}
                    >
                      {t('Save')}
                    </BtnText>
                  </div>

                  {props.data.page.externalPageUrl && isUrlValid && (
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                      `}
                    >
                      <BtnText
                        onClick={() => {
                          if (props.data.page.externalPageUrl) {
                            window.open(
                              props.data.page.externalPageUrl,
                              '_blank'
                            )
                          }
                        }}
                        ariaLabel={t(`Open link in new window`)}
                        width={'fitted'}
                        intent={'tertiaryTransparent'}
                      >
                        {t(`Open link in new window`)}
                      </BtnText>
                    </div>
                  )}
                </ExternalPageFormContainer>
                {renderBodyContent}
              </Card.Body>
            </Card>
          )
        }}
      </CreateForm>
    )
  }
)

export const ExternalPageFormContainer = styled.div<{
  show: boolean
}>`
  background-color: ${({ theme }) => theme.colors.externalPageFormBg};
  padding: ${({ theme }) => `${theme.sizes.spacing8} ${theme.sizes.spacing16}`};

  ${({ show }) =>
    !show &&
    css`
      display: none;
    `}
`

export const EmbedPageContainer = styled.div<{ height?: string }>`
  height: ${(props) => (props.height ? props.height : toREM(640))};
`
