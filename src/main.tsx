import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { pagesRoute } from "./pages/PagesRoutes";
import { Provider } from "react-redux";
import store, { persistor } from "./store/store";
import "react-toastify/dist/ReactToastify.css";
import { Toast } from "./common/toast/Toast";
import Account from "./Account";
import { WindowManager } from "./app/windowmanager/WindowManager";
import { WebsocketProvider } from "./WebSocketContext";
import { OperationTimeContainer } from "./common/modal/OperationTime/OperationTimeContainer";
import { DraggableTimer } from "./common/modal/DraggableModal/DraggableTimer";
import { PersistGate } from "redux-persist/integration/react";

const router = createHashRouter([
  {
    path: "/",
    element: <WindowManager />,
  },
  pagesRoute,
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <Toast />
    <Provider store={store}>
      <WebsocketProvider>
        <OperationTimeContainer />
        <DraggableTimer />
        <PersistGate loading={null} persistor={persistor}>
          <Account>
            <RouterProvider router={router} />
          </Account>
        </PersistGate>
      </WebsocketProvider>
    </Provider>
  </>
);

postMessage({ payload: "removeLoading" }, "*");
