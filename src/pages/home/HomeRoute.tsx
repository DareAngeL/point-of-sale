import {AuthenticationGuard} from "../../security/authentication/AuthGuards";
import {InitializationModal} from "../transaction/ordering/modal/initialization/InitializationModal";
import {IsZread} from "./modals/IsZread";
import {TransactionModal} from "../transaction/ordering/modal/initialization/TransactionModal";
import RouteTransition from "../../common/routeTransition/RouteTransition";
import {NoEODNotification} from "./modals/NoEODNotification";
import Home from "./Home";
import { HoldTransactions } from "./modals/HoldTransactions";
import { CentralSyncNotificationUpdate } from "./modals/CentralSyncNotificationUpdate";
import { AutoOfSalesCorrupted } from "./modals/AutoOfSalesCorrupted";
import { OperationNotification } from "../../common/modal/OperationTime/OperationNotification";

export const homeRoute = {
  path: "home",
  element: (
    <AuthenticationGuard condition={true} redirectTo="/">
      <Home />
    </AuthenticationGuard>
  ),
  children: [
    {
      path: "initialization",
      element: (
        <RouteTransition animationType="slideBottom">
          <InitializationModal />
        </RouteTransition>
      ),
    },
    {
      path: "iszread",
      element: (
        <RouteTransition animationType="slideBottom">
          <IsZread />
        </RouteTransition>
      ),
    },
    {
      path: "noeod",
      element: (
        <RouteTransition animationType="slideBottom">
          <NoEODNotification />
        </RouteTransition>
      ),
    },
    {
      path: "open_transactions",
      element: (
        <RouteTransition animationType="slideBottom">
          <HoldTransactions />
        </RouteTransition>
      ),
    },
    {
      path: "central_sync",
      element: (
        <RouteTransition animationType="slideBottom">
          <CentralSyncNotificationUpdate />
        </RouteTransition>
      ),
    },
    {
      path: "autofosales_corrupted",
      element: (
        <RouteTransition animationType="slideBottom">
          <AutoOfSalesCorrupted />
        </RouteTransition>
      ),
    },
    {
      path: "transactionModal",
      element: (
        <RouteTransition animationType="slideBottom">
          <TransactionModal />
        </RouteTransition>
      ),
    },
    {
      path: "operation",
      element: (
        <RouteTransition animationType="slideBottom">
          <OperationNotification />
        </RouteTransition>
      )
    },
  ],
};
