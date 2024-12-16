import { useState } from "react";
import { WarningModal } from "../../../../../common/modal/WarningModal";
import { useModal } from "../../../../../hooks/modalHooks";

interface ClearSaveButtonsProps {
  onClear?: () => void;
  onSave: () => void;
  onCancel: () => void; //clear inputs and close
  hasPrint: boolean;
}

export function ClearSaveButtons(props: ClearSaveButtonsProps) {
  const { onClear, onSave, onCancel } = props;
  const { dispatch } = useModal();
  const [showWarningCancel, setShowWarningCancel] = useState(false);

  const handleCancel = () => {
    onCancel();
    dispatch();
  };

  return (
    <>
      {showWarningCancel && (
        <WarningModal
          modalName="Cancel"
          onYes={handleCancel}
          onNo={() => setShowWarningCancel(false)}
        />
      )}
      <div className="button-set-cont ainer flex justify-evenly mt-3">
        <button
          type="button"
          className="px-4 py-2 rounded border border-solid border-red-500 hover:bg-red-500 hover:text-white my-5 mxl-3"
          onClick={() => setShowWarningCancel(true)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
          onClick={onClear}
        >
          Clear
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded border border-solid border-green-500 hover:bg-green-500 hover:text-white my-5 mx-3"
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </>
  );
}
