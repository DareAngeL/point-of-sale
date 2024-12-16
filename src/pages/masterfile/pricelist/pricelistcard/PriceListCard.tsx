
interface PriceListProps {
    priceListName : string;
}

export function PriceListCard(props : PriceListProps) {

    // const {dispatch} = useModal();
    // const {modalNameDispatch} = useChangeNameModal();

    // const onclick = () =>{

    //     modalNameDispatch(props.priceListName);
    //     dispatch();
        
    // }

    return (
        <>
            <div className="flex flex-row justify-between mt-3 text-black h-[50px] shadow cursor-pointer">
                <div className=" p-3 flex items-center w-[50%]"><h4 className="">{props.priceListName}</h4></div>
            </div>
        </>
    )
}