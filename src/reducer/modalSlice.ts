import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store/store";

interface ModalState {
  isOn: boolean;
  modalName: string;
  removeXbutton?: boolean;
  currentModal: string;
  isEnableBackButton?: boolean;
  isFullScreen?: boolean;
  operationModal: boolean;
  cancelTransactionModal: boolean
}

const initialState: ModalState = {
  isOn: false,
  modalName: "No modal",
  removeXbutton: false,
  currentModal: "",
  isEnableBackButton: false,
  isFullScreen: false,
  operationModal: true,
  cancelTransactionModal: false
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    toggle: (state) => {
      state.isOn = !state.isOn;
    },
    changeName: (state, action) => {
      const {modalName} = action.payload;
      console.log(modalName);
      state.modalName = modalName;
    },
    enableBackButton: (state, action) => {
      state.isEnableBackButton = action.payload;
    },
    removeXButton: (state, action) => {
      state.removeXbutton = action.payload;
    },
    handleCurrentModal: (state, action) => {
      state.currentModal = action.payload;
    },
    toggleFullScreen: (state, action) => {
      if (action?.payload !== undefined) {
        state.isFullScreen = action.payload;
      } else {
        state.isFullScreen = !state.isFullScreen;
      }
    },
    toggleOperationModal: (state, action) => {
      console.log("HI");
      state.operationModal = action.payload

    },
    setCancelTransactionModal: (state, action) => {
      state.cancelTransactionModal = action.payload

    }
  },
});

export const {
  toggle,
  changeName,
  removeXButton,
  handleCurrentModal,
  toggleFullScreen,
  enableBackButton,
  toggleOperationModal,
  setCancelTransactionModal
} = modalSlice.actions;
export const selectModal = (state: RootState) => state.modal;
export default modalSlice.reducer;
