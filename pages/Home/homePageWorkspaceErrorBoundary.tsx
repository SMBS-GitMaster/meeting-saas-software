import React, { PureComponent } from 'react'

import { getMMErrorLogger } from '@mm/core/logging'

import { HomePageWelcomeScreen } from './homePageWelcomeScreen'

interface IHomePageWorkspaceErrorBoundaryProp {
  diResolver: IDIResolver
  children: React.ReactNode
}

export class HomePageWorkspaceErrorBoundary extends PureComponent<IHomePageWorkspaceErrorBoundaryProp> {
  constructor(props: IHomePageWorkspaceErrorBoundaryProp) {
    super(props)
    this.diResolver = props.diResolver
  }

  state = {
    error: null as Maybe<Error & { retry?: () => void }>,
    errorInfo: null,
  }

  private diResolver: IDIResolver

  static getDerivedStateFromError(error: any, errorInfo: any) {
    return { error, errorInfo }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    getMMErrorLogger(this.diResolver).logError(error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.error) {
      return <HomePageWelcomeScreen />
    }

    return this.props.children
  }
}
