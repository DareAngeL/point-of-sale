

import { DeleteFilled } from "@ant-design/icons";
import { useChangeNameModal, useModal } from "../../../../hooks/modalHooks";

interface DiscountProps {
    discountName : string;
    isPage : false;
}

export function DiscountCard(props : DiscountProps) {

    const {dispatch} = useModal();
    const {modalNameDispatch} = useChangeNameModal();

    const onclick = () =>{

        modalNameDispatch(props.discountName);

        if(!props.isPage){
            dispatch();
        }
        
    }

    return (
        <>
            <div className="">
                <div className="flex justify-between bg-slate-100 rounded border shadow-md mt-2 cursor-pointer text-[1.2rem] h-[50px]" onClick={onclick}>
                    <h4 className="px-2 my-auto">{props.discountName}</h4>
                    <DeleteFilled className="my-auto text-[1.5rem] text-red-400 mr-5"/>
                </div>
            </div>
        </>
    )
}