import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'
import { keys } from '@mm/core/typeHelpers'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  CheckBoxInput,
  Clickable,
  Expandable,
  Icon,
  Text,
  WEIGHT_TEXT_TO_CSS,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import {
  getSectionToFeaturesMap,
  getSectionToLabelMap,
} from './bloomNewFeaturesModalConstants'
import {
  TBloomNewFeatureModalFeature,
  TBloomNewFeatureModalNavSection,
} from './bloomNewFeaturesModalTypes'

interface IBloomNewFeaturesModalNavProps {
  expandedSection: Maybe<TBloomNewFeatureModalNavSection>
  selectedFeature: TBloomNewFeatureModalFeature
  isAutoOpened?: boolean
  sectionClicked: (section: Maybe<TBloomNewFeatureModalNavSection>) => void
  featureClicked: (feature: TBloomNewFeatureModalFeature) => void
}

export const BloomNewFeaturesModalNav = observer(
  function BloomNewFeaturesModalNav(props: IBloomNewFeaturesModalNavProps) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const terms = useBloomCustomTerms()
    const SECTION_TO_LABEL_MAP = getSectionToLabelMap(terms)
    const SECTION_TO_FEATURES_MAP = getSectionToFeaturesMap(terms)

    return (
      <NavRoot>
        <div
          css={css`
            min-width: ${toREM(180)};
          `}
        >
          <NavHeader>
            <NavContent>
              <div
                css={css`
                  align-items: center;
                  display: flex;
                  min-width: ${toREM(180)};
                `}
              >
                <Icon
                  iconName='whiteStars'
                  iconSize='md2'
                  css={css`
                    filter: initial;
                    margin-right: ${toREM(4)};
                  `}
                />
                <Text
                  color={{ color: colors.bloomNewFeaturesModalNavText }}
                  type='h4'
                >
                  {t('EXPLORE')}
                </Text>
              </div>
              <Text
                color={{ color: colors.bloomNewFeaturesModalNavText }}
                type='h4'
                css={css`
                  margin-top: ${toREM(4)};
                `}
              >
                {t('New meeting experience')}
              </Text>
            </NavContent>
          </NavHeader>
          <NavBody>
            <div>
              {keys(SECTION_TO_LABEL_MAP).map((section) => {
                const featureMaps = SECTION_TO_FEATURES_MAP[section]
                const isExpanded = props.expandedSection === section

                return (
                  <Expandable
                    key={section}
                    title={SECTION_TO_LABEL_MAP[section]}
                    isExpanded={isExpanded}
                    fontColor={colors.bloomNewFeaturesModalNavText}
                    clicked={() => {
                      props.expandedSection === section
                        ? props.sectionClicked(null)
                        : props.sectionClicked(
                            section as TBloomNewFeatureModalNavSection
                          )
                    }}
                    css={css`
                      button {
                        color: ${({ theme }) =>
                          theme.colors.bloomNewFeaturesModalNavSectionText};
                      }
                    `}
                    buttonCss={css`
                      justify-content: space-between;
                      padding-left: ${toREM(16)};
                      padding-right: ${toREM(22)};
                      padding-top: ${toREM(8)};
                      width: 100%;

                      img {
                        filter: invert(1);
                      }

                      ${!isExpanded &&
                      css`
                        padding-bottom: ${toREM(12)};
                      `}
                    `}
                  >
                    <div
                      css={css`
                        display: flex;
                        flex-direction: column;
                        padding-bottom: ${toREM(8)};
                        padding-top: ${toREM(8)};
                      `}
                    >
                      {featureMaps.map((feature) => {
                        const isSelected =
                          props.selectedFeature === feature.value

                        return (
                          <Clickable
                            key={feature.value}
                            clicked={() => {
                              props.featureClicked(feature.value)
                            }}
                            css={css`
                              padding-bottom: ${toREM(4)};
                              padding-top: ${toREM(4)};
                              text-align: left;

                              ${isSelected &&
                              css`
                                background-color: ${({ theme }) =>
                                  theme.colors
                                    .bloomNewFeaturesModalNavSelected};
                              `}

                              ${!isSelected &&
                              css`
                                &:hover,
                                &:focus {
                                  background-color: ${({ theme }) =>
                                    theme.colors.bloomNewFeaturesModalNavHover};

                                  span {
                                    font-weight: ${WEIGHT_TEXT_TO_CSS.semibold};
                                  }
                                }
                              `}
                            `}
                          >
                            <Text
                              type='body'
                              weight={isSelected ? 'semibold' : 'normal'}
                              css={css`
                                color: ${isSelected
                                  ? colors.bodyTextDefault
                                  : colors.bloomNewFeaturesModalNavText};
                                margin-left: ${toREM(16)};
                              `}
                            >
                              {feature.text}
                            </Text>
                          </Clickable>
                        )
                      })}
                    </div>
                  </Expandable>
                )
              })}
            </div>
          </NavBody>
        </div>
        {props.isAutoOpened && (
          <CreateForm
            isLoading={false}
            values={{
              doNotShowAgain: false,
            }}
            validation={
              {
                doNotShowAgain: formValidators.boolean({ additionalRules: [] }),
              } satisfies GetParentFormValidation<{
                doNotShowAgain: boolean
              }>
            }
            onSubmit={async () => {
              // This modal is automatically shown ONLY twice and this checkbox appears only the second time.
              // Thus, whatever the user selects, we won't be showing this modal again.
              // No logic is therefore needed here.
            }}
          >
            {({ fieldNames }) => {
              return (
                <CheckBoxInput
                  id='doNotShowAgain'
                  name={fieldNames.doNotShowAgain}
                  text={t(`Don't show me again`)}
                  iconSize='md2'
                  css={css`
                    margin-bottom: ${toREM(8)};
                    margin-left: ${toREM(12)};

                    img {
                      filter: brightness(0) invert(1);
                    }

                    span {
                      color: ${colors.bloomNewFeaturesModalNavText};
                    }
                  `}
                />
              )
            }}
          </CreateForm>
        )}
      </NavRoot>
    )
  }
)

const NavRoot = styled.div`
  background-color: ${({ theme }) =>
    theme.colors.bloomNewFeaturesModalNavBackground};
  border-radius: ${toREM(10)} 0 0 ${toREM(10)};
  display: flex;
  flex-direction: column;
  height: ${toREM(720)};
  justify-content: space-between;
  max-height: ${toREM(720)};
  overflow: auto;
  width: ${toREM(248)};
  min-width: ${toREM(216)};
`

const NavHeader = styled.div`
  border-bottom: ${({ theme }) =>
    `1px solid ${theme.colors.bloomNewFeaturesModalNavSeperator}`};
  color: ${({ theme }) => theme.colors.bloomNewFeaturesModalNavText};
  padding-bottom: ${toREM(16)};
`

const NavBody = styled.div`
  margin-top: ${toREM(10)};
`

const NavContent = styled.div`
  margin-left: ${toREM(16)};
  margin-top: ${toREM(16)};
`
