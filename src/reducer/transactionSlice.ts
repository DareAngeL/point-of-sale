import {createSlice} from "@reduxjs/toolkit";
import {cashieringDeclarationData} from "../data/cashieringdata";
import {computeTotal} from "../helper/transaction";
import {PosfileModel} from "../models/posfile";
import {CashieringTransactType} from "../pages/transaction/cashiering/cashieringEnums";
import { getLastCashFund, getLastTransaction, hasCashfund, hasNoEOD } from "../store/actions/posfile.action";
import { getAllActiveHoldTransactions } from "../store/actions/transaction.action";

interface TransactionState {
  isZRead: boolean;
  noEOD: {
    NOEOD: boolean;
    from: string;
    to: string;
  };
  lastTransaction: {
    trntyp: CashieringTransactType | string;
  };
  isEnd: boolean,
  allHoldTransactions: {
    data: {
      count: number;
      rows: any;
    };
  };
  denom: any;
  cashDeclarationTotal: number;
  hasCashFund: {
    data: PosfileModel | null;
    hasFund: boolean;
  };
  cashDeclared: boolean;
  receiptData: any;
  reason: string;
  cashieringType: string;
  cashTotal: number;
  lastCashFund: PosfileModel | null;
  isLoading: boolean;
  reprintCashiering: {
    type: 'cashfund' | 'cashin' | 'cashout' | 'cashdeclaration' | 'none';
    data: PosfileModel | null;
  }
}

const initialState: TransactionState = {
  isZRead: true,
  noEOD: {
    NOEOD: false,
    from: "",
    to: "",
  },
  denom: cashieringDeclarationData,
  cashDeclarationTotal: 0,
  cashDeclared: false,
  lastTransaction: {
    trntyp: "",
  },
  hasCashFund: {
    data: null,
    hasFund: false,
  },
  receiptData: null,
  reason: "",
  cashieringType: "CASH DECLARATION",
  cashTotal: 0,
  lastCashFund: null,
  isEnd: false,
  isLoading: true,
  allHoldTransactions: {
    data: {
      count: 0,
      rows: [],
    }
  },
  reprintCashiering: {
    type: 'none',
    data: null
  }
};

const transactionSlice = createSlice({
  name: "cashiering",
  initialState,
  reducers: {
    setReprintCashiering: (state, action) => {
      state.reprintCashiering = action.payload;
    },
    resetLoading: (state) => {
      console.log("natawag nang natawag tong reset loading...");
      state.isLoading = true;
    },
    removeLoading: (state) => {
      
      state.isLoading = false;
    },
    toggleZRead: (state) => {
      state.isZRead = !state.isZRead;
    },
    setLastTransaction: (state, action) => {
      state.lastTransaction = action.payload;
    },
    setIsEnd: (state, action) => {
      state.isEnd = action.payload;
    },
    setDenom: (state, action) => {
      const {isAdd, name} = action.payload;

      state.denom.forEach((item: any, index: number) => {
        const {value, quantity} = item;

        if (isAdd) {
          if (value === name) {
            const updatedItem = [...state.denom];
            updatedItem[index].quantity++;
            console.log(quantity, value);
            updatedItem[index].total =
              updatedItem[index].quantity *
              parseFloat(updatedItem[index].value);

            state.cashDeclarationTotal = computeTotal(updatedItem);
            state.denom = updatedItem;
          }
        } else {
          if (value === name) {
            const updatedItem = [...state.denom];
            updatedItem[index].quantity === 0
              ? (updatedItem[index].quantity = 0)
              : updatedItem[index].quantity--;

            state.cashDeclarationTotal = computeTotal(updatedItem);
            state.denom = updatedItem;
          }
        }
      });
    },
    setOneDenom: (state, action) => {
      const {denomQuantity, denomValue} = action.payload;

      state.denom.forEach((item: any, index: number) => {
        const {value} = item;
        if (value === denomValue) {
          console.log(denomQuantity, denomValue);
          const updatedItem = [...state.denom];

          updatedItem[index].quantity = denomQuantity;

          updatedItem[index].total =
            denomQuantity * parseFloat(updatedItem[index].value);

          state.cashDeclarationTotal = computeTotal(updatedItem);
          state.denom = updatedItem;
        }
      });
    },
    setCashDeclarationTotal: (state) => {
      if (state.cashDeclarationTotal > 0) {
        console.log("YES?", state.cashDeclarationTotal);
        state.cashDeclarationTotal = 0;
        state.cashDeclared = true;

        const newDenom = state.denom.map((item: any) => ({
          ...item,
          quantity: 0,
          total: 0,
        }));
        console.log(newDenom, "new");
        state.denom = [...newDenom];
      }
    },
    setNoEOD: (state, action) => {
      const {NOEOD, from, to} = action.payload;
      state.noEOD.NOEOD = NOEOD;
      state.noEOD.from = from;
      state.noEOD.to = to;
    },
    setReceiptData: (state, action) => {
      console.log(action.payload);
      state.receiptData = action.payload;
    },
    handleReason: (state, action) => {
      state.reason = action.payload.reason;
    },
    handleCashieringType: (state, action) => {
      console.log(action.payload);

      state.cashieringType = action.payload;
    },
    handleCashTotal: (state, action) => {
      console.log(action.payload);
      state.cashTotal = action.payload;
    },
    setHasCashFund: (state, action) => {
      state.hasCashFund.data = action.payload;
      state.lastCashFund = action.payload;
      state.hasCashFund.hasFund = true;
    },
    setAllActiveHoldTransactions: (state, action) => {
      state.allHoldTransactions.data = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLastTransaction.fulfilled, (state, action) => {
        state.lastTransaction = action.payload;
      })
      .addCase(getAllActiveHoldTransactions.fulfilled, (state, action) => {
        state.allHoldTransactions.data = action.payload;
      })
      .addCase(hasCashfund.fulfilled, (state, action) => {
        state.hasCashFund.data = action.payload;
        state.lastCashFund = action.payload;
        state.hasCashFund.hasFund = true;
      })
      .addCase(hasNoEOD.pending, (state) => {
        console.log("pending");
        state.isLoading = true;
      })
      .addCase(hasNoEOD.fulfilled, (state, action) => {
        console.log("fulfilled");
        state.noEOD = action.payload;
        // state.isLoading = false;
      })
      .addCase(getLastCashFund.fulfilled, (state, action) => {
        state.lastCashFund = action.payload;
      });
  },
});

export const {
  setReprintCashiering,
  setLastTransaction,
  toggleZRead,
  setDenom,
  setCashDeclarationTotal,
  setNoEOD,
  setOneDenom,
  setReceiptData,
  handleReason,
  handleCashieringType,
  handleCashTotal,
  resetLoading,
  setHasCashFund,
  setAllActiveHoldTransactions,
  removeLoading,
  setIsEnd
} = transactionSlice.actions;
export default transactionSlice.reducer;
