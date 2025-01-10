import posthog from 'posthog-js'

import { gql } from '@mm/gql'

import { getClientSessionController } from '@mm/core/auth'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { getMMErrorLogger } from '@mm/core/logging'
import { getMMGQLClient } from '@mm/core/mm-gql'
import { noAwait__UNSAFE } from '@mm/core/network/helpers/noAwait'

import { AUTH_TYPE, OrgUserAuthInfo } from '@mm/core-bloom/auth'

import { bootstrapI18n } from '@mm/core-web'

import {
  IMMBrowserEnvironment,
  loadBrowserEnv,
  loadMMEnv,
  loadWebServerEnv,
  registerBrowserEnvironment,
  registerWebServerEnvrionment,
} from '@mm/core-web/envs'
import { identifyPendoUser } from '@mm/core-web/integrations/pendo'
import { SentryErrorLogger } from '@mm/core-web/integrations/sentryErrorLogger'
import { WebhookEventLogger } from '@mm/core-web/integrations/webhookEventLogger'

import { getTimeController } from '../../libs/core/date/timeController'

async function render() {
  // i18n bootstrapping must happen before other imports
  // otherwise labels may go missing
  await bootstrapI18n({
    translations: {
      en: {},
      es: {},
    },
  })

  const [
    { bloomTheme, bloomGlobalStyles },
    {
      initCoreAppDependencies,
      registerWebAppDependencies,
      registerAppIntegrations,
    },
    { renderAppToBrowser },
    { preloadSomethingWentWrongError },
    { getOnlineOfflineStatusListeners },
    { generateBloomWebRouter },
  ] = await Promise.all([
    import('@mm/core-web/ui'),
    import('@mm/core-web/appDependencyRegistration'),
    import('@mm/core-web/renderAppToBrowser'),
    import('@mm/bloom-web/errors/preload'),
    import('@mm/bloom-web/shared/listeners/onlineStatusListeners'),
    import('./router'),
  ])

  const { diResolver, noAwait } = await initCoreAppDependencies({
    getErrorLogger: () =>
      new SentryErrorLogger({
        dsn: 'https://ccf93654c0a94d2aae11e9f3aad2b12e@o386517.ingest.sentry.io/6633133',
        release: RELEASE_VERSION,
        enableInDevEnv: false,
      }),
    getEventLogger: (diResolver) =>
      new WebhookEventLogger({ diResolver, appName: 'bloom' }),
  })

  const mmEnv = await loadMMEnv()
  const browserEnv = loadBrowserEnv(mmEnv)
  const webServerEnv = loadWebServerEnv(mmEnv)
  registerBrowserEnvironment({ env: browserEnv, diResolver })
  registerWebServerEnvrionment({ env: webServerEnv, diResolver })

  // eslint-disable-next-line
  const _window = window

  await registerWebAppDependencies({
    diResolver,
    ssrConfig: {
      window: _window,
      // eslint-disable-next-line
      document,
      // eslint-disable-next-line
      navigator,
      isSSR: false,
    },
    theme: bloomTheme,
    getStaticData: () =>
      import('@mm/core-bloom/mockData').then((exports) => exports.staticData),
    onQueryError: ({ error }) =>
      onQueryError({
        error,
        diResolver,
        browserEnv,
      }),
    onMutationError: ({ error }) =>
      onMutationError({
        error,
        diResolver,
        browserEnv,
      }),
  })

  await registerAppIntegrations({
    diResolver,
    googleMeasurementId: browserEnv.googleMeasurementId,
  })

  // Start the time controller
  // initializes the subscription to keep the time up to date
  // before anything renders
  getTimeController(diResolver)

  try {
    const { orgUserId } = await attemptAuthentication({
      diResolver,
      generateMockData: browserEnv.generateMockData,
    })
    getClientSessionController(diResolver).setNewAuthInfo<OrgUserAuthInfo>({
      type: AUTH_TYPE.ORG_USER,
      info: { orgUserId },
    })

    posthog?.init(browserEnv.postHogApiKey, {
      api_host: browserEnv.postHogApiHost,
    })

    noAwait(
      authenticateInPendoAndPostHog({
        diResolver,
      })
    )
  } catch (e) {
    // should never hit this block, since an error in attemptAuthentication should trigger the mutation error handler (onMutationError)
    throwLocallyLogInProd(diResolver, e as Error)
    return
  }

  noAwait(
    renderAppToBrowser({
      diResolver,
      styleOverrides: bloomGlobalStyles,
      generateRouter: generateBloomWebRouter,
    })
  )

  try {
    // initializes the online/offline status listeners
    getOnlineOfflineStatusListeners(diResolver)
  } catch (e) {
    throwLocallyLogInProd(diResolver, e as Error)
  }

  try {
    preloadSomethingWentWrongError(diResolver)
  } catch (e) {
    throwLocallyLogInProd(diResolver, e as Error)
  }
}

noAwait__UNSAFE(render())

async function attemptAuthentication(opts: {
  diResolver: IDIResolver
  generateMockData: boolean
}) {
  if (opts.generateMockData) return { orgUserId: '635126' }
  const mmGQLClient = getMMGQLClient(opts.diResolver)

  const r = await mmGQLClient.gqlClient.mutate({
    mutations: [
      gql`
        mutation {
          userId: getAuthenticatedUserId
        }
      `,
    ],
  })

  const orgUserId = r[0]?.data?.userId

  if (!orgUserId) {
    throw new Error('User is not authenticated')
  }

  return { orgUserId }
}

async function authenticateInPendoAndPostHog(opts: {
  diResolver: IDIResolver
}) {
  const { getAuthenticatedBloomUserQueryDefinition } = await import(
    '@mm/core-bloom/users/commonQueryDefinitions'
  )

  const mmGQLClient = getMMGQLClient(opts.diResolver)
  const { data } = await mmGQLClient.query(
    {
      user: getAuthenticatedBloomUserQueryDefinition({
        map: ({ id, currentOrgId }) => ({
          id,
          currentOrgId,
        }),
        diResolver: opts.diResolver,
      }),
    },
    {
      queryId: 'GetAuthenticatedBloomUserDataForPendoAndPostHog',
    }
  )

  if (posthog && data.user) {
    posthog.identify(`${data.user.id}`, {
      userId: data.user.id,
      orgId: data.user.currentOrgId,
    })
  }

  identifyPendoUser({
    diResolver: opts.diResolver,
    userId: data.user.id,
    orgId: data.user.currentOrgId,
  })
}

async function onQueryError(opts: {
  error: any
  diResolver: IDIResolver
  browserEnv: IMMBrowserEnvironment
}) {
  // same exact behavior for now
  onMutationError(opts)
}

async function onMutationError(opts: {
  error: any
  diResolver: IDIResolver
  browserEnv: IMMBrowserEnvironment
}) {
  // eslint-disable-next-line
  const _window = window

  const { error, diResolver, browserEnv } = opts

  if (opts.error.networkError?.statusCode === 401) {
    const currentUrl = encodeURIComponent(_window.location.href)
    return _window.location.replace(
      `${browserEnv.v1Url}Account/Login?ReturnUrl=${currentUrl}`
    )
  }

  getMMErrorLogger(diResolver).logError(error)
}
