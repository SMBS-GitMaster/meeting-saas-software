import { observer } from 'mobx-react'
import React from 'react'

import { OrgChartContainer } from './orgChartContainer'
import { OrgChartView } from './orgChartView'

export default observer(function V3OrgChart() {
  return <OrgChartContainer>{OrgChartView}</OrgChartContainer>
})
