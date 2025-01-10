import React from 'react'
import { css } from 'styled-components'

import { MetricFrequency } from '@mm/core-bloom/metrics'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnIcon } from '@mm/core-web/ui/components/buttons'
import { Icon } from '@mm/core-web/ui/components/icon'
import { Menu } from '@mm/core-web/ui/components/menu'
import { Text } from '@mm/core-web/ui/components/text'
import { toREM } from '@mm/core-web/ui/responsive'

import { recordOfMetricFrequencyToOffsetText } from './constants'

interface IFormulaOffsetMenuProps {
  currentOffset: number
  offsetFrequency: MetricFrequency
  handleOffsetSelection: (offset: number) => void
}

export const FormulaOffsetMenu: React.FC<IFormulaOffsetMenuProps> = ({
  currentOffset,
  offsetFrequency,
  handleOffsetSelection,
}) => {
  const { t } = useTranslation()
  const frequencyText = recordOfMetricFrequencyToOffsetText[offsetFrequency]

  const offsetOptions = [-2, -1, 0, 1, 2]
  const metricFrequencyToMenuWidth: Record<MetricFrequency, number> = {
    DAILY: 170,
    WEEKLY: 170,
    MONTHLY: 180,
    QUARTERLY: 185,
  }

  return (
    <Menu
      maxWidth={toREM(metricFrequencyToMenuWidth[offsetFrequency])}
      position={'right center'}
      content={(close) => (
        <>
          {offsetOptions.map((offset, index) => (
            <Menu.Item
              key={index}
              onClick={(e) => {
                handleOffsetSelection(offset)
                close(e)
              }}
            >
              <div
                css={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <Text type={'body'}>
                  {offset < 2 && offset > -2
                    ? t('Offset {{offset}} {{interval}}', {
                        interval: frequencyText,
                        offset: offset,
                      })
                    : t('Offset {{offset}} {{interval}}s', {
                        interval: frequencyText,
                        offset: offset,
                      })}
                </Text>
                {currentOffset === offset && (
                  <Icon
                    iconName={'checkIcon'}
                    iconSize={'md'}
                    css={css`
                      margin-left: ${(props) => props.theme.sizes.spacing8};
                    `}
                  />
                )}
              </div>
            </Menu.Item>
          ))}
        </>
      )}
    >
      {({ isOpen }) => (
        <BtnIcon
          iconProps={{
            iconName: isOpen ? 'chevronUpIcon' : 'chevronDownIcon',
          }}
          size='md'
          intent='naked'
          ariaLabel={t('Open offset menu')}
          tag='button'
          onClick={() => null}
        />
      )}
    </Menu>
  )
}
