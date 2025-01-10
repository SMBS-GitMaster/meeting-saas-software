import { i18n } from '@mm/core/i18n'

import { BloomCustomTerms } from '@mm/core-bloom'

export function getContextAwareTodoText(terms: BloomCustomTerms) {
  return i18n.t('Create context-aware {{todo}}', {
    todo: terms.todo.lowercaseSingular,
  })
}

export function getContextAwareIssueText(terms: BloomCustomTerms) {
  return i18n.t('Create context-aware {{issue}}', {
    issue: terms.issue.lowercaseSingular,
  })
}
