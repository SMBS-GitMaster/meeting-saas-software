import { i18n } from '@mm/core/i18n'

import { MetricFrequency } from '@mm/core-bloom/metrics'

import { EFormulaBadgeType } from './formulaTypes'

export const recordOfMetricFrequencyToOffsetText: Record<
  MetricFrequency,
  string
> = {
  DAILY: i18n.t('day'),
  WEEKLY: i18n.t('week'),
  MONTHLY: i18n.t('month'),
  QUARTERLY: i18n.t('quarter'),
}

export const formulaOperatorsLookup: Array<{
  type: EFormulaBadgeType.Formula
  value: string
  text: string
  explination: string
}> = [
  {
    type: EFormulaBadgeType.Formula,
    value: '+',
    text: i18n.t('+'),
    explination: i18n.t('Addition'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: '-',
    text: i18n.t('-'),
    explination: i18n.t('Subtraction'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: '*',
    text: i18n.t('*'),
    explination: i18n.t('Multiplication'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: '/',
    text: i18n.t('/'),
    explination: i18n.t('Division'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: '^',
    text: i18n.t('^'),
    explination: i18n.t('A to the Bth power'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: '~',
    text: i18n.t('~'),
    explination: i18n.t('Ath root of B'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: '%',
    text: i18n.t('%'),
    explination: 'Modulo. The remainder. Ex. 10 % 3 = 1',
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'DIV',
    text: i18n.t('DIV'),
    explination: i18n.t('Whole part of division. Ex. 10 Div 3 = 3'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'SQRT',
    text: i18n.t('SQRT'),
    explination: i18n.t('Square root'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: '(',
    text: i18n.t('('),
    explination: i18n.t('Parentheses for order of operations'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: ')',
    text: i18n.t(')'),
    explination: i18n.t('Parentheses for order of operations'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'FLOOR',
    text: i18n.t('FLOOR'),
    explination: i18n.t('Round down'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'CEIL',
    text: i18n.t('CEIL'),
    explination: i18n.t('Round up'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ABS',
    text: i18n.t('ABS'),
    explination: i18n.t('Absolute value'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ROUNDK',
    text: i18n.t('ROUNDK'),
    explination: i18n.t('Round A with B digits of accuracy'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ROUND',
    text: i18n.t('ROUND'),
    explination: i18n.t('Round to nearest number'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'PI',
    text: i18n.t('PI'),
    explination: i18n.t('3.141593'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'EULER',
    text: i18n.t('EULER'),
    explination: i18n.t('2.718282'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'EXP',
    text: i18n.t('EXP'),
    explination: i18n.t('e ^ expression'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'LN',
    text: i18n.t('LN'),
    explination: i18n.t('Natural logarithm (base e)'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'LOG',
    text: i18n.t('LOG'),
    explination: i18n.t('Logarithm base 10'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'SIN',
    text: i18n.t('SIN'),
    explination: i18n.t('Sine'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'COS',
    text: i18n.t('COS'),
    explination: i18n.t('Cosine'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'TAN',
    text: i18n.t('TAN'),
    explination: i18n.t('Tangent'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'COT',
    text: i18n.t('COT'),
    explination: i18n.t('Cotangent'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'SINH',
    text: i18n.t('SINH'),
    explination: i18n.t('Hyperbolic sine'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'COSH',
    text: i18n.t('COSH'),
    explination: i18n.t('Hyperbolic cosine'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'TANH',
    text: i18n.t('TANH'),
    explination: i18n.t('Hyperbolic tangent'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ARCSIN',
    text: i18n.t('ARCSIN'),
    explination: i18n.t('Inverse sine'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ARCCOS',
    text: i18n.t('ARCCOS'),
    explination: i18n.t('Inverse cosine'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ARCTAN',
    text: i18n.t('ARCTAN'),
    explination: i18n.t('Inverse tangent'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ARCTAN2',
    text: i18n.t('ARCTAN2'),
    explination: i18n.t('Atan2'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'ARCCOT',
    text: i18n.t('ARCCOT'),
    explination: i18n.t('Arccot'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'RAD',
    text: i18n.t('RAD'),
    explination: i18n.t('Angle to radians (360° base)'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'DEG',
    text: i18n.t('DEG'),
    explination: i18n.t('Radians to angle (360° base)'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'EEX',
    text: i18n.t('EEX'),
    explination: i18n.t('10 ^expression'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'E+',
    text: i18n.t('E+'),
    explination: i18n.t('Exponent, e.g. 10e+43'),
  },
  {
    type: EFormulaBadgeType.Formula,
    value: 'E-',
    text: i18n.t('E-'),
    explination: i18n.t('Inverted exponent, e.g. 10e-43'),
  },
]
