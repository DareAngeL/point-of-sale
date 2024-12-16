import {useAppSelector} from "../store/store";
import {METHODS, MODULES} from "../enums/activitylogs";
import moment from "moment";
import {useService} from "./reportHooks";
import {findChangedProperties} from "../helper/Comparison";

interface Data {
  method: METHODS;
  module: MODULES;
  remarks: String;
}

interface ActionData {
  module: MODULES;
  remarks: String;
}

interface UpdateData {
  changeData: {} | undefined;
  originalData: {} | undefined;
  module: MODULES;
}

export const useUserActivityLog = () => {
  const {account} = useAppSelector((state) => state.account);
  const {postData} = useService();

  const postActivity = async (data: Data) => {
    console.log("POSTING");

    const {data: user} = account;
    const payloadData = {
      ...data,
      usrname: user?.usrname,
      usrcde: user?.usrcde,
      //   change this if necessary got problem with timezone
      // trndte: moment().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss"),
      // trndte: moment().add(8, "hours").format("YYYY-MM-DD HH:mm:ss"),
      trndte: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    console.log(data);
    console.log(payloadData);

    postData("useractivitylog", payloadData, async (res: any, error) => {
      if (!res.data.success) {
        console.log("success");
        console.log(res);
      } else {
        console.log("error");
        console.log(error);
      }
    });
  };

  const createAction = (data: ActionData) => {
    const finalCreateData = {method: METHODS.CREATE, ...data};
    console.log(finalCreateData);
    postActivity(finalCreateData);
  };

  const updateAction = (
    updateData: UpdateData,
    item?: {itemName: string | undefined; itemCode?: string | undefined}
  ) => {
    const {changeData, originalData, module} = updateData;

    console.log(originalData);
    console.log(changeData);

    let data = {
      method: METHODS.UPDATE,
      module: module,
      remarks: "",
    };
    const changedValues = findChangedProperties(originalData, changeData);

    console.log(changedValues, "FINAL");

    data.remarks = item?.itemCode
      ? `UPDATED ${item?.itemName} | ${item?.itemCode}:\n`
      : `UPDATED ${item?.itemName}:\n`;
    let changedRemarks = "";

    changedValues.forEach((item: any) => {
      if (Array.isArray(item.previousValue)) {
        changedRemarks += `ITEM SUB CHANGES\n`;
      } else {
        changedRemarks += `${item.property}: ${item.previousValue} to ${item.currentValue},\n`;
      }
    });
    changedRemarks = changedRemarks.slice(0, -2);
    console.log(changedRemarks);

    data.remarks += changedRemarks;
    if (changedRemarks.length > 0) {
      postActivity(data);
    }
  };

  const deleteAction = (data: ActionData) => {
    const finalDeleteData = {method: METHODS.DELETE, ...data};
    console.log(finalDeleteData);
    postActivity(finalDeleteData);
  };
  const printAction = (module: MODULES) => {
    const data = {
      method: METHODS.PRINT,
      module: module,
      remarks: `PRINTED: ${module}`,
    };
    console.log(data);
    postActivity(data);
  };

  return {postActivity, createAction, updateAction, deleteAction, printAction};
};
