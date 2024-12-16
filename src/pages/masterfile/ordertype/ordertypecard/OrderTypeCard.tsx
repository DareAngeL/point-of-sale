import { useChangeNameModal, useModal } from "../../../../hooks/modalHooks";


interface OrderTypeProps {
    dineTypeName : string;
    orderTypeName : string;
}

export function DineTypeCard(props : OrderTypeProps) {

    const {dispatch} = useModal();
    const {modalNameDispatch} = useChangeNameModal();

    const onclick = () =>{

        modalNameDispatch(props.dineTypeName);
        dispatch();
        
    }

    return (
        <>
            <div className="flex flex-row justify-between mt-3 text-black h-[50px] shadow cursor-pointer" onClick={onclick}>
                <div className=" p-3 flex items-center w-[50%]"><h4 className="">{props.dineTypeName}</h4></div>
                <div className=" p-3 flex items-center w-[50%]"><h4 className="">{props.orderTypeName}</h4></div>
            </div>
        </>
    )
}