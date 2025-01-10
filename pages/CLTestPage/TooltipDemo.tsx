import React from 'react'

import { Expandable, Tooltip } from '@mm/core-web/ui'

export function TooltipDemo() {
  return (
    <Expandable title='Tooltips'>
      <>
        <Tooltip position='top center' msg={'Tooltip content'}>
          <span
            css={`
              margin-left: 160px;
              padding: 8px 8px 0 0;
            `}
          >
            Top
          </span>
        </Tooltip>
        <br />
        <Tooltip position='top left' msg={'Tooltip content'}>
          <div
            css={`
              width: 300px;
              background: salmon;
              margin-left: 160px;
              padding: 8px 0;
            `}
          >
            Top left
          </div>
        </Tooltip>
        <Tooltip position='top right' msg={'Tooltip content'}>
          <div
            css={`
              width: 300px;
              background: salmon;
              padding: 8px 0;
            `}
          >
            Top right
          </div>
        </Tooltip>
        <br />
        <Tooltip position='left center' msg={'Tooltip content'}>
          <span
            css={`
              margin-left: 160px;
              padding: 8px;
            `}
          >
            Left
          </span>
        </Tooltip>
        <br />
        <Tooltip
          position='left top'
          msg={
            <span
              css={`
                display: block;
                height: 50px;
              `}
            >
              Tooltip content
            </span>
          }
        >
          <span
            css={`
              background: salmon;
              display: block;
              margin-left: 160px;
              padding: 8px 0;
              width: 300px;
            `}
          >
            Left Top
          </span>
        </Tooltip>
        <Tooltip
          position='left bottom'
          msg={
            <span
              css={`
                display: block;
                height: 50px;
              `}
            >
              Tooltip content
            </span>
          }
        >
          <span
            css={`
              background: salmon;
              display: block;
              margin-left: 160px;
              padding: 8px 0;
              width: 300px;
            `}
          >
            Left Bottom
          </span>
        </Tooltip>
        <Tooltip position='right center' msg={'Tooltip content'}>
          <span
            css={`
              padding: 8px 8px 0 0;
            `}
          >
            Right
          </span>
        </Tooltip>
        <Tooltip
          position='right top'
          msg={
            <span
              css={`
                display: block;
                height: 50px;
              `}
            >
              Tooltip content
            </span>
          }
        >
          <span
            css={`
              background: salmon;
              display: block;
              padding: 8px 0;
              width: 300px;
            `}
          >
            Right Top
          </span>
        </Tooltip>
        <Tooltip
          position='right bottom'
          msg={
            <span
              css={`
                display: block;
                height: 50px;
              `}
            >
              Tooltip content
            </span>
          }
        >
          <span
            css={`
              background: salmon;
              display: block;
              padding: 8px 0;
              width: 300px;
            `}
          >
            Right Bottom
          </span>
        </Tooltip>
        <Tooltip position='bottom center' msg={'Tooltip content'}>
          <span
            css={`
              margin-left: 160px;
              padding: 8px 8px 0 0;
            `}
          >
            Bottom
          </span>
        </Tooltip>
        <br />
        <Tooltip position='bottom right' msg={'Tooltip content'}>
          <div
            css={`
              width: 300px;
              background: salmon;
              padding: 8px 0;
            `}
          >
            Bottom right
          </div>
        </Tooltip>
        <br />
        <Tooltip position='bottom left' msg={'Tooltip content'}>
          <div
            css={`
              width: 300px;
              background: salmon;
              margin-left: 160px;
              padding: 8px 0;
            `}
          >
            Bottom left
          </div>
        </Tooltip>
        <br />
        <Tooltip msg={'Tooltip content'} trigger='click'>
          <span
            css={`
              cursor: pointer;
              padding: 8px 0;
            `}
          >
            Triggered by click
          </span>
        </Tooltip>
        <br />
        <Tooltip msg={'Tooltip content'} type='light'>
          <span
            css={`
              padding: 8px 0;
            `}
          >
            Light type
          </span>
        </Tooltip>
        <br />
        <Tooltip msg={'Tooltip content'} type='lighter'>
          <span
            css={`
              padding: 8px 0;
            `}
          >
            Lighter type
          </span>
        </Tooltip>
      </>
    </Expandable>
  )
}
