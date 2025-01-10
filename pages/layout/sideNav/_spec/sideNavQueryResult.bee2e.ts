import { setupBEIntegrationTests } from '@mm/core-bloom/_spec/setupBEIntegration'

test(`a request for the data required for the side nav works`, async () => {
  const { mmGQLClient, diResolver } = await setupBEIntegrationTests()
  const { getSideNavQuery } = await import('../sideNavQuery')

  const response = await mmGQLClient.query(getSideNavQuery(diResolver), {
    queryId: 'sidenav-query',
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete response.data.user.supportContactCode

  expect(response).toMatchSnapshot('side-nav-data')
})
