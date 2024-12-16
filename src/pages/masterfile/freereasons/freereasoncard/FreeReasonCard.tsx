import {useChangeNameModal, useModal} from "../../../../hooks/modalHooks";

interface FreeReasonProps {
  recid: number;
  freereason: string;
}

export function FreeReasonCard(props: FreeReasonProps) {
  const {dispatch} = useModal();
  const {modalNameDispatch} = useChangeNameModal();

  const onclick = () => {
    modalNameDispatch(props.freereason);
    dispatch();
  };

  return (
    <>
      <div
        className="flex flex-row justify-between mt-3 text-black h-[50px] shadow cursor-pointer"
        onClick={onclick}
      >
        {/* <div className=" p-3 flex items-center w-[50%]">
          <h4 className="">{props.recid}</h4>
        </div> */}
        <div className=" p-3 flex items-center w-[50%]">
          <h4 className="">{props.freereason}</h4>
        </div>
      </div>
    </>
  );
}
