import { setupBEIntegrationTests } from '@mm/core-bloom/_spec/setupBEIntegration'

const meetingId = '89861'

test(`a request for the data required for the meeting page works`, async () => {
  const { mmGQLClient, diResolver } = await setupBEIntegrationTests()
  const { getMeetingPageQuery } = await import('../meetingPageQuery')

  const data = await mmGQLClient.query(
    getMeetingPageQuery(diResolver)({
      meetingId,
    }),
    {
      queryId: 'meeting-page-query',
    }
  )

  expect(data).toMatchSnapshot('meeting-page-query-data')
})
