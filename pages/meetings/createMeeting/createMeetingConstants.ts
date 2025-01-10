import { i18n } from '@mm/core/i18n'

export const userMeetingPermissionLevelOptions = [
  {
    text: i18n.t('Is admin'),
    selectedText: i18n.t('Is admin'),
    captionText: i18n.t(
      `Recommended for the meeting leader. Users have view and edit permissions, and can also edit this meeting's settings.`
    ),
    value: 'ADMIN',
  },
  {
    text: i18n.t('Has full edit'),
    selectedText: i18n.t('Has full edit'),
    captionText: i18n.t(
      'Users can view, create, and edit the content of this meeting.'
    ),
    value: 'EDIT',
  },
  {
    text: i18n.t('Can view'),
    selectedText: i18n.t('Can view'),
    captionText: i18n.t(
      'Users cannot create or edit the content of this meeting.'
    ),
    value: 'VIEW',
  },
]

export function getAgendaTypeOpts() {
  return [
    {
      text: i18n.t('Weekly meeting'),
      value: 'WEEKLY',
      captionText: i18n.t(
        'Default agenda includes check-in, goals, metrics, headlines, to-dos, issues, and wrap-up sections.'
      ),
    },
    {
      text: i18n.t('1:1 meeting'),
      value: 'ONE_ON_ONE',
      captionText: i18n.t(
        'Default agenda includes check-in, to-dos, issues, and wrap-up sections.'
      ),
    },
  ]
}

export function getMeetingTypeOpts() {
  return [
    {
      text: i18n.t('Leadership team'),
      value: 'LEADERSHIP',
    },
    {
      text: i18n.t('Departmental team'),
      value: 'DEPARTMENTAL',
    },
    {
      text: i18n.t('1:1 meeting'),
      value: 'ONE_ON_ONE',
    },
    {
      text: i18n.t('Other'),
      value: 'OTHER',
    },
  ]
}
