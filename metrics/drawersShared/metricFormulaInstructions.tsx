import React, { useState } from 'react'
import { css } from 'styled-components'

import { i18n } from '@mm/core/i18n'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  GridContainer,
  GridItem,
  Icon,
  Text,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

export const FormulaInstructions = (opts: { showEditFormulaText: boolean }) => {
  const [showInstructions, setShowInstructions] = useState(false)
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()
  const { showEditFormulaText } = opts

  const metricsFormulaOpertationsLookup = getMetricsFormulaOperationsLookup()

  const handleSetShowInstructions = () => {
    setShowInstructions((current) => !current)
  }

  return (
    <>
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: ${showEditFormulaText
            ? `space-between`
            : `flex-end`};
          margin-top: ${(props) => props.theme.sizes.spacing8};
          padding-bottom: ${showInstructions
            ? (props) => props.theme.sizes.spacing24
            : `0`};
        `}
      >
        {showEditFormulaText && (
          <Text
            type={'small'}
            color={{ color: theme.colors.captionTextColor }}
            css={css`
              width: ${toREM(311)};
            `}
          >
            {t(
              'Creating or updating a row formula will overwrite existing data for the entire row.'
            )}
          </Text>
        )}
        <BtnText
          onClick={handleSetShowInstructions}
          intent={'tertiaryTransparent'}
          width='noPadding'
          ariaLabel={t('show or hide help')}
        >
          <Text
            type={'body'}
            weight={'semibold'}
            color={{ color: theme.colors.buttonTertiaryTextDefault }}
          >
            {showInstructions ? t('Hide Help') : t('Show help')}
          </Text>
        </BtnText>
      </div>
      {showInstructions && (
        <div
          css={css`
            width: 100%;
            display: flex;
            justify-content: flex-start;
            flex-flow: column wrap;
            background-color: ${(props) =>
              props.theme.colors.formulaInstructionsBackgroundColor};
            padding: ${(props) => props.theme.sizes.spacing8}
              ${(props) => props.theme.sizes.spacing16};
            color: ${(props) =>
              props.theme.colors.formulaInstructionsTextColor};
          `}
        >
          <Text
            type={'body'}
            weight={'semibold'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            {t('A formula consists of {{metrics}} and operations.', {
              metrics: terms.metric.lowercasePlural,
            })}
          </Text>
          <Text
            type={'body'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            {t(
              'Start typing the {{metric}} name to insert it into the formula. You may perform operations on that {{metric}}.',
              {
                metric: terms.metric.lowercaseSingular,
              }
            )}
          </Text>
          <Text
            type={'body'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing16};
            `}
          >
            {t(
              'For example, to estimate annual revenue you might use the following formula:'
            )}
          </Text>
          <div
            css={css`
              display: flex;
              justify-content: center;
              align-items: center;
              padding-bottom: ${(props) => props.theme.sizes.spacing16};
            `}
          >
            <Text
              type={'body'}
              css={css`
                background-color: ${(props) =>
                  props.theme.colors.formulaExpressionBadgeColor};
                border-radius: ${(props) => props.theme.sizes.br1};
                padding: ${(props) => props.theme.sizes.spacing6}
                  ${(props) => props.theme.sizes.spacing8};
              `}
            >
              {t('Monthly Revenue')}
            </Text>
            <Text
              type={'body'}
              css={css`
                padding-left: ${(props) => props.theme.sizes.spacing8};
              `}
            >
              {t('*')}
            </Text>
            <Text
              type={'body'}
              css={css`
                padding-left: ${(props) => props.theme.sizes.spacing8};
              `}
            >
              {t('12')}
            </Text>
          </div>
          <Text
            type={'body'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            {t('Other operations are listed below.')}
          </Text>
          <Text
            type={'body'}
            weight={'semibold'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            {t(`You may perform calculations against previous weeks' data.`)}
          </Text>
          <span
            css={css`
              display: inline-block;
              padding-bottom: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            <Text type={'body'}>
              {t(
                `You may also adjust the {{metric}}'s offset by clicking the "`,
                {
                  metric: terms.metric.lowercaseSingular,
                }
              )}
            </Text>
            <Icon
              iconName='chevronDownIcon'
              iconSize='sm'
              iconColor={{ color: theme.colors.formulaInstructionsTextColor }}
            />
            <Text
              type={'body'}
              css={css`
                margin-right: ${(props) => props.theme.sizes.spacing8};
              `}
            >
              {t('" on the {{metric}} and entering', {
                metric: terms.metric.lowercaseSingular,
              })}
            </Text>
            <Text>
              {t(
                'an offset. An offset of -1 represents the value in the previous week.'
              )}
            </Text>
          </span>
          <Text
            type={'body'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            {t('An offset of 0 represents the value in the current week.')}
          </Text>
          <Text
            type={'body'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            {t(
              'For example, to calculate the weekly sales, you might use the following formula:'
            )}
          </Text>
          <div
            css={css`
              display: flex;
              justify-content: center;
              align-items: center;
              padding-bottom: ${(props) => props.theme.sizes.spacing16};
            `}
          >
            <Text
              type={'body'}
              css={css`
                background-color: ${(props) =>
                  props.theme.colors.formulaExpressionBadgeColor};
                border-radius: ${(props) => props.theme.sizes.br1};
                padding: ${(props) => props.theme.sizes.spacing6}
                  ${(props) => props.theme.sizes.spacing8};
              `}
            >
              {t('Total Sales')}
            </Text>
            <Text
              type={'body'}
              css={css`
                padding: 0 ${(props) => props.theme.sizes.spacing8};
              `}
            >
              {t('-')}
            </Text>
            <Text
              type={'body'}
              css={css`
                background-color: ${(props) =>
                  props.theme.colors.formulaExpressionBadgeColor};
                border-radius: ${(props) => props.theme.sizes.br1};
                padding: ${(props) => props.theme.sizes.spacing6}
                  ${(props) => props.theme.sizes.spacing8};
              `}
            >
              {t('Total Sales (-1)')}
            </Text>
          </div>
          <Text
            type={'body'}
            weight={'semibold'}
            css={css`
              padding-bottom: ${(props) => props.theme.sizes.spacing16};
            `}
          >
            {t('All operations:')}
          </Text>

          <GridContainer
            columns={12}
            css={css`
              margin: 0;
            `}
          >
            {metricsFormulaOpertationsLookup.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <GridItem
                    m={5}
                    css={css`
                      padding: 0;
                    `}
                  >
                    {item.operation}
                  </GridItem>
                  <GridItem
                    m={7}
                    css={css`
                      padding: 0;
                    `}
                  >
                    {item.operationExplination}
                  </GridItem>
                </React.Fragment>
              )
            })}
          </GridContainer>
        </div>
      )}
    </>
  )
}

