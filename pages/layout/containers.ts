import styled from 'styled-components'

import { NO_SCROLL_CLASS } from './consts'

export const StyledPageContainer = styled.div`
  display: flex;
  position: relative;
  height: 100vh;
  background-color: ${(props) => props.theme.colors.bodyBackgroundColor};
`

export const StyledContentContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  overflow-x: hidden;
  flex-direction: column;

  @media print {
    height: auto;
    overflow-y: visible;
    overflow-x: visible;
  }
`

export const StyledChildrenContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: flex-start;
  &:has(.${NO_SCROLL_CLASS}) {
    overflow-y: hidden;
  }

  @media print {
    height: auto;
    overflow-y: visible;
    overflow-x: visible;
  }
`
