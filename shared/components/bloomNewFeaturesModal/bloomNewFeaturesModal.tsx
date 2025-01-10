import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { Modal, responsiveCSS, toREM } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useBloomPostMessage } from '../../hooks/useBloomPostMessage'
import {
  getFeatureToSectionMap,
  getIndexedFeatureArray,
} from './bloomNewFeaturesModalConstants'
import { BloomNewFeaturesModalContent } from './bloomNewFeaturesModalContent'
import { BloomNewFeaturesModalNav } from './bloomNewFeaturesModalNav'
import {
  TBloomNewFeatureModalFeature,
  TBloomNewFeatureModalNavSection,
} from './bloomNewFeaturesModalTypes'

interface IBloomNewFeaturesModalProps {
  isAutoOpened?: boolean
  onClose?: () => void
}

export const BloomNewFeaturesModal = observer(function BloomNewFeaturesModal(
  props: IBloomNewFeaturesModalProps
) {
  const [expandedSection, setExpandedSection] =
    useState<Maybe<TBloomNewFeatureModalNavSection>>(null)

  const [selectedFeature, setSelectedFeature] =
    useState<TBloomNewFeatureModalFeature>('WELCOME')

  const { closeOverlazy } = useOverlazyController()

  const { sendMessage } = useBloomPostMessage()

  const terms = useBloomCustomTerms()
  const INDEXED_FEATURE_ARRAY = getIndexedFeatureArray(terms)
  const FEATURE_TO_SECTION_MAP = getFeatureToSectionMap(terms)

  function onContentScrolled(direction: 'UP' | 'DOWN') {
    const currentFeatureIndex = INDEXED_FEATURE_ARRAY.findIndex(
      (indexedFeature) => indexedFeature === selectedFeature
    )
    if (currentFeatureIndex !== -1) {
      const newIndex =
        direction === 'UP' ? currentFeatureIndex - 1 : currentFeatureIndex + 1
      if (newIndex > -1 && newIndex <= INDEXED_FEATURE_ARRAY.length - 1) {
        const newFeature = INDEXED_FEATURE_ARRAY[newIndex]
        setSelectedFeature(newFeature)
        setExpandedSection(FEATURE_TO_SECTION_MAP[newFeature])
      }
    }
  }

  const onCloseModal = () => {
    if (props.onClose) props.onClose()
    closeOverlazy({
      type: 'Modal',
      name: 'BloomNewFeaturesModal',
    })
    sendMessage({
      popup: 'featureModal',
      isOpen: false,
    })
  }

  return (
    <Modal
      id={'BloomNewFeaturesModal'}
      onHide={onCloseModal}
      contentCss={css`
        border-radius: ${toREM(10)};
        width: ${toREM(1050)};

        ${responsiveCSS({
          s: css`
            width: ${toREM(1050)};
            max-width: ${toREM(1050)};
          `,
          m: css`
            width: ${toREM(1050)};
            max-width: ${toREM(1050)};
          `,
        })};
      `}
    >
      <Modal.Body
        css={css`
          display: flex;
          padding: 0;
        `}
      >
        <BloomNewFeaturesModalNav
          expandedSection={expandedSection}
          selectedFeature={selectedFeature}
          isAutoOpened={props.isAutoOpened}
          sectionClicked={setExpandedSection}
          featureClicked={setSelectedFeature}
        />
        <BloomNewFeaturesModalContent
          selectedFeature={selectedFeature}
          scrolled={onContentScrolled}
          onClose={onCloseModal}
        />
      </Modal.Body>
    </Modal>
  )
})

export default BloomNewFeaturesModal
