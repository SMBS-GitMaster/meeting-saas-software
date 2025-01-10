import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Drawer,
  GridContainer,
  GridItem,
  SomethingWentWrongError,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { IErrorDrawerViewProps } from './errorDrawerTypes'

export const ErrorDrawerView = observer(function ErrorDrawerView(
  props: IErrorDrawerViewProps
) {
  const { title, retry, drawerIsRenderedInMeeting, drawerView } = props.data
  const { onHandleGoBack } = props.actionHandlers

  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const theme = useTheme()

  const showEmbeddedDrawer =
    drawerIsRenderedInMeeting && drawerView === 'EMBEDDED'

  return (
    <Drawer
      id={'ErrorDrawer'}
      showEmbeddedDrawer={showEmbeddedDrawer}
      type='create'
      hideFooterContent={true}
      headerText={title}
      footerText={t('N/A')}
      onSaveClicked={() => {
        // NO-OP
      }}
      onResetForm={() => {
        //NO-OP
      }}
      drawerHasUnsavedChanges={false}
      onHandleCloseDrawerWithUnsavedChangesProtection={() => {
        // NO-OP
      }}
      closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
    >
      {({ isExpanded }) => {
        return (
          <GridContainer
            columns={12}
            css={css`
              padding-top: ${showEmbeddedDrawer && !isExpanded
                ? theme.sizes.spacing32
                : toREM(149)};
            `}
          >
            <GridItem
              m={12}
              css={css`
                padding: ${theme.sizes.spacing48} ${toREM(64)}
                  ${theme.sizes.spacing32} ${toREM(64)};
              `}
            >
              <SomethingWentWrongError
                css={css`
                  ${showEmbeddedDrawer &&
                  !isExpanded &&
                  css`
                    width: ${toREM(300)};
                    height: ${toREM(200)};
                  `}
                `}
                onRetry={retry}
                onGoBack={onHandleGoBack}
                addGoHomeOption={false}
              />
            </GridItem>
          </GridContainer>
        )
      }}
    </Drawer>
  )
})
