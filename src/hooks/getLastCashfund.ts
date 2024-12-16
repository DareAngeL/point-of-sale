import { useAppDispatch } from "../store/store";
import { getLastCashFund } from "../store/actions/posfile.action";

export const useGetlastCashFund = () => {
  const appDispatch = useAppDispatch();

  const lastCashFund = async () => {
    try {
      const response = await appDispatch(getLastCashFund())
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return {lastCashFund: lastCashFund};
};
