import {ArrowLeftOutlined} from "@ant-design/icons";
import {To, useNavigate} from "react-router";

interface BackButtonProps{
  onClick? : ()=> void;
  navigateTo?: To;
}


export function BackButton(props : BackButtonProps) {

  const Navigate = useNavigate();
  const url = props.navigateTo || -1;

  return (
    <>
      <div className="flex justify-center items-center w-[50px] cursor-pointer " onClick={() =>{
        Navigate(url as To)
        
        if(props.onClick){
          props.onClick();
        }
      } }>
        <ArrowLeftOutlined className="text-[1.5rem]" />
      </div>
    </>
  );
}
