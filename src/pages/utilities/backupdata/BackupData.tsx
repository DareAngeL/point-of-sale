import {AuthFragment} from "./fragments/AuthFragment";
import {Confirmation} from "./fragments/Confirmation";
import {useEffect, useState} from "react";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import {toast} from "react-toastify";
import {useBackUpData} from "../../../hooks/backupData";
type Props = {};

enum FragmentType {
  AUTH,
  CONFIRMATION,
}

export default function BackupData({}: Props) {
  const {dispatch: dispatchModal} = useModal();
  const [fragmentType, setFragmentType] = useState<FragmentType>(
    FragmentType.AUTH
  );
  const {modalNameDispatch} = useChangeNameModal();
  const {handleBackupData} = useBackUpData();

  useEffect(() => {
    modalNameDispatch("Authorized User Only")
  }, [])

  const handleOnAuth = () => {
    setFragmentType(FragmentType.CONFIRMATION);
    modalNameDispatch("Create Database Backup");
  };

  const handleSubmit = async () => {
    const loadingToastId = toast.loading("Generating Backup...", {
      hideProgressBar: true,
      position: 'top-center',
    });
    handleBackupData();
    setTimeout(() => {
      toast.dismiss(loadingToastId);
    }, 1000);
    dispatchModal();
  };

  switch (fragmentType) {
    case FragmentType.AUTH:
      return <AuthFragment onAuth={handleOnAuth} />;
    case FragmentType.CONFIRMATION:
      return <Confirmation onSubmit={handleSubmit} />;

    default:
      return (
        <div>
          <h1>Backup Database</h1>
        </div>
      );
  }
}
