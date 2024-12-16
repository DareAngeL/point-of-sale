import { useChangeNameModal, useModal } from "../../../../hooks/modalHooks";

interface ReasonProps {
    reasonName : string;
    isPage : false;
}

export function ReasonCard(props : ReasonProps) {

    const {dispatch} = useModal();
    const {modalNameDispatch} = useChangeNameModal();

    const onclick = () =>{

        modalNameDispatch(props.reasonName);

        if(!props.isPage){
            dispatch();
        }
        
    }

    return (
        <>
        <div className="">
            <div className="flex flex-col bg-slate-100 rounded border shadow-md mt-2 cursor-pointer text-[1.2rem]" onClick={onclick}>
                <h4 className="px-2">{props.reasonName}</h4>
            </div>
        </div>
        </>
    )
}