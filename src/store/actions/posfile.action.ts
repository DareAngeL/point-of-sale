import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getLastTransaction = createAsyncThunk(
  "cashiering/lastTransaction",
  async () => {
    try {
      const response = await ApiService.get(`posfile/lastTransact`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getTotal = createAsyncThunk(
  "cashiering/total",
  async (filter?: string) => {
    try {
      const response = await ApiService.get(`posfile/total/${filter || ""}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getLessVatAdj = createAsyncThunk(
  "cashiering/lessVatAdj",
  async (ordercde?: string | "") => {
    try {
      const response = await ApiService.get(
        `posfile/total/${encodeURIComponent("Less Vat Adj.")}?${
          ordercde ? `ordercde=${ordercde}` : ""
        }`
      );

      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getServiceCharge = createAsyncThunk(
  "cashiering/serviceCharge",
  async (ordercde?: string | "") => {
    try {
      const response = await ApiService.get(
        `posfile/total/${encodeURIComponent("SERVICE CHARGE")}?${
          ordercde ? `ordercde=${ordercde}` : ""
        }`
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getPreviousVat = createAsyncThunk(
  "cashiering/previousVat",
  async (ordercde: string) => {
    try {
      const response = await ApiService.get(`posfile/previousVat/${ordercde}`);
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getVatExempt = createAsyncThunk(
  "cashiering/vatExempt",
  async (filter?: string) => {
    try {
      const response = await ApiService.get(`posfile/total/${filter || ""}`);
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getDiscountable = createAsyncThunk(
  "cashiering/discountable",
  async (filter?: string) => {
    try {
      const response = await ApiService.get(`posfile/total/${filter || ""}`);
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getPreviousTotal = createAsyncThunk(
  "cashiering/previousTotal",
  async (ordercde: string) => {
    try {
      const response = await ApiService.get(
        `posfile/previousTotal/${ordercde}`
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getAllPOSVoid = createAsyncThunk(
  "ordering/void",
  async (ordercde: string) => {
    try {
      const response = await ApiService.get(
        `posfile/getAllPosVoid/${ordercde}`
      );
      console.log("Hi", response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getPreviousRefundedPayment = createAsyncThunk(
  "cashiering/previousPayment",
  async (ordercde: string) => {
    try {
      const response = await ApiService.get(
        `posfile/previousRefundedPayment/${ordercde}`
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getPreviousTrnsactionPayment = createAsyncThunk(
  "cashiering/getPreviousTrnsactionPayment",
  async (ordercde: string) => {
    try {
      const response = await ApiService.get(
        `posfile/prevTransactionPayments/${ordercde}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getPreviousPosfiles = createAsyncThunk(
  "cashiering/previousPosfiles",
  async (ordercde: string) => {
    try {
      const response = await ApiService.get(
        `posfile/previousPosfiles/${ordercde}`
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

// export const getPrevius;

export const getPosfiles = createAsyncThunk(
  "posfile/posfileday",
  async (ordercde: string | undefined) => {
    try {
      const response = await ApiService.get(`posfile/day/${ordercde}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const deleteAllPosfileDiscounts = createAsyncThunk(
  "posfile/deleteAllPosfileDiscounts",
  async (ordercde: string) => {
    try {
      const response = await ApiService.delete(
        `posfile/discountDeleteAll/${ordercde}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getRemainingZread = createAsyncThunk(
  "posfile/remainingZread",
  async () => {
    try {
      const response = (await ApiService.get(`posfile/remainingZread`)) as any;
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getNonZReadData = createAsyncThunk(
  "posfile/zreading",
  async () => {
    try {
      const response = await ApiService.get("posfile/zreading");
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const hasCashfund = createAsyncThunk("posfile/hascashfund", async () => {
  try {
    const response = await ApiService.get("posfile/hascashfund");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const hasNoEOD = createAsyncThunk(
  "posfile/no_eod/:cashier",
  async (cashier: string) => {
    try {
      const response = await ApiService.get(`posfile/no_eod/${cashier}`);

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

// export const getPaymentByCode = createAsyncThunk(
//   "payment/detailsByCode",
//   async (ordercde: string) => {
//     const response = await ApiService.get(`posfile/paid/${ordercde}`);
//     console.log(response.data);
//     return response.data;
//   }
// );

// export const getChangeByCode = createAsyncThunk(
//   "change/detailsByCode",
//   async (ordercde: string) => {
//     const response = await ApiService.get(`posfile/paid/${ordercde}`);
//     console.log(response.data);
//     return response.data;
//   }
// );

export const getCashiers = createAsyncThunk("cashier/xread", async () => {
  try {
    const response = await ApiService.get(
      "posfile/filter?trnstat=1&_groupby=cashier&_includes=cashier"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const getLastCashFund = createAsyncThunk(
  "utilities/lastCashFund",
  async () => {
    try {
      const response = await ApiService.get(`posfile/getLastCashfund`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getHasTransactions = createAsyncThunk(
  "posfile/hasTransactions/get",
  async () => {
    try {
      const response = await ApiService.get(`posfile/hasTransactions`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getPreviousAll = createAsyncThunk(
  "posfile/previous/all",
  async (ordocnum: string) => {
    try {
      const response = await ApiService.get(
        `posfile/previousAll?ordocnum=${ordocnum}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

interface GetXReadPayload {
  usrname: string;
}
export const getXRead = createAsyncThunk(
  "xreadDetails/xread",
  async (payload: GetXReadPayload) => {
    const { usrname } = payload;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    try {
      const response = await ApiService.get(
        `xzreading/generate?cashier=${usrname}&range=true&datefrom=${formattedDate}&dateto=${formattedDate}`
      );
      return response.data;
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const previousZRead = createAsyncThunk(
  "posfile/previous-zread",
  async (trndte: string) => {
    try {
      const response = await ApiService.get(
        `managers-report/previous-zread?trndte=${trndte}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const zReadCount = createAsyncThunk(
  "posfile/zread-count",
  async (trndte: string) => {
    try {
      const response = await ApiService.get(
        `managers-report/count-zread?trndte=${trndte}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getAllCashfunds = createAsyncThunk(
  "posfile/all-cashfunds",
  async () => {
    try {
      const response = await ApiService.get(`posfile/getAllCashfunds`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getAllCashins = createAsyncThunk(
  "posfile/all-cashins",
  async () => {
    try {
      const response = await ApiService.get(`posfile/getAllCashins`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getAllCashouts = createAsyncThunk(
  "posfile/all-cashouts",
  async () => {
    try {
      const response = await ApiService.get(`posfile/getAllCashouts`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getAllCashDeclarations = createAsyncThunk(
  "posfile/all-cashdeclarations",
  async () => {
    try {
      const response = await ApiService.get(`posfile/getAllCashDeclarations`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const incrementReprintCount = createAsyncThunk(
  "posfile/increment-reprint-count",
  async (ordercde: string) => {
    try {
      const response = await ApiService.post(`posfile/reprintCount`, {
        ordercde,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const validatePosfile = createAsyncThunk(
  "posfile/validatePosfile",
  async () => {
    try {
      const response = await ApiService.get('posfile/validatePosfile');
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
)
