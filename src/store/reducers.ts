import { combineReducers } from "@reduxjs/toolkit";
import modalSlice from "../reducer/modalSlice";
import pageSlice from "../reducer/pageSlice";
import masterfileSlice from "../reducer/masterfileSlice";
import printoutSlice from "../reducer/printoutSlice";
import transactionSlice from "../reducer/transactionSlice";
import orderingSlice from "../reducer/orderingSlice";
import reportSlice from "../reducer/reportSlice";
import utlitiesSlice from "../reducer/utlitiesSlice";
import accountSlice from "../reducer/accountSlice";
import paymentSlice from "../reducer/paymentSlice";
import refundSlice from "../reducer/refundSlice";
import otherTransactionSlice from "../reducer/otherTransactionSlice";
import voidSlice from "../reducer/voidSlice";
import { withReduxStateSync } from "redux-state-sync";
import customerWindowSlice from "../reducer/customerWindowSlice";
import posfileSlice from "../reducer/posfileSlice";
import menuSlice from "../reducer/menuSlice";
import managersReportSlice from "../reducer/managersReportSlice";
import postNetworkSlice from "../reducer/postNetworkSlice";
import centralSlice from "../reducer/centralSlice";

const rootReducer = combineReducers({
  modal: modalSlice,
  page: pageSlice,
  masterfile: masterfileSlice,
  printout: printoutSlice,
  transaction: transactionSlice,
  order: orderingSlice,
  report: reportSlice,
  utility: utlitiesSlice,
  account: accountSlice,
  payment: paymentSlice,
  refund: refundSlice,
  otherTransaction: otherTransactionSlice,
  void: voidSlice,
  customerwindow: customerWindowSlice,
  posfile: posfileSlice,
  menu: menuSlice,
  managersReport: managersReportSlice,
  posNetwork: postNetworkSlice,
  central: centralSlice,
});

export default withReduxStateSync(rootReducer);
