import { useChangeNameModal, useModal } from "../../../../hooks/modalHooks";

interface ItemSubclassificationProps {
    itemSubclassificationName : string;
    itemClassificationName: string | undefined;

}

export function ItemSubclassificationCard(props : ItemSubclassificationProps) {

    const {dispatch} = useModal();
    const {modalNameDispatch} = useChangeNameModal();

    const onclick = () =>{

        modalNameDispatch(props.itemSubclassificationName);
        dispatch();
        
    }

    return (
        <>
            <div className="flex flex-row justify-between mt-3 text-black h-[50px] shadow cursor-pointer" onClick={onclick}>
                <div className=" p-3 flex items-center w-[50%]"><h4 className="">{props.itemSubclassificationName}</h4></div>
                <div className=" p-3 flex items-center w-[50%]"><h4 className="">{props.itemClassificationName}</h4></div>
                
            </div>
        </>
    )
}