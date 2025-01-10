// Note - this is the v1 url for launch day hardcoded, it had .append functionality that was not functional within v3.
// Aware this will break if v1 changes any of this, but since this is mvp we will just have to deal.
export const LAUNCH_DAY_HTML =
  '<br/><center><iframe src="https://files.learning.bloomgrowth.com/pdf/weekly-meeting-agenda.pdf#toolbar=0" width=824 height=1068 style="border:1px solid rgba(0,0,0,10%);box-shadow: 0 10px 10px 2px rgba(0,0,0,10%)"></iframe></center><span style="position: fixed;left: 43px;bottom: 40px;background: #cccccc;padding: 4px 12px;border-radius: 12px;font-size: 14px;color: #333;">FD pg 11-12</span>'

export const BLOOM_SPECIAL_SESSIONS_EXPANDED_PORTAL_OUT_ID =
  'BLOOM_SPECIAL_SESSIONS_EXPANDED_PORTAL_OUT_ID'

// Note - v1 hardcodes the height on the iframes which causes a double scroll bar issue.
// We have to correct that height based on the agenda collapsed state.
export const V1_IFRAME_HEIGHT_CALC_WITH_COLLAPSED_AGENDA = 'calc(100vh - 380px)'

export const V1_IFRAME_HEIGHT_CALC_WITH_EXPANDED_AGENDA = 'calc(100vh - 296px)'
