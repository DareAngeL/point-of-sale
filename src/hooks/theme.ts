import styled from "styled-components";
import { useAppSelector } from "../store/store";

// put outside the rendering component to avoid performance issue
const ButtonStyled = styled.button<{ $color: string; $noHoverEffect?: boolean; }>`
  background-color: ${props => props.$color};
  color: white;
  border: 2px solid ${props => props.$color};

  &:hover {
    background-color: ${props => props.$noHoverEffect ? props.$color : '#f5f7f5'};
    color: ${props => props.$noHoverEffect ? 'white' : props.$color};
  }
`

const OutlinedButtonStyled = styled.button<{ $color: string; }>`
  background-color: white;
  color: ${props => props.$color};
  border: 2px solid ${props => props.$color};

  &:hover {
    background-color: ${props => props.$color};
    color: white;
  }

`

const EyeOutlineStyled = styled.div<{ $color: string; }>`
  color: ${props => props.$color};
`

const ButtonTextStyled = styled.div<{ $color: string; }>`
    color: white;
  
    &:hover {
      color: ${props => props.$color};
    }
  `

const DisabledButtonStyled = styled.button`
  background-color: #d1d5db;
  color: white;
`

export function useTheme() {

  const { theme } = useAppSelector((state) => state.page);
 
  return {
    ButtonStyled,
    OutlinedButtonStyled,
    ButtonTextStyled,
    EyeOutlineStyled,
    DisabledButtonStyled,
    theme
  }
}