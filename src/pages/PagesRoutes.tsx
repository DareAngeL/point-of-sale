import {ApiService} from "../services";
import {homeRoute} from "./home/HomeRoute";
import {loginRoute} from "./login/LoginRoute";
import {masterfileRoute} from "./masterfile/MasterfileRoute";
import {reportsRoute} from "./reports/ReportsRoute";
import {Systemsettings} from "./settings/SystemSettings";
import {transactionRoute} from "./transaction/TransactionRoute";
import {utilitiesRoute} from "./utilities/UtilitiesRoutes";
import RouteTransition from "../common/routeTransition/RouteTransition";

export const pagesRoute = {
  path: "pages",
  children: [
    homeRoute,
    loginRoute,
    ...masterfileRoute,
    ...transactionRoute,
    ...reportsRoute,
    ...utilitiesRoute,
    {
      path: "systemsettings",
      element: (
        <RouteTransition animationType="slideRight" disableScrollBar={true}>
          <Systemsettings />
        </RouteTransition>
      ),
      loader: async () => await ApiService.get("systemparameters"),
    },
  ],
};
