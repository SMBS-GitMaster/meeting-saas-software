import { observer } from 'mobx-react'
import React from 'react'
import { Helmet } from 'react-helmet-async'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useBloomPostMessage } from '@mm/bloom-web/shared/hooks/useBloomPostMessage'

export const BloomNewFeaturesModalPageContainer = observer(
  function BloomNewFeaturesModalPageContainer() {
    const { openOverlazy } = useOverlazyController()

    useBloomPostMessage({
      callBack: (event) => {
        if (event.data.isOpen) {
          openOverlazy('BloomNewFeaturesModal', { isAutoOpened: false })
        }
      },
      eventsName: ['featureModal'],
    })

    return (
      <>
        <Helmet
          style={[
            {
              cssText: `
            body{
              background-color: transparent;
            }
            [class^="StyledPageContainer"] {
                background-color: transparent;
            }
        `,
            },
          ]}
        />
      </>
    )
  }
)