const ExpressionText = (props: { className?: string }) => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Text
      type={'body'}
      className={props.className}
      fontStyle={'italic'}
      color={{
        color: theme.colors.formulaInstructionsTextExpressionColor,
      }}
      css={css`
        margin-left: ${(props) => props.theme.sizes.spacing4};
      `}
    >
      {t('expression')}
    </Text>
  )
}

const OperatorName = (props: { text: string }) => {
  return <Text type={'body'}>{props.text}</Text>
}

const getMetricsFormulaOperationsLookup = (): Array<{
  operation: JSX.Element
  operationExplination: JSX.Element
}> => {
  return [
    {
      operation: <OperatorName text={i18n.t('A + B')} />,
      operationExplination: <OperatorName text={i18n.t('Addition')} />,
    },
    {
      operation: <OperatorName text={i18n.t('A - B')} />,
      operationExplination: <OperatorName text={i18n.t('Subtraction')} />,
    },
    {
      operation: <OperatorName text={i18n.t('A * B')} />,
      operationExplination: <OperatorName text={i18n.t('Multiplication')} />,
    },
    {
      operation: <OperatorName text={i18n.t('A / B')} />,
      operationExplination: <OperatorName text={i18n.t('Division')} />,
    },
    {
      operation: <OperatorName text={i18n.t('A ^ B')} />,
      operationExplination: (
        <OperatorName text={i18n.t('A to the Bth power')} />
      ),
    },
    {
      operation: <OperatorName text={i18n.t('A ~ B')} />,
      operationExplination: <OperatorName text={i18n.t('Ath root of B')} />,
    },
    {
      operation: <OperatorName text={i18n.t('A % B')} />,
      operationExplination: (
        <OperatorName text={i18n.t('Modulo. The remainder. Ex. 10 % 3 = 1')} />
      ),
    },
    {
      operation: <OperatorName text={i18n.t('A DIV B')} />,
      operationExplination: (
        <OperatorName
          text={i18n.t('Whole part of division. Ex. 10 Div 3 = 3')}
        />
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('SQRT')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Square root')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t(`(`)} />
          <ExpressionText
            css={css`
              margin: 0 ${(props) => props.theme.sizes.spacing4};
            `}
          />
          <OperatorName text={i18n.t(`)`)} />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Parentheses for order of operations')} />
      ),
    },

    {
      operation: (
        <>
          <OperatorName text={i18n.t('FLOOR')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Round down')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('CEIL')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Round up')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('ABS')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Absolute value')} />,
    },
    {
      operation: <OperatorName text={i18n.t('ROUNDK ( A ; B )')} />,
      operationExplination: (
        <OperatorName text={i18n.t('Round A with B digits of accuracy')} />
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('ROUND')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Round to nearest number')} />
      ),
    },
    {
      operation: <OperatorName text={i18n.t('PI')} />,
      operationExplination: <OperatorName text={i18n.t('3.141593')} />,
    },
    {
      operation: <OperatorName text={i18n.t('EULER')} />,
      operationExplination: <OperatorName text={i18n.t('2.718282')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('EXP')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <>
          <OperatorName text={i18n.t('e ^')} />
          <ExpressionText />
        </>
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('LN')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Natural logarithm (base e)')} />
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('LOG')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Logarithm base 10')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('SIN')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Sine')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('COS')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Cosine')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('TAN')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Tangent')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('COT')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Cotangent')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('SINH')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Hyperbolic sine')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('COSH')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Hyperbolic cosine')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('TANH')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Hyperbolic tangent')} />
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('ARCSIN')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <>
          <OperatorName text={i18n.t('Inverse sine')} />
        </>
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('ARCCOS')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Inverse cosine')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('ARCTAN')} />
          <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Inverse tangent')} />,
    },
    {
      operation: <OperatorName text={i18n.t('ARCTAN2 ( A ; B )')} />,
      operationExplination: <OperatorName text={i18n.t('Atan2')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('ARCCOT')} /> <ExpressionText />
        </>
      ),
      operationExplination: <OperatorName text={i18n.t('Inverse cotangent')} />,
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('RAD')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Angle to radians (360° base)')} />
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('DEG')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Radians to angle (360° base)')} />
      ),
    },
    {
      operation: (
        <>
          <OperatorName text={i18n.t('EEX')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <>
          <OperatorName text={i18n.t('10 ^')} />
          <ExpressionText />
        </>
      ),
    },
    {
      operation: (
        <>
          <ExpressionText
            css={css`
              margin-right: ${(props) => props.theme.sizes.spacing4};
              margin-left: 0;
            `}
          />
          <OperatorName text={i18n.t('E+')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Exponent, e.g. 10e+43')} />
      ),
    },
    {
      operation: (
        <>
          <ExpressionText
            css={css`
              margin-right: ${(props) => props.theme.sizes.spacing4};
              margin-left: 0;
            `}
          />
          <OperatorName text={i18n.t('E-')} />
          <ExpressionText />
        </>
      ),
      operationExplination: (
        <OperatorName text={i18n.t('Inverted exponent, e.g. 10e-43')} />
      ),
    },
  ]
}
