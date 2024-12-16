import {createSlice} from "@reduxjs/toolkit";
import {OrderingModel} from "../pages/transaction/ordering/model/OrderingModel";
import {PosfileModel} from "../models/posfile";
import {SpecialRequestDetailModel} from "../models/specialrequest";
import {DiscountOrderModel} from "../models/discount";
import {  getDiscountable, getLessVatAdj, getPosfiles, getPreviousAll, getPreviousRefundedPayment, getPreviousPosfiles, getPreviousTotal, getPreviousVat, getRemainingZread, getServiceCharge, getTotal, getVatExempt, getPreviousTrnsactionPayment } from "../store/actions/posfile.action";
import { getOrderDiscount, getOrderDiscountByCode } from "../store/actions/discount.action";
import { getSpecialRequestByOrdercode, getSpecialRequestDetails } from "../store/actions/specialRequest.action";
import { getActiveTransaction, getTransactions } from "../store/actions/transaction.action";
import { getSysparOrdocnum } from "../store/actions/systemParameters.action";

interface OrderingState {
  isTransactionProcessing: boolean;
  transaction: {
    data: OrderingModel | null;
    isLoaded: boolean;
  };
  transactions: {
    data: OrderingModel[];
    isLoaded: boolean;
  };
  posfileTOTAL: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  lessVatAdj: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  serviceCharge: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  serviceChargeDiscount: {
    data: number;
  };
  discountable: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  vatExempt: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  previousPosfile: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  posfiles: {
    data: PosfileModel[];
    activePrinterStation: string | null;
    isLoaded: boolean;
  };
  previousPosfiles: {
    data: PosfileModel[];
    isLoaded: boolean;
  };
  remainingZread: {
    data: {hasRemainingZread: boolean; date: string} | null;
    isLoaded: boolean;
  };
  selectedOrder: {
    data: any;
  };
  specialRequest: {
    data: SpecialRequestDetailModel[];
    isLoaded: boolean;
  };
  orderDiscount: {
    data: DiscountOrderModel[];
    isLoaded: boolean;
  };
  refund: {
    reason: string;
  };
  orderDiscountByCode: {
    data: DiscountOrderModel[];
    isLoaded: boolean;
  };
  previousVat: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  paymentByCode: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  changeByCode: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  previousInitialization: {
    postypcde: string;
    warcde: string;
  };
  selectedRefundOrdercde: string;
  previousPayment: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  prevTranPayment: {
    data: PosfileModel | null;
    isLoaded: boolean;
  };
  posfileSubClass: {
    data: [];
    isLoaded: boolean;
  };
  posfilePreviousAll: {
    data: [];
    isLoaded: boolean;
  },
  activeOrdocnum: string;
  hasTransaction: boolean;
}

const initialState: OrderingState = {
  isTransactionProcessing: false,
  transaction: {
    data: null,
    isLoaded: false,
  },
  transactions: {
    data: [],
    isLoaded: false,
  },
  posfileTOTAL: {
    data: null,
    isLoaded: false,
  },
  lessVatAdj: {
    data: null,
    isLoaded: false,
  },
  serviceCharge: {
    data: null,
    isLoaded: false,
  },
  serviceChargeDiscount: {
    data: 0,
  },
  discountable: {
    data: null,
    isLoaded: false,
  },
  vatExempt: {
    data: null,
    isLoaded: false,
  },
  posfiles: {
    data: [],
    activePrinterStation: null,
    isLoaded: false,
  },
  remainingZread: {
    data: null,
    isLoaded: false,
  },
  selectedOrder: {
    data: null,
  },
  specialRequest: {
    data: [],
    isLoaded: false,
  },
  orderDiscount: {
    data: [],
    isLoaded: false,
  },
  previousPosfile: {
    data: null,
    isLoaded: false,
  },
  previousPosfiles: {
    data: [],
    isLoaded: false,
  },
  refund: {
    reason: "",
  },
  orderDiscountByCode: {
    data: [],
    isLoaded: false,
  },
  previousVat: {
    data: null,
    isLoaded: false,
  },
  paymentByCode: {
    data: null,
    isLoaded: false,
  },
  changeByCode: {
    data: null,
    isLoaded: false,
  },
  previousInitialization: {
    postypcde: "",
    warcde: "",
  },
  selectedRefundOrdercde: "",
  previousPayment: {
    data: null,
    isLoaded: false,
  },
  prevTranPayment: {
    data: null,
    isLoaded: false
  },
  posfileSubClass: {
    data: [],
    isLoaded: false,
  },
  posfilePreviousAll: {
    data: [],
    isLoaded: false,
  },
  activeOrdocnum: "",
  hasTransaction: false
};

