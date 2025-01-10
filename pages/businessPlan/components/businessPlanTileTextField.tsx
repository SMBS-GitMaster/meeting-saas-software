import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  Icon,
  Menu,
  TextInputAutoExpansion,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

interface IBusinessPlanTileTextFieldProps {
  fieldName: string
  text: Maybe<string>
  isPdfPreview: boolean
  getIsEditingDisabled: () => boolean
  textTitleForContextAware?: string
  onHandleFieldChange: (value: string) => void
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    textTitle?: string
  }) => void
}

export const BusinessPlanTileTextField = observer(
  (props: IBusinessPlanTileTextFieldProps) => {
    const theme = useTheme()
    const { t } = useTranslation()

    const {
      fieldName,
      text,
      isPdfPreview,
      getIsEditingDisabled,
      textTitleForContextAware,
      onHandleFieldChange,
      onHandleCreateContextAwareIssueFromBusinessPlan,
    } = props

    return (
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: ${theme.sizes.spacing4} 0;
          min-height: ${toREM(32)};

          ${isPdfPreview &&
          css`
            padding: 0;
            min-height: ${toREM(24)};
          `}

          .business-plan-list-hover-options {
            visibility: hidden;
          }

          &:hover,
          &:focus,
          &:focus-within {
            background-color: ${theme.colors
              .businessPlanTileItemBackgroundColorHover};

            ${!getIsEditingDisabled() &&
            css`
              .business-plan-list-hover-options {
                visibility: visible;
              }
            `}
          }
        `}
      >
        <div
          css={css`
            display: inline-flex;
            align-items: flex-start;
            justify-content: flex-start;
            flex-grow: 1;
            max-width: calc(100% - ${toREM(24)});
            padding-left: ${theme.sizes.spacing24};
          `}
        >
          <TextInputAutoExpansion
            name={fieldName}
            id={'businessPlanListItem-text'}
            width={'100%'}
            placeholder={t('Type details here')}
            textStyles={{ type: 'body' }}
          />
        </div>

        {!getIsEditingDisabled() && (
          <div className={'business-plan-list-hover-options'}>
            <Menu
              minWidthRems={1}
              position='right center'
              content={(close) => (
                <>
                  <Menu.Item
                    css={css`
                      padding: 0;
                      width: ${toREM(40)};
                    `}
                    onClick={(e) => {
                      onHandleCreateContextAwareIssueFromBusinessPlan({
                        text: text || '',
                        textTitle: textTitleForContextAware,
                      })
                      close(e)
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                      `}
                    >
                      <Icon
                        iconName={'contextAwareIssueIcon'}
                        iconSize={'lg'}
                      />
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    css={css`
                      padding: 0;
                      width: ${toREM(40)};
                    `}
                    disabled={text === ''}
                    onClick={(e) => {
                      close(e)
                      onHandleFieldChange('')
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                      `}
                    >
                      <Icon iconName={'trashIcon'} iconSize={'lg'} />
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
                ariaLabel={t('more options')}
                tag={'span'}
              />
            </Menu>
          </div>
        )}
      </div>
    )
  }
)
