import styled from "styled-components";

interface OrderingItemCardProps {
  description: string | undefined;
  color: string;
}

const ButtonDiv = styled.div<{ $color: string }>`
  background-color: ${props => props.$color};
  border: 1px solid ${props => props.$color};
`
const ButtonText = styled.p<{ $color: string }>`
  color: ${props => props.$color};
  background-color: white;

  &:hover {
    color: white;
    background-color: ${props => props.$color};
  }
`

export function OrderingItemCard(props: OrderingItemCardProps) {

  return (
    <>
      <ButtonDiv $color={props.color} className="flex w-[200px] justify-center rounded border shadow-md select-none h-full mx-2 pb-[2px] cursor-pointer text-wrap">
        <ButtonText $color={props.color} className="rounded text-center w-[200px] h-full px-1 ms-[2px] text-ellipsis overflow-hidden transition-all duration-300 ease-in-out">
          {props.description}
        </ButtonText>
      </ButtonDiv>
    </>
  );
}
