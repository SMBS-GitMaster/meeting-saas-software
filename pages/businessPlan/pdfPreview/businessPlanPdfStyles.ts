import { css } from 'styled-components'

export const A4PortraitPrintPreviewStyles = css`
  max-width: 210mm;
  width: 210mm;
  border: ${(props) => props.theme.sizes.smallSolidBorder}
    ${(props) => props.theme.colors.cardBorderColor};
  border-bottom: none;
  border-radius: ${(props) => props.theme.sizes.br1};
  box-shadow: ${(props) => props.theme.sizes.bs1Inset};
  background-color: ${(props) => props.theme.colors.cardBackgroundColor};

  @page {
    size: A4 portrait;
    margin: 0;
  }
`

export const A4LandscapePrintPreviewStyles = css`
  max-width: 297mm;
  width: 297mm;
  border: ${(props) => props.theme.sizes.smallSolidBorder}
    ${(props) => props.theme.colors.cardBorderColor};
  border-bottom: none;
  border-radius: ${(props) => props.theme.sizes.br1};
  box-shadow: ${(props) => props.theme.sizes.bs1Inset};
  background-color: ${(props) => props.theme.colors.cardBackgroundColor};

  @page {
    size: A4 landscape;
    margin: 0;
  }
`
