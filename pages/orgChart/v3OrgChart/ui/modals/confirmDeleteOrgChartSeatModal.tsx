import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { chunkArray } from '@mm/core/dataParsing'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { Trans, useTranslation } from '@mm/core-web/i18n'
import { BtnText, Expandable, Text, UserAvatar } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useObsEffect,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'

import { CONFIRM_SEAT_DELETE_MODAL_MAX_USERS_TO_DISPLAY_PER_POSITION } from '../../consts'
import { HierarchicalOrgChartSeat } from '../../types'
import {
  SupervisorInput,
  SupervisorInputMetadata,
} from '../drawers/selectSupervisorInput'

interface IConfirmDeleteOrgChartSeatModalProps {
  getData: () => {
    seat: HierarchicalOrgChartSeat
    getSupervisorOptions: () => Array<{
      value: Id
      metadata: SupervisorInputMetadata
    }>
    initialSupervisorSeatIdSuggestion: Maybe<Id>
  }
  getActions: () => {
    onDirectReportsAcquired: () => void
    onDeleteSeat: (opts: { newDirectReportSupervisorSeatId: Maybe<Id> }) => void
  }
}

export const ConfirmDeleteOrgChartSeatModal = observer(
  function ConfirmDeleteOrgChartSeatModal(
    props: IConfirmDeleteOrgChartSeatModalProps
  ) {
    const terms = useBloomCustomTerms()
    const { closeOverlazy } = useOverlazyController()

    const { t } = useTranslation()
    const componentState = useObservable(() => ({
      chosenSupervisorSeatId: props.getData().initialSupervisorSeatIdSuggestion,
    }))

    const onChosenSupervisorSeatChange = useAction((value: Maybe<Id>) => {
      componentState.chosenSupervisorSeatId = value
    })

    const directReports = props.getData().seat.directReports || []

    const onConfirmDelete = useAction(() => {
      props.getActions().onDeleteSeat({
        newDirectReportSupervisorSeatId: componentState.chosenSupervisorSeatId!,
      })
    })

    useObsEffect(() => {
      // this happens if this modal is opened while the seat has no direct reports
      // but then direct reports are added to this seat
      if (props.getData().seat.directReports?.length) {
        props.getActions().onDirectReportsAcquired()
      }
    })

    return (
      <Modal
        id={'ConfirmDeleteOrgChartSeatModal'}
        onHide={() => {
          closeOverlazy({
            type: 'Modal',
            name: 'ConfirmDeleteOrgChartSeatModal',
          })
        }}
      >
        <Modal.Header>
          <Modal.Title>{t('Confirm delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Text>
            <Trans>
              {`You're deleting the `}
              <Text weight='bold'>
                {props.getData().seat.position &&
                  props.getData().seat.position?.title}
              </Text>
              {` seat from your `}
              {terms.organizationalChart.lowercaseSingular}.
            </Trans>
            <div
              css={css`
                margin-top: ${({ theme }) => theme.sizes.spacing16};
              `}
            >
              {t(
                'Doing this will not remove the user(s) in this seat from your organization. They can be reassigned to a different seat via the edit seat workflow.'
              )}
            </div>
          </Text>
          {directReports.length > 0 && (
            <>
              <Text
                css={css`
                  margin-top: ${({ theme }) => theme.sizes.spacing16};
                  display: block;
                `}
              >
                {t(
                  'This seat also has direct reports. Delegate another seat as the supervisor of the following users. If you do not select a new supervisor, these seats will become root level seats and will be located at the top level of the {{orgChartTerm}}.',
                  {
                    orgChartTerm: terms.organizationalChart.lowercaseSingular,
                  }
                )}
              </Text>
              <div
                css={css`
                  padding: ${({ theme }) => theme.sizes.spacing8}
                    ${({ theme }) => theme.sizes.spacing16};
                  background-color: ${({ theme }) =>
                    theme.colors.orgChartModalSecondaryBackground};
                  border-radius: ${({ theme }) => theme.sizes.br2};
                  margin: ${({ theme }) => theme.sizes.spacing16} 0;
                `}
              >
                {directReports.map((directReport) => {
                  const usersToShow = chunkArray(
                    directReport.users.nodes,
                    CONFIRM_SEAT_DELETE_MODAL_MAX_USERS_TO_DISPLAY_PER_POSITION
                  )[0]
                  const restOfUsersCount = directReport.users.nodes.length
                    ? directReport.users.nodes.length -
                      CONFIRM_SEAT_DELETE_MODAL_MAX_USERS_TO_DISPLAY_PER_POSITION
                    : 0

                  return (
                    <Expandable
                      disabled={directReport.users.nodes.length === 0}
                      key={directReport.id}
                      title={
                        directReport.position
                          ? directReport.position.title
                          : t('No position title')
                      }
                      titleExtension={`(${directReport.users.nodes.length || t('No users')})`}
                    >
                      {usersToShow.map((user) => (
                        <UserInSeatDisplay
                          user={user}
                          seat={directReport}
                          key={user.id}
                        />
                      ))}
                      {restOfUsersCount > 0 && (
                        <Text
                          css={css`
                            margin: ${({ theme }) => theme.sizes.spacing8}
                              ${({ theme }) => theme.sizes.spacing16};
                          `}
                          weight='bold'
                          type='h4'
                        >
                          {`+${restOfUsersCount}`}
                        </Text>
                      )}
                    </Expandable>
                  )
                })}
              </div>
              <SupervisorInput
                width='100%'
                id='confirmDeleteOrgChartSeatModalSupervisorInput'
                options={props.getData().getSupervisorOptions()}
                value={componentState.chosenSupervisorSeatId}
                onChange={onChosenSupervisorSeatChange}
                name='confirmDeleteOrgChartSeatModalSupervisorInput'
                unknownItemText={t('Unknown seat')}
                placeholder={t('Select a supervisor')}
                formControl={{
                  label: t('New supervisor'),
                }}
                disabled={props.getData().getSupervisorOptions().length === 0}
                tooltip={
                  props.getData().getSupervisorOptions().length === 0
                    ? {
                        msg: t('No available supervisors to choose from'),
                      }
                    : undefined
                }
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <BtnText
            intent='tertiary'
            ariaLabel={t('Cancel')}
            onClick={() => {
              closeOverlazy({
                type: 'Modal',
                name: 'ConfirmDeleteOrgChartSeatModal',
              })
            }}
          >
            {t('Cancel')}
          </BtnText>
          <BtnText
            intent='warning'
            ariaLabel={t('Delete')}
            onClick={() => {
              closeOverlazy({
                type: 'Modal',
                name: 'ConfirmDeleteOrgChartSeatModal',
              })
              onConfirmDelete()
            }}
          >
            {t('Delete')}
          </BtnText>
        </Modal.Footer>
      </Modal>
    )
  }
)

function UserInSeatDisplay(props: {
  user: HierarchicalOrgChartSeat['users']['nodes'][number]
  seat: HierarchicalOrgChartSeat
}) {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        margin: ${(props) => props.theme.sizes.spacing4}
          ${(props) => props.theme.sizes.spacing16};
      `}
    >
      <UserAvatar
        firstName={props.user.firstName}
        lastName={props.user.lastName}
        avatarUrl={props.user.avatar}
        userAvatarColor={props.user.userAvatarColor}
        size={'s'}
        adornments={{ tooltip: true }}
      />

      <Text
        css={css`
          padding-left: ${(props) => props.theme.sizes.spacing8};
        `}
        type='body'
      >
        {props.user.fullName}
      </Text>
    </div>
  )
}

export default ConfirmDeleteOrgChartSeatModal
