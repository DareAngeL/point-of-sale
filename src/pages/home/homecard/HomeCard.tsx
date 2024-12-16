import {ReactNode} from "react";
import "./HomeCard.css";
import styled from 'styled-components';

interface HomeCardProps {
  title: string;
  children?: ReactNode;
  primaryColor: string;
  disable: boolean;
}

// put outside the rendering component to avoid performance issue
const StyledHomeCard = styled.div<{ $color: string; }>`
  color: ${props => props.$color}
`

export function HomeCard(props: HomeCardProps) {

  return (
    <>
      <StyledHomeCard $color={props.primaryColor}
        className={`${
          props.disable && `pointer-events-none bg-gray-300`
        } box-parent w-[300px] h-[300px] hover:bg-[#f5f7f5] active:bg-slate-200 shadow-lg flex flex-col justify-center items-center cursor-pointer`}
      >
        {props.children}
        {/* <ShoppingCartOutlined className="animation text-[5rem] text-slate-500"/> */}
        <div className=" font-montserrat mt-5 ">{props.title}</div>
      </StyledHomeCard>
    </>
  );
}
