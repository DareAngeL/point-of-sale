import {toast} from "react-toastify";
import {useAppDispatch, useAppSelector} from "../store/store";
import {useUserActivityLog} from "./useractivitylogHooks";
import {METHODS, MODULES} from "../enums/activitylogs";
import { backupData } from "../store/actions/utilities/backupdata.action";

// let url = "http://localhost:8080/api/backupdatabase";

export const useBackUpData = () => {
  const {syspar} = useAppSelector((state) => state.masterfile);
  const {postActivity} = useUserActivityLog();
  const appDispatch = useAppDispatch();

  const {data} = syspar;
  const sysparData = data[0];

  const handleBackupData = async () => {
    const payload = {path: sysparData.dbbackup_pathfile};
    try {
      const resultBackup = await appDispatch(backupData(payload));

      if (resultBackup.meta.requestStatus !== "fulfilled") {
        toast.error("Failed to backup database.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 2000,
        });

        return false;
      }

      toast.success("Database Backup Successfully Saved.", {
        hideProgressBar: true,
        position: 'top-center',
      });

      postActivity({
        module: MODULES.BACKUP_DATA,
        method: METHODS.READ,
        remarks: "BACKUP DATABASE",
      });

      return true;
    } catch (error: any) {
      const {
        response: {
          data: {msg},
        },
      } = error;
      toast.error(msg, {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000,
      });

      return false;
    }
  };
  return {handleBackupData};
};
