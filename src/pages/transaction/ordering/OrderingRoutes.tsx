import {ChangeOrderType} from "./modal/orderingbuttons/ChangeOrderType";
import {ChangeQuantity} from "./modal/orderingbuttons/ChangeQuantity";
import {Payment} from "./modal/orderingbuttons/Payment";
import {SpecialRequest} from "./modal/orderingbuttons/SpecialRequest";
import {Discount} from "./modal/orderingbuttons/Discounts";
import {FreeItem} from "./modal/orderingbuttons/FreeItem";
import {PriceOverride} from "./modal/orderingbuttons/PriceOverride";
import {VoidTransaction} from "./modal/orderingbuttons/VoidTransaction";
import {RefundTransaction} from "./modal/orderingbuttons/RefundTransaction";
import {ApiService} from "../../../services";
import {ReprintVoid} from "./modal/orderingbuttons/ReprintVoid";
import {RefundList} from "./modal/orderingbuttons/refundtransaction/RefundList";
import {AddOn} from "./modal/orderingbuttons/AddOn";
import {ReprintTransaction} from "./modal/orderingbuttons/reprintTransaction/ReprintTransaction";
import {OtherTransaction} from "./modal/orderingbuttons/OtherTransaction";
import {RefundTransactionList} from "./modal/orderingbuttons/refundtransaction/RefundTransactionList";
import {RefundSearchTransactionClosed} from "./modal/orderingbuttons/refundtransaction/RefundSearchTransactionClosed";
import {RefundItemList} from "./modal/orderingbuttons/refundtransaction/RefundItemList";
import moment from "moment";
import RouteTransition from "../../../common/routeTransition/RouteTransition";
import {InitializationModal} from "./modal/initialization/InitializationModal";
import {ReprintRefund} from "./modal/orderingbuttons/ReprintRefund";
import {AuthBypModules, AuthModal} from "../../../common/modal/AuthModal";
import CancelTransaction from "./modal/orderingbuttons/CancelTransaction";
import ItemCombo from "./modal/orderingbuttons/ItemCombo";
export const orderingRoute = [
  {
    path: "initialization",
    element: (
      <RouteTransition animationType="slideBottom">
        <InitializationModal />
      </RouteTransition>
    ),
  },
  {
    path: "changequantity",
    element: <ChangeQuantity />,
  },
  {
    path: "changeordertype",
    element: <ChangeOrderType />,
  },
  {
    path: "specialrequest",
    element: <SpecialRequest />,
  },
  {
    path: "discount",
    element: <Discount />,
  },
  {
    path: "payment",
    element: <Payment />,
  },
  {
    path: "freeitem",
    element: <FreeItem />,
  },
  {
    path: "priceoverride",
    element: <PriceOverride />,
  },
  {
    path: "voidtransaction",
    element: <VoidTransaction />,
    loader: async () => await ApiService.get("posfile/head"),
  },
  {
    path: "refundtransactionlist",
    element: <RefundTransactionList />,
    loader: async () => await ApiService.get("posfile/refund/total"),
  },
  {
    path: "refundtransaction",
    element: <RefundTransaction />,
    loader: async () => await ApiService.get("posfile/head"),
  },
  {
    path: "refundtransactionclosed",
    element: <RefundSearchTransactionClosed />,
    // loader: async () => await ApiService.get("posfile/headRefund"),
  },
  {
    path: "refunditemlist",
    element: <RefundItemList />,
    loader: async () => await ApiService.get("posfile/refund/list"),
  },
  {
    path: "reprintVoid",
    element: <ReprintVoid />,
    loader: async () => await ApiService.get("posfile/void"),
  },
  {
    path: "refundposfiles",
    element: <RefundList />,
    loader: async () => await ApiService.get("posfile/void"),
  },
  {
    path: "addon",
    element: <AddOn />,
  },
  {
    path: "reprinttransaction",
    element: <ReprintTransaction />,
    loader: async () =>
      await ApiService.get(
        `posfile/closedTransactions?from=${moment().format(
          "YYYY-MM-DD"
        )}&to=${moment().format("YYYY-MM-DD")}`
      ),
  },
  {
    path: "othertransaction",
    element: <OtherTransaction />,
  },
  {
    path: "reprintrefund",
    element: <ReprintRefund />,
    loader: async () => await ApiService.get("posfile/refundTransactions"),
  },
  {
    path: "auth",
    element: <AuthModal useFor={AuthBypModules.ORDERING} />,
  },
  {
    path: "confirmation",
    element: <CancelTransaction />,
  },
  {
    path: "itemCombo/:itmcde",
    element: <ItemCombo />,
  },
];
