import { observer } from 'mobx-react'
import React from 'react'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import { useBloomMeetingMutations } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { ITitlePageSectionContainerProps } from '@mm/bloom-web/titlePage/titlePageSectionTypes'
import { TitlePageSectionView } from '@mm/bloom-web/titlePage/titlePageSectionView'

export const TitlePageSection = observer(function TitlePageSection(
  props: ITitlePageSectionContainerProps
) {
  const { openOverlazy } = useOverlazyController()

  const { editMeetingPage } = useBloomMeetingMutations()
  const { t } = useTranslation()

  const onSubmit = React.useCallback(
    async (subheading: Maybe<string>) => {
      try {
        await editMeetingPage({
          meetingPageId: props.data.id,
          subheading,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Issue updating the title page'),
          error: new UserActionError(error),
        })
      }
    },
    [props.data.id, editMeetingPage, openOverlazy, t]
  )

  return (
    <TitlePageSectionView
      data={{
        isLoading: props.data.isLoading,
        isMeetingOngoing: props.data.isMeetingOngoing,
        subheading: props.data.subheading,
        pageName: props.data.pageName,
      }}
      className={props.className}
      actionHandlers={{
        onSubmit,
      }}
    />
  )
})
