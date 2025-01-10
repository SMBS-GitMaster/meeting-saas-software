import { observer } from 'mobx-react'
import React, { Suspense } from 'react'
import styled, { keyframes } from 'styled-components'

import { useDIResolver } from '@mm/core/di/resolver'
import { keys } from '@mm/core/typeHelpers'

import { useModalsController } from '@mm/core-web/ui'
import { toREM } from '@mm/core-web/ui/responsive'
import { useTheme } from '@mm/core-web/ui/theme'

import OverlazyErrorBoundary from '@mm/bloom-web/bloomProvider/overlazy/overlazyErrorBoundary'

import {
  OVERLAZY_COMPONENTS,
  OVERLAZY_DRAWERS,
  OVERLAZY_MODALS,
  OVERLAZY_TABS,
} from './overlazyComponents'
import { useOverlazyController } from './overlazyController'
import { IActiveOverlazyComponent } from './overlazyTypes'

export const OverlazyProvider = observer(function OverlazyProvider() {
  const {
    activeDrawer,
    activeStickyDrawer,
    activeModals,
    activeTabs,
    activeToasts,
    closeToast,
  } = useOverlazyController()

  const { activeModal: activeModalController } = useModalsController()
  const diResolver = useDIResolver()

  const { zIndices } = useTheme()

  const activeModalId = activeModalController as
    | IActiveOverlazyComponent['component']
    | null

  const ModalComponent =
    activeModalId &&
    activeModalId in activeModals &&
    OVERLAZY_COMPONENTS[activeModalId]

  const DrawerComponent =
    activeDrawer && OVERLAZY_COMPONENTS[activeDrawer.component]

  const StickyDrawerComponent =
    activeStickyDrawer && OVERLAZY_COMPONENTS[activeStickyDrawer.component]

  const ToastComponent = OVERLAZY_COMPONENTS['Toast']

  return (
    <>
      <Suspense fallback={null}>
        {activeToasts.length > 0 && (
          <ToastContainer className='toast_container' zIndex={zIndices.toasts}>
            {activeToasts.map((toast) => {
              return (
                <ToastWrapper key={toast.id} visible={toast.visible}>
                  <ToastComponent
                    {...toast}
                    closeClicked={() => closeToast(toast.id)}
                  />
                </ToastWrapper>
              )
            })}
          </ToastContainer>
        )}
      </Suspense>

      <Suspense fallback={null}>
        {DrawerComponent && (
          <OverlazyErrorBoundary
            diResolver={diResolver}
            closeOverlazyProps={{
              type: 'Drawer',
              drawerId: activeDrawer.component as keyof typeof OVERLAZY_DRAWERS,
            }}
            reopenOverlazyProps={[
              activeDrawer.component as keyof typeof OVERLAZY_DRAWERS,
              activeDrawer.props,
            ]}
          >
            <DrawerComponent {...(activeDrawer.props as any)} />
          </OverlazyErrorBoundary>
        )}
      </Suspense>

      <Suspense fallback={null}>
        {StickyDrawerComponent && (
          <OverlazyErrorBoundary
            diResolver={diResolver}
            closeOverlazyProps={{ type: 'StickyDrawer' }}
            reopenOverlazyProps={[
              activeStickyDrawer.component as keyof typeof OVERLAZY_DRAWERS,
              activeStickyDrawer.props,
            ]}
          >
            <StickyDrawerComponent {...(activeStickyDrawer.props as any)} />
          </OverlazyErrorBoundary>
        )}
      </Suspense>

      <Suspense fallback={null}>
        {ModalComponent && (
          <OverlazyErrorBoundary
            diResolver={diResolver}
            closeOverlazyProps={{
              type: 'Modal',
              name: activeModalId as keyof typeof OVERLAZY_MODALS,
            }}
            reopenOverlazyProps={[
              activeModalId as keyof typeof OVERLAZY_MODALS,
              activeModals[activeModalId],
            ]}
          >
            <ModalComponent {...(activeModals[activeModalId] as any)} />
          </OverlazyErrorBoundary>
        )}
      </Suspense>

      {activeTabs &&
        keys(activeTabs).map((tabName) => {
          const TabComponent = OVERLAZY_COMPONENTS[tabName]
          return (
            <Suspense fallback={null} key={tabName}>
              <OverlazyErrorBoundary
                diResolver={diResolver}
                closeOverlazyProps={{
                  type: 'Tab',
                  name: tabName as keyof typeof OVERLAZY_TABS,
                }}
                reopenOverlazyProps={[
                  tabName as keyof typeof OVERLAZY_TABS,
                  activeTabs[tabName],
                ]}
              >
                <TabComponent {...(activeTabs[tabName] as any)} />
              </OverlazyErrorBoundary>
            </Suspense>
          )
        })}
    </>
  )
})

const ToastContainer = styled.div<{ zIndex: number }>`
  margin: ${(prop) =>
    `${prop.theme.sizes.spacing16} ${prop.theme.sizes.spacing24}`};
  max-height: 100vh;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: ${(props) => props.zIndex};
`

const ToastWrapper = styled.div<{ visible: boolean }>`
  animation: ${(props) => (props.visible ? fadeIn : fadeOut)} 1s linear;
  margin-top: ${toREM(8)};
  pointer-events: ${(props) => (props.visible ? 'initial' : 'none')};
  transition: ${(props) =>
    props.visible ? 'visibility 1s linear' : 'visibility 0.3s linear'};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
`

const fadeIn = keyframes`
  from {  
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`

const fadeOut = keyframes`
  from {    
    opacity: 1;
  }

  to {    
    opacity: 0;
  }
`
