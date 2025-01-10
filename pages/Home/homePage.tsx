import { observer } from 'mobx-react'
import React from 'react'

import { HomePageContainer } from './homePageContainer'
import { HomePageView } from './homePageView'

export const HomePage = observer(function HomePage() {
  return <HomePageContainer>{HomePageView}</HomePageContainer>
})

export default HomePage
