// Note - the html content from v1 comes in with links as /L10/whatever without the v1 url embedded in it.
// This function prepends the v1 url to the src links so that they work in the iframe except for notes links.
export const prependV1UrlToSrc = (opts: {
  htmlString: string
  v1Url: string
}) => {
  const { htmlString, v1Url } = opts

  return htmlString.replaceAll(
    /src="(?!https:\/\/notes)\/?([^"]*)"/g,
    `src="${v1Url}$1"`
  )
}
