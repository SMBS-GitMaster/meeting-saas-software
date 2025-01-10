// Note - v1 hardcodes the height on the iframes which causes a double scroll bar issue.
// We have to correct that height for only iframes that have the height hardcoded to calc(100vh - 130px).
export function correctIframeHardcodedHeight(opts: {
  htmlString: string
  iframeHeight: string
}) {
  const { htmlString, iframeHeight } = opts

  return htmlString.replace(
    /(<iframe[^>]*style="[^"]*height:)calc\(100vh - 130px\);/g,
    `$1${iframeHeight};`
  )
}
