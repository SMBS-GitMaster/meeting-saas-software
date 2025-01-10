import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { type MetricFrequency, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Clickable,
  Icon,
  Menu,
  SwitchInput,
  Text,
  TextEllipsis,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'

import { RecordOfColumnMenuNameToDisplayValue } from '../metricsTableConstants'
import {
  type IMetricsTableViewData,
  type TMetricsTableResponsiveSize,
} from '../metricsTableTypes'
import { type IPersonalMetricsTableViewActions } from './personalMetricsTableTypes'

interface IPersonalMetricsTableHeaderLeftProps {
  selecedFrequencyTab: MetricFrequency
  isCurrentUser: boolean
}

export const PersonalMetricsTableHeaderLeft = observer(
  function PersonalMetricsTableHeaderLeft(
    props: IPersonalMetricsTableHeaderLeftProps
  ) {
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const theme = useTheme()
    const { openOverlazy } = useOverlazyController()

    return (
      <div
        css={css`
          align-items: center;
          display: flex;
        `}
      >
        <TextEllipsis
          type='h3'
          lineLimit={1}
          wordBreak={true}
          weight={'semibold'}
          color={{ color: theme.colors.bodyTextDefault }}
          css={css`
            margin-right: ${theme.sizes.spacing8};
          `}
        >
          {props.isCurrentUser
            ? t(`My {{metrics}}`, { metrics: terms.metric.plural })
            : t(`{{metrics}}`, { metrics: terms.metric.plural })}
        </TextEllipsis>
        <BtnIcon
          intent='naked'
          size='lg'
          iconProps={{
            iconName: 'plusIcon',
            iconSize: 'lg',
          }}
          onClick={() => {
            const opts = props.isCurrentUser
              ? { meetingId: null, frequency: props.selecedFrequencyTab }
              : { frequency: props.selecedFrequencyTab }
            openOverlazy('CreateMetricDrawer', opts)
          }}
          ariaLabel={t('Add {{metric}}', {
            metric: terms.metric.lowercaseSingular,
          })}
          tag={'button'}
        />
      </div>
    )
  }
)

interface IPersonalMetricsTableHeaderRightProps {
  workspaceTileId: Id
  columnDisplayValues: Record<
    keyof IMetricsTableViewData['metricTableColumnToIsVisibleSettings'],
    boolean
  >
  isCumulativeSumColumnDisabled: boolean
  isAverageColumnDisabled: boolean
  hideOptionsKebab: boolean
  responsiveSize: () => TMetricsTableResponsiveSize
  onDeleteTile: IPersonalMetricsTableViewActions['onDeleteTile']
  onSetColumnDisplay: IPersonalMetricsTableViewActions['onSetColumnDisplay']
}

export const PersonalMetricsTableHeaderRight = observer(
  function PersonalMetricsTableHeaderRight(
    props: IPersonalMetricsTableHeaderRightProps
  ) {
    const theme = useTheme()
    const { activeFullScreenTileId, fullScreenTile, minimizeTile } =
      useWorkspaceFullScreenTileController()
    const { openOverlazy } = useOverlazyController()
    const { t } = useTranslation()

    const isExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    return (
      <div
        css={css`
          align-items: center;
          display: flex;
        `}
      >
        {props.responsiveSize() === 'L' && (
          <Menu
            position='bottom left'
            content={() => (
              <>
                <Menu.Item isSectionHeader={true}>
                  <Text
                    type='body'
                    weight='semibold'
                    css={css`
                      margin-bottom: ${theme.sizes.spacing8};
                    `}
                  >
                    {t('Show/Hide:')}
                  </Text>
                </Menu.Item>
                <Menu.Divider />
                {Object.entries(props.columnDisplayValues).map(
                  ([columnDisplayKey, columnDisplayValue]) => {
                    if (columnDisplayKey === 'owner') return null
                    const toggleText =
                      RecordOfColumnMenuNameToDisplayValue[
                        columnDisplayKey as keyof IMetricsTableViewData['metricTableColumnToIsVisibleSettings']
                      ]
                    const isDisabled =
                      (columnDisplayKey === 'cumulative' &&
                        props.isCumulativeSumColumnDisabled) ||
                      (columnDisplayKey === 'average' &&
                        props.isAverageColumnDisabled)

                    return (
                      <Menu.Item key={columnDisplayKey}>
                        <SwitchInput
                          id={`column_${columnDisplayKey}`}
                          name={`column_${columnDisplayKey}`}
                          size={'default'}
                          disabled={isDisabled}
                          text={toggleText}
                          value={columnDisplayValue}
                          onChange={(value) => {
                            props.onSetColumnDisplay({
                              column:
                                columnDisplayKey as keyof IMetricsTableViewData['metricTableColumnToIsVisibleSettings'],
                              isShowing: value,
                            })
                          }}
                        />
                      </Menu.Item>
                    )
                  }
                )}
              </>
            )}
          >
            <span>
              <Icon
                iconName='openEyeIcon'
                iconSize='lg'
                css={css`
                  margin-right: ${theme.sizes.spacing12};
                `}
              />
            </span>
          </Menu>
        )}
        {!props.hideOptionsKebab && (
          <Menu
            content={(close) => (
              <>
                <Menu.Item
                  onClick={(e) => {
                    close(e)
                    openOverlazy('CreateMetricDrawer', {
                      meetingId: null,
                    })
                  }}
                >
                  <Text type={'body'}>{t('Create Metric')}</Text>
                </Menu.Item>
                <Menu.Item
                  onClick={(e) => {
                    close(e)
                    fullScreenTile(props.workspaceTileId)
                  }}
                >
                  <Text type={'body'}>{t('View in full screen')}</Text>
                </Menu.Item>
                <Menu.Item
                  onClick={async (e) => {
                    close(e)
                    await props.onDeleteTile()
                  }}
                >
                  <Text type={'body'}>{t('Delete tile')}</Text>
                </Menu.Item>
              </>
            )}
          >
            <span>
              <Clickable clicked={() => null}>
                <Icon iconName='moreVerticalIcon' iconSize='lg' />
              </Clickable>
            </span>
          </Menu>
        )}
        {isExpandedOnWorkspacePage && (
          <Clickable clicked={() => minimizeTile()}>
            <Icon
              iconName='closeIcon'
              iconSize='lg'
              css={css`
                margin-left: ${(prop) => prop.theme.sizes.spacing8};
              `}
            />
          </Clickable>
        )}
      </div>
    )
  }
)
