import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  BtnText,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import {
  IBusinessPlanPdfPreviewViewActions,
  IBusinessPlanPdfPreviewViewData,
} from './businessPlanPdfPreviewTypes'

interface IBusinessPlanPdfOptionsProps {
  getData: () => Pick<
    IBusinessPlanPdfPreviewViewData,
    'businessPlan' | 'pdfPageState' | 'pageState'
  >
  getActions: () => Pick<
    IBusinessPlanPdfPreviewViewActions,
    | 'onHandleExitPDFPreview'
    | 'onHandleSetPdfPreviewPageLayout'
    | 'onHandleDownloadPDF'
    | 'onHandleResetPdfLayout'
  >
}

export const BusinessPlanPdfOptions = observer(
  ({ getData, getActions }: IBusinessPlanPdfOptionsProps) => {
    const theme = useTheme()
    const { t } = useTranslation()

    return (
      <>
        <div
          css={css`
            position: sticky;
            top: 0;
            height: ${toREM(433)};
            max-width: ${toREM(186)};
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            width: 100%;
            padding: ${theme.sizes.spacing14} ${theme.sizes.spacing16}
              ${theme.sizes.spacing32} ${theme.sizes.spacing16};
            margin-left: ${theme.sizes.spacing16};
            background-color: ${theme.colors.cardBackgroundColor};
            border-radius: ${theme.sizes.br2};
            box-shadow: ${theme.sizes.bs3};
          `}
        >
          <div
            css={css`
              display: inline-flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              margin-bottom: ${theme.sizes.spacing16};
            `}
          >
            <TextEllipsis lineLimit={1} weight={'semibold'}>
              {t('PDF options')}
            </TextEllipsis>
            <BtnIcon
              intent='naked'
              size='lg'
              iconProps={{
                iconName: 'closeIcon',
              }}
              onClick={getActions().onHandleExitPDFPreview}
              ariaLabel={t('Exit')}
              tag={'span'}
            />
          </div>

          <Menu
            position='bottom right'
            content={(close) => (
              <>
                <Menu.Item
                  onClick={(e) => {
                    close(e)
                    getActions().onHandleSetPdfPreviewPageLayout('LANDSCAPE')
                  }}
                >
                  <Text type={'body'}>{t('Landscape')}</Text>
                </Menu.Item>
                <Menu.Item
                  onClick={(e) => {
                    close(e)
                    getActions().onHandleSetPdfPreviewPageLayout('PORTRAIT')
                  }}
                >
                  <Text type={'body'}>{t('Portrait')}</Text>
                </Menu.Item>
              </>
            )}
          >
            {({ isOpen }) => (
              <div
                css={css`
                  display: inline-flex;
                  align-items: center;
                  border: ${theme.sizes.smallSolidBorder}
                    ${theme.colors.businessPlanPDFOptionsMenuOptionColor};
                  border-radius: ${theme.sizes.br1};
                  width: 100%;
                  padding: ${theme.sizes.spacing4};
                  margin-bottom: ${theme.sizes.spacing24};
                `}
              >
                <TextEllipsis
                  lineLimit={1}
                  weight='normal'
                  type='body'
                  color={{ color: theme.colors.bodyTextDefault }}
                  css={css`
                    width: 100%;
                  `}
                >
                  {getData().pdfPageState.pdfPreviewPageLayout === 'LANDSCAPE'
                    ? t('Landscape')
                    : t('Portrait')}
                </TextEllipsis>
                <Icon
                  data-html2canvas-ignore
                  iconSize={'lg'}
                  iconName={isOpen ? 'chevronUpIcon' : 'chevronDownIcon'}
                  css={css`
                    align-self: flex-end;
                  `}
                />
              </div>
            )}
          </Menu>
          <div
            css={css`
              display: flex;
              flex-direction: column;
            `}
          >
            <div
              css={css`
                display: inline-flex;
                align-items: center;
              `}
            >
              <Icon
                iconSize={'md'}
                iconName={'infoCircleSolid'}
                css={css`
                  margin-right: ${theme.sizes.spacing4};
                `}
              />
              <Text type='body'>{t('Customize your')}</Text>
            </div>
            <Text type='body'>
              {t(
                ' PDF view with drag-and-drop ease. Changes are saved for PDF view only, keeping your in-app view untouched.'
              )}
            </Text>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              justify-content: center;
            `}
          >
            <BtnText
              onClick={getActions().onHandleResetPdfLayout}
              intent={'tertiary'}
              ariaLabel={t('cancel')}
              css={css`
                padding: ${theme.sizes.spacing8} ${theme.sizes.spacing18};
                margin-bottom: ${theme.sizes.spacing16};
                text-decoration: underline;
              `}
            >
              {t('Reset PDF layout')}
            </BtnText>
            <BtnText
              intent='primary'
              ariaLabel={t('Generate PDF')}
              onClick={() => getActions().onHandleDownloadPDF()}
              css={css`
                padding-right: ${theme.sizes.spacing18};
                padding-left: ${theme.sizes.spacing18};
              `}
            >
              <div
                css={css`
                  display: inline-flex;
                  align-items: flex-end;
                `}
              >
                <Text type={'body'} weight={'semibold'}>
                  {t('Generate PDF')}
                </Text>
              </div>
            </BtnText>
          </div>
        </div>
      </>
    )
  }
)
