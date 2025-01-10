import React from 'react'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { Text, TextEllipsis } from '@mm/core-web/ui'

interface IMilestoneCountLabelProps {
  quantity: number
  hideLabel?: boolean
  ellipsisText?: boolean
}

export const MilestoneCountLabel = (props: IMilestoneCountLabelProps) => {
  const terms = useBloomCustomTerms()

  const hideLabel = props.hideLabel || false
  const ellipsisText = props.ellipsisText || false

  const milestonePluralizationText = {
    singular: `${props.quantity} ${
      hideLabel ? '' : terms.milestone.lowercaseSingular
    }`,
    plural: `${props.quantity} ${
      hideLabel ? '' : terms.milestone.lowercasePlural
    }`,
  }

  //https://winterinternational.atlassian.net/browse/TTD-2236 remove the const key variable once it is confirmed that the script to generate the translation files is working.

  const text =
    props.quantity === 1
      ? milestonePluralizationText.singular
      : milestonePluralizationText.plural

  if (ellipsisText) {
    return <TextEllipsis lineLimit={1}>{text}</TextEllipsis>
  } else {
    return <Text>{text}</Text>
  }
}
