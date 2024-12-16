import { reportsList } from "../../data/reportsList";
import { Reports } from "./Reports";
import { ManagersReport } from "./managersreport/ManagersReport";
import { ReprintZReading } from "./reprintzreading/ReprintZReading";
import { ZReading } from "./zreading/ZReading";
import { XReading } from "./xreading/XReading";
import FileView from "./common/view/FileView";
import { AuditTrail } from "./audittrail/AuditTrail";
import { AuthenticationGuard } from "../../security/authentication/AuthGuards";
import RouteTransition from "../../common/routeTransition/RouteTransition";
import ReprintCashFund from "./reprintcashfund/ReprintCashfund";
import { BirReport } from "./birreport/BirReport";
import { ReprintOrderTicket } from "./reprintorderticket/ReprintOrderTicket";
// import { loader } from "../../helper/Loader";

export const reportsRoute = [
  {
    path: "reports",
    element: (
      <RouteTransition animationType="slideRight">
        <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
          <Reports data={reportsList} />
        </AuthenticationGuard>
      </RouteTransition>
    ),
    children: [
      {
        path: "managersReport",
        element: (
          <RouteTransition animationType="slideBottom">
            <ManagersReport />
          </RouteTransition>
        ),
      },
      {
        path: "birReport",
        element: (
          <RouteTransition animationType="slideBottom">
            <BirReport />
          </RouteTransition>
        ),
      },
      {
        path: "ZReading",
        element: (
          <RouteTransition animationType="slideBottom">
            <ZReading />
          </RouteTransition>
        ),
      },
      {
        path: "auditTrail",
        element: (
          <RouteTransition animationType="slideBottom">
            <AuditTrail />
          </RouteTransition>
        ),
      },
      {
        path: "XReading",
        element: (
          <RouteTransition animationType="slideBottom">
            <XReading />
          </RouteTransition>
        ),
      },
      {
        path: "reprintCashiering",
        element: (
          <RouteTransition animationType="slideBottom">
            <ReprintCashFund />
          </RouteTransition>
        ),
      },
      {
        path: "reprintOrderTicket",
        element: (
          <RouteTransition animationType="slideBottom">
              <ReprintOrderTicket/>
          </RouteTransition>
        )
      },
    ],
  },
  {
    path: "reprintZReading",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideRight">
          <ReprintZReading />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    // loader: async () => await ApiService.get("posfile/reprint_zreading/?page=0&pageSize=10"),
  },
  {
    path: "reports/XReading/fileView",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideBottom">
          <FileView />
        </RouteTransition>
      </AuthenticationGuard>
    ),
  },
];
