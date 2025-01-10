import React from 'react'
import styled, { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Card, Text, toREM } from '@mm/core-web/ui'

import { InlineTextInput } from '../externalPage/inlineTextInput'
import { ITitlePageSectionViewProps } from './titlePageSectionTypes'

export const TitlePageSectionView = (props: ITitlePageSectionViewProps) => {
  const { t } = useTranslation()

  return (
    <Card>
      <Card.Header
        renderLeft={
          <Card.Title>
            <Text type='h3'>{props.data.pageName}</Text>
          </Card.Title>
        }
      />
      {props.data.isMeetingOngoing ? (
        <Card.Body
          css={css`
            padding: ${(props) => `${props.theme.sizes.spacing40} 0`};
            text-align: center;
          `}
        >
          {props.data.subheading && (
            <Text
              type='h3'
              css={css`
                margin-bottom: ${(props) => props.theme.sizes.spacing32};
                color: ${(props) => props.theme.colors.titlePageSectionTitle};
              `}
            >
              {props.data.pageName}
            </Text>
          )}
          <StyledBlueSection>
            <Text type={props.data.subheading ? 'body' : 'h3'}>
              {props.data.subheading || props.data.pageName}
            </Text>
          </StyledBlueSection>
        </Card.Body>
      ) : (
        <Card.Body
          css={css`
            padding: ${(props) =>
              `${props.theme.sizes.spacing8} ${props.theme.sizes.spacing16}`};
            text-align: center;
            background-color: ${(props) =>
              props.theme.colors.titlePageSectionFormBackground};
          `}
        >
          <CreateForm
            isLoading={props.data.isLoading}
            values={{
              subheading: props.data.subheading || '',
            }}
            validation={
              {
                subheading: formValidators.string({
                  additionalRules: [],
                }),
              } satisfies GetParentFormValidation<{ subheading: string }>
            }
            onSubmit={async (values) => {
              await props.actionHandlers.onSubmit(values.subheading || null)
            }}
          >
            {({ onSubmit, values }) => {
              return (
                <StyledFormSection>
                  <InlineTextInput
                    id={'subheading'}
                    name={'subheading'}
                    width='100%'
                    formControl={{
                      label: '',
                    }}
                    height={toREM(40)}
                    placeholder={t('Add the subheading here.')}
                    onEnter={onSubmit}
                  />
                  <StyledBtnWrapper>
                    <BtnText
                      css={css`
                        width: ${toREM(65)};
                      `}
                      intent='primary'
                      width='fitted'
                      ariaLabel={t('Save subheading page')}
                      onClick={() => onSubmit()}
                      disabled={!values?.subheading}
                    >
                      {t('Save')}
                    </BtnText>
                  </StyledBtnWrapper>
                </StyledFormSection>
              )
            }}
          </CreateForm>
        </Card.Body>
      )}
    </Card>
  )
}

const StyledFormSection = styled.div`
  display: flex;
  width: 100%;
  text-align: left;

  .contentEditable {
    padding: ${(props) =>
      `${props.theme.sizes.spacing10} ${props.theme.sizes.spacing8} ${props.theme.sizes.spacing10} ${props.theme.sizes.spacing16}`} !important;
    min-height: unset;
  }
`
const StyledBtnWrapper = styled.div`
  margin-left: ${(props) => props.theme.sizes.spacing16};
`
const StyledBlueSection = styled.div`
  max-width: ${toREM(672)};
  width: 100%;
  padding: ${(props) =>
    `${props.theme.sizes.spacing32} ${props.theme.sizes.spacing40}`};
  margin: auto;
  background-color: ${(props) =>
    props.theme.colors.checkInSectionQuestionBackgroundColor};
`
