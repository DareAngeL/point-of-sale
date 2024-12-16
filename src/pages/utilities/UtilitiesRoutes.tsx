import { Utilities } from "./Utilities";
import { utilitiesList } from "../../data/utilitiesdata";
import Import from "./import/Import";
import Export from "./export/Export";
import ReComputeZReading from "./re-computeZReading/ReComputeZReading";
import RegenerateMallFiles from "./regenereteMallFiles/RegenerateMallFiles";
import BackupData from "./backupdata/BackupData";
import ChangePassword from "./changePassword/ChangePassword";
import { ApiService } from "../../services";
import { AuthenticationGuard } from "../../security/authentication/AuthGuards";
import { CentralServerSetup } from "./centralserversetup/CentralServerSetup";
import { DownloadAndSyncMasterFile } from "./downloadandsync/DownloadAndSyncMasterFile";
import RouteTransition from "../../common/routeTransition/RouteTransition";
import { AutomationOfSalesTransaction } from "./automationofsalestransaction/AutomationOfSalesTransaction";
import { ThemeSettings } from "./themesettings/ThemeSettings";
import { ViewSentFiles } from "./viewSentFiles/ViewSentFiles";
import { ReprintStickers } from "./reprintsticker/ReprintStickers";
import { CancelZReading } from "./cancelzreading/CancelZReading";
import { Fixes } from "./fixes/Fixes";
// import { getViewList } from "../../store/actions/zreading.action";

export const utilitiesRoute = [
  {
    path: "utilities",
    element: (
      <RouteTransition animationType="slideRight" disableScrollBar={true}>
        <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
          <Utilities data={utilitiesList} />
        </AuthenticationGuard>
      </RouteTransition>
    ),
    children: [
      {
        path: "downloadSyncMasterFile",
        element: (
          <RouteTransition animationType="slideBottom">
            <DownloadAndSyncMasterFile />
          </RouteTransition>
        ),
      },
      {
        path: "cancelZReading",
        element: (
          <RouteTransition animationType="slideBottom">
            <CancelZReading />
          </RouteTransition>
        ),
      },
      {
        path: "import",
        element: (
          <RouteTransition animationType="slideBottom">
            <Import />
          </RouteTransition>
        ),
        loader: async () => ApiService.get("getmasterfile"),
      },
      {
        path: "export",
        element: (
          <RouteTransition animationType="slideBottom">
            <Export />
          </RouteTransition>
        ),
        loader: async () => await ApiService.get("getmasterfile"),
      },
      {
        path: "recomputeZReading",
        element: (
          <RouteTransition animationType="slideBottom">
            <ReComputeZReading />
          </RouteTransition>
        ),
      },
      {
        path: "regenerateMallfiles",
        element: (
          <RouteTransition animationType="slideBottom">
            <RegenerateMallFiles />
          </RouteTransition>
        ),
      },
      {
        path: "changePassword",
        element: (
          <RouteTransition animationType="slideBottom">
            <ChangePassword />
          </RouteTransition>
        ),
      },
      {
        path: "reprintStickers",
        element: (
          <RouteTransition animationType="slideBottom">
            <ReprintStickers />
          </RouteTransition>
        ),
      },
      {
        path: "backupData",
        element: (
          <RouteTransition animationType="slideBottom">
            <BackupData />
          </RouteTransition>
        ),
      },
      {
        path: "viewSentFiles",
        element: (
          <RouteTransition animationType="slideBottom">
            <ViewSentFiles />
          </RouteTransition>
        ),
        loader: async () => ApiService.get("mallhookup/getViewList"),
      },
      {
        path: "fixes",
        element: (
          <RouteTransition animationType="slideBottom">
            <Fixes />
          </RouteTransition>
        ),
      },
    ],
  },
  {
    path: "centralServerSetup",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <CentralServerSetup />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => ApiService.get("systemparameters"),
  },
  {
    path: "automationOfSalesTransaction",
    element: (
      <AuthenticationGuard isAccount={true} redirectTo={"/pages/login"}>
        <RouteTransition animationType="slideTop">
          <AutomationOfSalesTransaction />
        </RouteTransition>
      </AuthenticationGuard>
    ),
    loader: async () => ApiService.get("systemparameters"),
  },
  {
    path: "themeSettings",
    element: (
      <RouteTransition animationType="slideBottom">
        <ThemeSettings />
      </RouteTransition>
    ),
    loader: async () => ApiService.get("theme"),
  },
];
