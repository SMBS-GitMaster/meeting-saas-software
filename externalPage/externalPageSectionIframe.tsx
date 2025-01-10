import { observer } from 'mobx-react'
import React from 'react'

import { useTranslation } from '@mm/core-web/i18n'

interface IExternalPageSectionIframeProps {
  url: string
  className?: string
}

export const ExternalPageSectionIframe = observer(
  function ExternalPageSectionIframe(props: IExternalPageSectionIframeProps) {
    const { t } = useTranslation()

    return (
      <div
        css={`
          width: 100%;
          height: 100%;
          overflow: hidden;
        `}
        className={props.className}
      >
        <iframe
          title={t('External page')}
          width='100%'
          height='100%'
          frameBorder='0'
          src={props.url}
        />
      </div>
    )
  }
)
