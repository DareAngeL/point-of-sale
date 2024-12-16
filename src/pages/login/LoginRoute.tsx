import { DBSetup } from "./databasesetup/DBSetup";
import { Login } from "./Login";
import { Setup } from "./setup/Setup";
import { DBConfig } from "./databaseconfig/DBConfig";
import { CustomerWindowSetup } from "./setup/CustomerWindowSetup";
import { OperationSetup } from "./operationsetup/OperationSetup";
import { ApiService } from "../../services";

export const loginRoute = {
  path: "login",
  element: <Login />,
  children: [
    {
      path: "setup",
      element: <Setup />,
    },
    {
      path: "operationsetup",
      element: <OperationSetup />,
      loader: async () => await ApiService.get("systemparameters"),
    },
    {
      path: "dbsetup",
      element: <DBSetup />,
    },
    {
      path: "dbconfig",
      element: <DBConfig />,
    },
    {
      path: "customerwindowsetup",
      element: <CustomerWindowSetup />,
    }
  ],
};
