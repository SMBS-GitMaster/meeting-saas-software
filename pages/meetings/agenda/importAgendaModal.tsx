import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import { type Id, queryDefinition, useComputed, useSubscription } from '@mm/gql'

import { IMeetingLookup, useBloomMeetingNode } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { Trans } from '@mm/core-web/i18n'
import {
  BtnText,
  Card,
  Icon,
  Modal,
  SelectInputSingleSelection,
  Text,
  toREM,
} from '@mm/core-web/ui'
import { DropFile } from '@mm/core-web/ui/components/dropFile'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { IMeetingAgendaActionHandlers } from './agendaCardTypes'

interface IImportAgendaModalProps {
  meetingId: Id
  meetingLookup: Array<IMeetingLookup>
  onImportAgenda: IMeetingAgendaActionHandlers['onImportAgenda']
}

export const ImportAgendaModal = observer(function ImportAgendaModal(
  props: IImportAgendaModalProps
) {
  const [selectedAgenda, setSelectedAgenda] = useState<File | string>('')
  const [meetingId, setMeetingId] = useState<Maybe<Id>>(null)
  const [modalStep, setModalStep] = useState<number>(1)
  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const meetingNode = useBloomMeetingNode()
  const subscription = useSubscription(
    {
      meeting: meetingId
        ? queryDefinition({
            def: meetingNode,
            map: ({ meetingPages, name }) => ({
              name,
              meetingPages: meetingPages({
                map: ({ pageType, pageName, expectedDurationS }) => ({
                  pageType,
                  pageName,
                  expectedDurationS,
                }),
              }),
            }),
            useSubOpts: { doNotSuspend: true },
            target: { id: props.meetingId },
          })
        : null,
    },
    {
      subscriptionId: `ImportAgendaModal-${props.meetingId}`,
    }
  )

  const expectedMeetingDurationInMinutes = useComputed(
    () => {
      return (
        subscription().data &&
        subscription().data?.meeting?.meetingPages.nodes?.reduce(
          (total, node) => {
            return total + (node?.expectedDurationS ?? 0) / 60
          },
          0
        )
      )
    },
    { name: 'importAgendaModal-expectedMeetingDurationInMinutes' }
  )

  return (
    <Modal id={'ImportAgendaModal'}>
      <Modal.Header>
        <Modal.Title>{t('Import Agenda')}</Modal.Title>
      </Modal.Header>
      {modalStep === 1 && (
        <>
          <Modal.Body
            css={css`
              z-index: 1;
              max-width: ${toREM(480)} !important;
            `}
          >
            <Text
              type='body'
              css={css`
                margin-bottom: ${(prop) => prop.theme.sizes.spacing20};
              `}
            >
              <Trans>
                Select an existing agenda from one of you other meetings to
                important an agenda template form a local file.
              </Trans>
            </Text>
            <SelectInputSingleSelection
              id={'meeting'}
              placeholder={t('Choose a meeting to import an agenda')}
              options={props.meetingLookup}
              unknownItemText={t('Unknown meeting')}
              name={'meeting'}
              formControl={{
                label: t('Import agenda from other meeting'),
              }}
              value={meetingId}
              onChange={(meetingId) => setMeetingId(meetingId)}
            />
            <DropFile
              formLabel={t('Or upload an agenda')}
              onFileChange={() => {
                setSelectedAgenda('file')
                console.log(
                  '@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1875'
                )
              }}
              css={css`
                margin: ${({ theme }) =>
                  `${theme.sizes.spacing32} 0 ${theme.sizes.spacing24}`};
              `}
              uploading={false}
              fileLabel={t('agenda template')}
              filePreview={
                selectedAgenda ? (
                  <div
                    css={css`
                      margin-top: ${({ theme }) => theme.sizes.spacing12};
                      padding: ${({ theme }) => theme.sizes.spacing12};
                      background: ${({ theme }) =>
                        theme.colors.cardBackgroundColor};
                      border-radius: ${(props) => props.theme.sizes.br1};
                      display: flex;
                      align-items: center;
                    `}
                  >
                    {' '}
                    <Icon iconName='fileIcon' iconSize='md' />
                    <Text
                      type='body'
                      weight='bold'
                      css={`
                        flex: 1;
                      `}
                    >
                      {selectedAgenda}
                    </Text>
                  </div>
                ) : null
              }
            />
          </Modal.Body>
          <Modal.Footer>
            <BtnText
              ariaLabel={t('Cancel')}
              fontWeight='semibold'
              intent='tertiary'
              onClick={() =>
                closeOverlazy({ type: 'Modal', name: 'ImportAgendaModal' })
              }
            >
              <Text weight='semibold'>{t('Cancel')}</Text>
            </BtnText>
            <BtnText
              ariaLabel={t('Next')}
              intent='primary'
              fontWeight='semibold'
              onClick={() => setModalStep(2)}
            >
              <Text weight='semibold'>{t('Next')}</Text>
            </BtnText>
          </Modal.Footer>
        </>
      )}
      {modalStep === 2 && (
        <>
          <Modal.Body
            css={css`
              max-width: ${toREM(480)} !important;
            `}
          >
            <Text
              type='body'
              css={css`
                margin-bottom: ${(prop) => prop.theme.sizes.spacing20};
              `}
            >
              {t(
                "Confirm that this template is a good fit. Don't worry, you will still be able to further customize your agenda once you confirm."
              )}
            </Text>
            <div
              css={css`
                justify-content: center;
                display: flex;
              `}
            >
              {subscription().data?.meeting?.name && (
                <Card
                  css={css`
                    width: ${toREM(240)};
                    justify-content: center;
                    align-items: center;
                  `}
                >
                  <Card.Header
                    renderLeft={
                      <Card.Title
                        css={css`
                          overflow: hidden;
                          text-overflow: ellipsis;
                          white-space: nowrap;
                          width: 100%;
                        `}
                      >
                        {t('{{meetingName}}', {
                          meetingName: subscription().data?.meeting?.name,
                        })}
                      </Card.Title>
                    }
                  ></Card.Header>
                  <Card.Body>
                    <Text
                      type='caption'
                      css={css`
                        padding: ${(prop) => prop.theme.sizes.spacing12};
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      `}
                    >
                      {t('Total time {{duration}} min', {
                        duration: expectedMeetingDurationInMinutes() ?? 0,
                      })}
                    </Text>
                    {subscription().data?.meeting?.meetingPages.nodes.map(
                      (page) => (
                        <div
                          key={page.id}
                          css={css`
                            display: flex;
                            flex-direction: column;
                          `}
                        >
                          <div
                            css={css`
                              display: flex;
                              flex-direction: row;
                              justify-content: space-between;
                            `}
                          >
                            <Text
                              type='body'
                              css={css`
                                margin-bottom: ${(prop) =>
                                  prop.theme.sizes.spacing12};
                                padding-right: ${(prop) =>
                                  prop.theme.sizes.spacing40};
                              `}
                            >
                              {t('{{pageName}}', {
                                pageName: page.pageName,
                              })}
                            </Text>

                            <Text
                              type='body'
                              css={css`
                                margin-bottom: ${(prop) =>
                                  prop.theme.sizes.spacing12};
                                padding-left: ${(prop) =>
                                  prop.theme.sizes.spacing40};
                              `}
                            >
                              {`${Math.floor(page.expectedDurationS / 60)}m`}
                            </Text>
                          </div>
                        </div>
                      )
                    )}
                  </Card.Body>
                </Card>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <BtnText
              ariaLabel={t('Go Back')}
              intent='tertiary'
              onClick={() => setModalStep(1)}
            >
              <Text weight='semibold'>{t('No, go back')}</Text>
            </BtnText>
            <BtnText
              ariaLabel={t('Confirm')}
              intent='primary'
              onClick={() => {
                meetingId && props.onImportAgenda({ meetingId })
                closeOverlazy({ type: 'Drawer' })
              }}
            >
              <Text weight='semibold'>{t('Yes, it looks good')}</Text>
            </BtnText>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
})

export default ImportAgendaModal
