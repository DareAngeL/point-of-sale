import { DBSetupCard } from "./DBSetupCard";
import { useChangeNameModal } from "../../../hooks/modalHooks";
import { useState } from "react";
import { UpdateStructure } from "./UpdateStructure";
import { ClearMasterFile } from "./ClearMasterFile";
import { ClearTransaction } from "./ClearTransaction";

export function DBConfig() {
  const { modalNameDispatch } = useChangeNameModal();

  const [isUpdateStructure, setIsUpdateStructure] = useState(false);
  const [isClearMasterFile, setIsClearMasterFile] = useState(false);
  const [isClearTransaction, setIsClearTransaction] = useState(false);

  const onClearTransaction = () => {
    modalNameDispatch("Clear All Transaction");
    setIsClearTransaction(true);
  };

  const onClearMasterfile = () => {
    modalNameDispatch("List of Table to Update");
    setIsClearMasterFile(true);
  };

  const onUpdateStructure = () => {
    modalNameDispatch("Database Tables");
    setIsUpdateStructure(true);
  };

  return (
    <>
      {isUpdateStructure ? <UpdateStructure /> : <></>}
      {isClearMasterFile ? <ClearMasterFile /> : <></>}
      {isClearTransaction ? <ClearTransaction /> : <></>}

      {!isUpdateStructure && !isClearMasterFile && !isClearTransaction ? (
        <>
          <DBSetupCard name="Clear Transaction" onClick={onClearTransaction} />
          <DBSetupCard name="Clear Masterfile" onClick={onClearMasterfile} />
          <DBSetupCard name="Update Structure" onClick={onUpdateStructure} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
