import {AuthenticationGuard} from "../../security/authentication/AuthGuards";
import {Cashiering} from "./cashiering/Cashiering";
import {Ordering} from "./ordering/Ordering";
import {orderingRoute} from "./ordering/OrderingRoutes";
import RouteTransition from "../../common/routeTransition/RouteTransition";
import {ReceiptPrintout} from "./ordering/receipt/ReceiptPrintout";
export const transactionRoute = [
  {
    path: "testing",
    element: <ReceiptPrintout />,
  },
  {
    path: "cashiering",
    element: (
      <RouteTransition animationType="slideRight">
        <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
          <Cashiering />
        </AuthenticationGuard>
      </RouteTransition>
    ),
    children: [],
  },
  {
    path: "ordering",
    element: (
      <RouteTransition animationType="slideRight">
        <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
          <Ordering />
        </AuthenticationGuard>
      </RouteTransition>
    ),
    children: orderingRoute,
  },
];
