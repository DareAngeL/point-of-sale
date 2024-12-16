import {createSlice} from "@reduxjs/toolkit";
import {getRefundItemsByCode} from "../store/actions/refundAction";
import { CardDetails } from "./paymentSlice";

interface RefundState {
  toRefund: {
    data: any[];
  };
  refundItemList: {
    data: any[];
    isLoaded: boolean;
  };
  refundReason: {
    data: string;
  };
  modeOfRefund: string;
  cardDetails: CardDetails;
}

const initialState: RefundState = {
  toRefund: {
    data: [],
  },
  refundItemList: {
    data: [],
    isLoaded: false,
  },
  refundReason: {
    data: "",
  },
  modeOfRefund: "CASH",
  cardDetails: {
    cardtype: "",
    bankname: "",
    cardno: "",
    cardholder: "",
    approvalcode: "",
    cardclass: "",
  },
};

const refundSlice = createSlice({
  name: "refund",
  initialState,
  reducers: {
    setModeOfRefund2: (state, action) => {
      state.modeOfRefund = action.payload;
    },
    setRefundCardDetails: (state, action) => {
      state.cardDetails = action.payload;
    },
    clearToRefund: (state) => {
      state.toRefund.data = [];
    },
    addToRefund: (state, action) => {
      console.log(action.payload);

      if (Array.isArray(action.payload)) {
        action.payload.forEach((d) => {
          const findToRefund = state.toRefund.data.find(
            (item) => item.recid === d.recid
          );

          if (findToRefund) {
            console.log("ayo", findToRefund);

            // Update existing item
            findToRefund.refundqty = parseInt(d.refundqty);
          } else {
            // Add new item
            state.toRefund.data.push(d);
          }
        });
      } else {
        state.toRefund.data.push(action.payload);
      }
    },
    deleteToRefundById: (state, action) => {
      state.toRefund.data = state.toRefund.data.filter(
        (d) => d.recid !== action.payload
      );
    },
    updateRefundReason: (state, action) => {
      state.refundReason.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRefundItemsByCode.fulfilled, (state, action) => {
      state.refundItemList.data = action.payload;
      state.refundItemList.isLoaded = true;
    });
  },
});

export const {
  clearToRefund,
  addToRefund,
  deleteToRefundById,
  updateRefundReason,
  setModeOfRefund2,
  setRefundCardDetails,
} = refundSlice.actions;
export default refundSlice.reducer;
