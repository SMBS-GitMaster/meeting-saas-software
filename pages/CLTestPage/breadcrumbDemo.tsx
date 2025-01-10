import React from 'react'

import { Breadcrumb, Expandable } from '@mm/core-web/ui'

export const BreadcrumbDemo = () => {
  return (
    <Expandable title='Breadcrumb'>
      <Breadcrumb
        steps={['Main Page', 'Two Page', 'Three Page', 'Last Page']}
        showInProgressIndicator={true}
      />
    </Expandable>
  )
}
