import { useNavigate } from "react-router";

interface NoCashDeclarationProps {
  modalDispatch: () => void;
}

export function NoCashDeclaration(props: NoCashDeclarationProps) {

  const Navigate = useNavigate();

  return (
    <div className="flex flex-col align-center justify-center text-center">
      <h3 className="text-red-500 font-bold">
        Cash Declaration has not been performed!
      </h3>
      <button
        onClick={() => {
          props.modalDispatch();
          Navigate("/pages/cashiering");
        }}
        type="button"
        className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
      >
        GO TO CASH DECLARATION
      </button>
    </div>
  )
}