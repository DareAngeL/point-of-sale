import {createSlice} from "@reduxjs/toolkit";
import {PaymentMethod} from "../pages/transaction/ordering/enums";

export interface CardDetails {
  bankname: string;
  cardno: string;
  cardholder: string;
  approvalcode: string;
  cardtype: string;
  cardclass: string;
}

interface PaymentState {
  payment: {
    data: any[];
  };
  activePayment: {
    data: {
      id: string;
      payMethod: PaymentMethod | string;
    };
  };
  change: {
    data: any;
  };
  check: {
    data: any;
  };
  card: {
    data: CardDetails | null;
  };
  giftCheck: {
    data: any;
  };
  otherPayment: {
    data: any;
  };
  pingOnFreeItem: {
    isReceiptUpdated: boolean;
  }
}

const initialState: PaymentState = {
  payment: {
    data: [],
  },
  activePayment: {
    data: {
      id: "",
      payMethod: "",
    },
  },
  change: {
    data: null,
  },
  check: {
    data: null,
  },
  card: {
    data: null,
  },
  giftCheck: {
    data: null,
  },
  otherPayment: {
    data: null,
  },
  pingOnFreeItem: {
    isReceiptUpdated: false
  }
};

const orderingSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPayment: (state, action) => {
      state.payment.data = action.payload;
    },
    setActivePayment: (state, action) => {
      state.activePayment.data = action.payload;
    },
    setChange: (state, action) => {
      state.change.data = action.payload;
    },
    setCheck: (state, action) => {
      state.check.data = action.payload;
    },
    setCard: (state, action) => {
      state.card.data = action.payload;
    },
    setGiftCheck: (state, action) => {
      state.giftCheck.data = action.payload;
    },
    setOtherpayment: (state, action) => {
      state.otherPayment.data = action.payload;
    },
    setPingOnFreeItem: (state, action) => {
      state.pingOnFreeItem = action.payload;
    },
  },
});

export const {
  setPayment,
  setChange,
  setCheck,
  setCard,
  setGiftCheck,
  setOtherpayment,
  setActivePayment,
  setPingOnFreeItem
} = orderingSlice.actions;
export default orderingSlice.reducer;
