import { useNavigate } from "react-router";
import { useModal } from "../../../../hooks/modalHooks";

export function InformFragment() {

  const { dispatch } = useModal();
  const navigate = useNavigate();

  const onOkay = () => {
    dispatch();
    navigate(-1);
  }

  return (
    <>
      <p className="mx-5">Unable to proceed. There are still pending order</p>
      <div className="w-full flex justify-center">
        <button
          type="button"
          className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
          onClick={onOkay}
        >
          Okay
        </button>
      </div>
    </>
  );
}
