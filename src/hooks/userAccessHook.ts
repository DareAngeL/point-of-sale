import {useLocation} from "react-router";
import {useAppSelector} from "../store/store";

export enum UserAccessActions {
  ADD = "ADD",
  DELETE = "DELETE",
  EDIT = "EDIT",
  IMPORT = "IMPORT",
  PRINT = "PRINT",
  RESEND = "RESEND",
  VOID = "VOID",
}

export function useUserAccessHook() {
  const {account, useraccessfiles} = useAppSelector((state) => state.account);

  const {search} = useLocation();

  const orderingAccessMenfields = {
    removeitem: "cashiering_removeitem",
    adddiscount: "cashiering_adddiscount",
    freeitem: "cashiering_freeitem",
    freetransaction: "cashiering_freetransaction",
    priceoverride: "cashiering_priceoverride",
    canceltransaction: "cashiering_canceltransaction",
    reprinttransaction: "cashiering_reprinttransaction",
    reprintvoid: "cashiering_reprintvoid",
    voidtran: "cashiering_voidtran",
    recalltran: "cashiering_recalltran",
    zreading: "cashiering_zreading",
  };

  const isRootUser = () => account.data?.usrtyp === "ROOT";

  const hasActionAccess = (action: UserAccessActions) =>
    isRootUser() ||
    getAllowedAccessActions().find((a) => a === action) !== undefined;

  const hasAccess = (access: any) => {
    let hasAccess = false;
    for (const key in access) {
      if (key.includes("allow")) {
        hasAccess = access[key] === 1;
        if (hasAccess) break;
      }
    }

    return hasAccess;
  };

  const getAllowedAccessActions = () => {
    const allowedActions: UserAccessActions[] = [];

    const menfield = search.split("=")[1];
    const access = useraccessfiles.find(
      (a: any) => a.menfield === menfield
    ) as any;

    for (const key in access) {
      if (key.includes("allow")) {
        const hasAccess = access[key] === 1;
        if (hasAccess) {
          const access = key.replace("allow", "");

          switch (access.toLocaleUpperCase()) {
            case UserAccessActions.ADD:
              allowedActions.push(UserAccessActions.ADD);
              break;
            case UserAccessActions.DELETE:
              allowedActions.push(UserAccessActions.DELETE);
              break;
            case UserAccessActions.EDIT:
              allowedActions.push(UserAccessActions.EDIT);
              break;
            case UserAccessActions.IMPORT:
              allowedActions.push(UserAccessActions.IMPORT);
              break;
            case UserAccessActions.PRINT:
              allowedActions.push(UserAccessActions.PRINT);
              break;
            case UserAccessActions.RESEND:
              allowedActions.push(UserAccessActions.RESEND);
              break;
            case UserAccessActions.VOID:
              allowedActions.push(UserAccessActions.VOID);
              break;
          }
        }
      }
    }

    return allowedActions;
  };

  return {
    hasAccess,
    isRootUser,
    hasActionAccess,
    useraccessfiles,
    orderingAccessMenfields,
  };
}
