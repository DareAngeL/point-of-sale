import styled from "styled-components"

const LogoutBtnPreview = styled.button<{ $color: string }>`
  background-color: ${props => props.$color};

  &:hover {
    background-color: #f5f7f5;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color};
  }
`

const OrderingSelectedBtnPreview = styled.button<{ $color: string }>`
  background-color: ${props => props.$color};
  border: 1px solid ${props => props.$color};
`
const OrderingSelectedTextPreview = styled.button<{ $color: string }>`
  background-color: ${props => props.$color};
  color: white
`

const OrderingUnselectedBtnPreview = styled.button<{ $color: string }>`
  background-color: ${props => props.$color};
  border: 1px solid ${props => props.$color};
`
const OrderingUnselectedTextPreview = styled.button<{ $color: string }>`
  background-color: white;
  color: ${props => props.$color}
`

export function useComponentPreview() {

  return {
    LogoutBtnPreview,
    OrderingSelectedBtnPreview,
    OrderingSelectedTextPreview,
    OrderingUnselectedBtnPreview,
    OrderingUnselectedTextPreview
  }
}