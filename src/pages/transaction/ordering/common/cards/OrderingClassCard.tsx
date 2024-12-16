import styled from "styled-components";

interface OrderingClassCardProps {
  description: string;
  selected: boolean;
  disable?: boolean;
  color: string;
}

const EnabledDivStyled = styled.div<{ $color: string }>`
    background-color: ${props => props.$color};
    border: 1px solid ${props => props.$color};
  `
  const DisabledDivStyled = styled.div`
    background-color: #f5f7f5;
  `
  
  const EnabledTextStyled = styled.h1<{ $color: string }>`
    color: ${props => props.$color};
    background-color: white;

    &:hover {
      color: white;
      background-color: ${props => props.$color};
    }
  `
  const EnabledSelectedTextStyled = styled.h1<{ $color: string }>`
    color: white;
    background-color: ${props => props.$color};
  `
  const DisabledTextStyled = styled.h1`
    color: #64748b;
  `

export function OrderingClassCard(props: OrderingClassCardProps) {

  if (props.selected) {
    return (
      <>
        <EnabledDivStyled $color={props.color}
          className={`flex justify-center pb-[1px] rounded w-auto font-semibold h-7 flex-none overflow-hidden cursor-pointer select-none min-w-0 transition-all duration-300 ease-in-out`}
        >
          <EnabledSelectedTextStyled $color={props.color}
            className={`rounded px-1 ms-[1px] text-ellipsis whitespace-nowrap overflow-hidden px-2 transition-all duration-300 ease-in-out`}>
            {props.description}
          </EnabledSelectedTextStyled>
        </EnabledDivStyled>
      </>
    )
  }

  return (
    <>
      {props.disable && (
        <DisabledDivStyled
          className={`flex justify-center pb-[1px] rounded w-auto font-semibold h-7 flex-none overflow-hidden cursor-pointer select-none min-w-0 transition-all duration-300 ease-in-out`}
        >
          <DisabledTextStyled className={`${props.selected?'bg-blue-700 text-white':'bg-white'} rounded px-1 ms-[1px] text-ellipsis whitespace-nowrap overflow-hidden px-2 transition-all duration-300 ease-in-out ${!props.disable && 'hover:bg-blue-700 hover:text-white'}`}>
            {props.description}
          </DisabledTextStyled>
        </DisabledDivStyled>
      )}

      {!props.disable && (
        <EnabledDivStyled $color={props.color}
          className={`flex justify-center pb-[1px] rounded w-auto font-semibold h-7 flex-none overflow-hidden cursor-pointer select-none min-w-0 transition-all duration-300 ease-in-out`}
        >
          <EnabledTextStyled $color={props.color} 
            className={`rounded px-1 ms-[1px] text-ellipsis whitespace-nowrap overflow-hidden px-2 transition-all duration-300 ease-in-out`}>
            {props.description}
          </EnabledTextStyled>
        </EnabledDivStyled>
      )}
      
    </>
  );
}
