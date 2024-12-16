import { useChangeNameModal, useModal } from "../../../../hooks/modalHooks";


interface CardTypeProps {
    cardTypeName : string;
}

export function CardTypeCard(props : CardTypeProps) {

    const {dispatch} = useModal();
    const {modalNameDispatch} = useChangeNameModal();

    const onclick = () =>{

        modalNameDispatch(props.cardTypeName);
        dispatch();
        
    }

    return (
        <>
            <div className="flex flex-row justify-between mt-3 text-black h-[50px] shadow cursor-pointer" onClick={onclick}>
                <div className=" p-3 flex items-center w-[50%]"><h4 className="">{props.cardTypeName}</h4></div>
            </div>
        </>
    )
}