const orderingSlice = createSlice({
  name: "ordering",
  initialState,
  reducers: {
    setHasTransaction: (state, action) => {
      state.hasTransaction = action.payload;
    },
    setIsProcessingTransaction: (state, action) => {
      state.isTransactionProcessing = action.payload;
    },
    setServiceChargeDiscount: (state, action) => {
      state.serviceChargeDiscount.data = action.payload;
    },
    setTransaction: (state, action) => {
      console.log(action.payload);
      state.transaction.data = action.payload;
      state.transaction.isLoaded = true;
    },
    setTransactions: (state, action) => {
      state.transactions.data = action.payload;
      state.transactions.isLoaded = true;
    },
    setPosfile: (state, action) => {
      state.posfileTOTAL.data = action.payload;
      state.posfileTOTAL.isLoaded = true;
    },
    setPosfiles: (state, action) => {
      state.posfiles.data = action.payload;
      state.posfiles.isLoaded = true;
    },
    setActivePrinterStation: (state, action) => {
      state.posfiles.activePrinterStation = action.payload;
    },
    setSelectedOrder: (state, action) => {
      console.log("xxx", action.payload);

      if (action.payload === null) {
        state.selectedOrder.data = action.payload;
      } else if (action.payload.hasOwnProperty("data")) {
        console.log("eto pa", action.payload.data);
        state.selectedOrder.data = action.payload.data;
      } else {
        console.log("edi 2");
        console.log(action.payload);
        state.selectedOrder.data = action.payload;
      }
      // state.selectedOrder.data = action.payload;
    },
    setSpecialRequestDetails: (state, action) => {
      state.specialRequest.data = [
        ...state.specialRequest.data,
        ...action.payload,
      ];
    },
    setOrderDiscount: (state, action) => {
      state.orderDiscount.data = [
        ...state.specialRequest.data,
        ...action.payload,
      ];
    },
    setRefund: (state, action) => {
      state.refund = {...state.refund, reason: action.payload};
    },
    setPreviousInitialization: (state, action) => {
      console.log(action.payload);

      state.previousInitialization = {
        warcde: action.payload?.warcde,
        postypcde: action.payload?.postypcde,
      };
    },
    setSelectedRefundOrdercde: (state, action) => {
      state.selectedRefundOrdercde = action.payload;
    },
    setClearLessVat: (state) => {
      state.lessVatAdj.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSysparOrdocnum.fulfilled, (state, action) => {
        state.activeOrdocnum = action.payload.ordocnum;
      })
      .addCase(getActiveTransaction.fulfilled, (state, action) => {
        console.log(action.payload);
        state.transaction.data = action.payload;
        state.transaction.isLoaded = true;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.transactions.data = action.payload;
        state.transactions.isLoaded = true;
      })
      .addCase(getTotal.fulfilled, (state, action) => {
        state.posfileTOTAL.data = action.payload;
        state.posfileTOTAL.isLoaded = true;
      })
      .addCase(getPosfiles.fulfilled, (state, action) => {
        console.log("ano sabi", action.payload);

        state.posfiles.data = action.payload;
        state.posfiles.isLoaded = true;
      })
      .addCase(getRemainingZread.fulfilled, (state, action) => {
        console.log(action);
        state.remainingZread.data = action.payload;
        state.remainingZread.isLoaded = true;
      })
      .addCase(getSpecialRequestDetails.fulfilled, (state, action) => {
        state.specialRequest.data = action.payload;
        state.specialRequest.isLoaded = true;
      })
      .addCase(getSpecialRequestByOrdercode.fulfilled, (state, action) => {
        state.specialRequest.data = action.payload;
        state.specialRequest.isLoaded = true;
      })
      .addCase(getOrderDiscount.fulfilled, (state, action) => {
        console.log("its morbing time", action.payload);
        state.orderDiscount.data = action.payload;
        state.orderDiscount.isLoaded = true;
      })
      .addCase(getPreviousTotal.fulfilled, (state, action) => {
        console.log("potek 1", action.payload);
        state.previousPosfile.data = action.payload;
        state.previousPosfile.isLoaded = true;
      })
      .addCase(getPreviousPosfiles.fulfilled, (state, action) => {
        console.log("potek 2", action.payload);
        state.previousPosfiles.data = action.payload;
        state.previousPosfiles.isLoaded = true;
      })
      .addCase(getDiscountable.fulfilled, (state, action) => {
        state.previousPosfiles.data = action.payload;
        state.previousPosfiles.isLoaded = true;
      })
      .addCase(getLessVatAdj.fulfilled, (state, action) => {
        console.log("tokwa");
        console.log(action.payload);
        state.lessVatAdj.data = action.payload;
        state.lessVatAdj.isLoaded = true;
      })
      .addCase(getServiceCharge.fulfilled, (state, action) => {
        console.log(action.payload);
        state.serviceCharge.data = action.payload;
        state.serviceCharge.isLoaded = true;
      })
      .addCase(getVatExempt.fulfilled, (state, action) => {
        state.previousPosfiles.data = action.payload;
        state.previousPosfiles.isLoaded = true;
      })
      .addCase(getPreviousVat.fulfilled, (state, action) => {
        state.previousVat.data = action.payload;
        state.previousVat.isLoaded = true;
      })
      .addCase(getOrderDiscountByCode.fulfilled, (state, action) => {
        state.orderDiscountByCode.data = action.payload;
        state.orderDiscountByCode.isLoaded = true;
      })
      .addCase(getPreviousRefundedPayment.fulfilled, (state, action) => {
        state.previousPayment.data = action.payload;
        state.previousPayment.isLoaded = true;
      })
      .addCase(getPreviousTrnsactionPayment.fulfilled, (state, action) => {
        state.prevTranPayment.data = action.payload;
        state.prevTranPayment.isLoaded = true;
      })
      .addCase(getPreviousAll.fulfilled, (state, action) => {
        state.posfilePreviousAll = action.payload;
        state.previousPayment.isLoaded = true;
      })
  },
});

export const {
  setHasTransaction,
  setIsProcessingTransaction,
  setServiceChargeDiscount,
  setTransaction,
  setTransactions,
  setPosfile,
  setPosfiles,
  setSelectedOrder,
  setSpecialRequestDetails,
  setOrderDiscount,
  setRefund,
  setPreviousInitialization,
  setSelectedRefundOrdercde,
  setClearLessVat,
  setActivePrinterStation
} = orderingSlice.actions;
export default orderingSlice.reducer;
