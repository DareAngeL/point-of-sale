import { Middleware, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import reducers from "./reducers";
import {
  createStateSyncMiddleware,
  initStateWithPrevTab,
} from "redux-state-sync";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

//#region Reducers Setup
//persist config and reducers
const persistedReducers = persistReducer(
  {
    //persist config
    key: "root",
    storage,
    whitelist: ["persist"],
  },
  //add reducers
  reducers
);
//#endregion

//#region Middleware Setup
//this is already optimize thunkMiddleware -> async thunk and await api call applied on actions
const thunkMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action === "function") {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

//middleware monitoring performance
const perMonMiddleware: Middleware = (_) => (next) => (action) => {
  const start = performance.now();
  const result = next(action);
  const end = performance.now();
  console.log(`Action ${action.type} took ${end - start} ms`);
  return result;
};

//middleware error handler
const errorMiddleware: Middleware = (_) => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error("Redux Middleware Error:", err);
    throw err;
  }
};
//#endregion

//#region Store Setup
//store config
const store = configureStore({
  reducer: persistedReducers,
  middleware: (getDefaultMiddleware) =>
    //avoid overhead with unserializable data
    getDefaultMiddleware({
      serializableCheck: false,
    })
      //add middleware here
      .concat(perMonMiddleware)
      .concat(thunkMiddleware)
      .concat(createStateSyncMiddleware())
      .concat(errorMiddleware),
  //if prod then devTools is disable
  devTools: process.env.NODE_ENV !== "production",
});

//state init sync for multi-tab functionality
initStateWithPrevTab(store);
//#endregion

//#region Exports
//export dispatch and selector type
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

//export function
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

//export persist (currently not using it)
export const persistor = persistStore(store);

//export store
export default store;
//#endregion
