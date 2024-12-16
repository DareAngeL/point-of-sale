import {useChangeNameModal, useModal} from "../../../../hooks/modalHooks";

interface SpecialRequestProps {
  specialRequestName: string;
  isPage: false;
}

export function SpecialRequestCard(props: SpecialRequestProps) {
  const {dispatch} = useModal();
  const {modalNameDispatch} = useChangeNameModal();

  const onclick = () => {
    modalNameDispatch(props.specialRequestName);

    if (!props.isPage) {
      dispatch();
    }
  };

  return (
    <>
      <div className="">
        <div
          className="flex flex-col bg-slate-100 rounded border shadow-md mt-2 cursor-pointer text-[1.2rem] h-[50px]"
          onClick={onclick}
        >
          <h4 className="px-2 my-auto">{props.specialRequestName}</h4>
        </div>
      </div>
    </>
  );
}
