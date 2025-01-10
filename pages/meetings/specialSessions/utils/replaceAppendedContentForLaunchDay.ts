import { LAUNCH_DAY_HTML } from '../constants'

// HACK ALERT! So this is hacky but stored in LAUNCH_DAY_HTML is the html content from v1 subheading for launch day
// without the .append functionality. This is the only speical session page that has this functionality.
// Aware this will break if v1 changes any of this, but since this is mvp we will just have to deal.
export const replaceAppendedContentForLaunchDay = (htmlString: string) => {
  if (
    htmlString.includes(
      '<script> $(".meeting-page .component").hide();   $(".meeting-page").append('
    )
  ) {
    return LAUNCH_DAY_HTML
  }

  return htmlString
}
