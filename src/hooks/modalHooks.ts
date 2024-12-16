import {
  changeName,
  toggle,
  removeXButton as remXButton,
  enableBackButton,
} from "../reducer/modalSlice";
import {isPage} from "../reducer/pageSlice";
import {useAppDispatch, useAppSelector} from "../store/store";

export function useModal() {
  const {
    isOn: modal,
    removeXbutton: _removeXbutton,
    isFullScreen,
    isEnableBackButton,
  } = useAppSelector((state) => state.modal);
  const appDispatch = useAppDispatch();

  const dispatch = () => {
    appDispatch(toggle());
  };

  const removeXbuttonDispatch = (remove: boolean) => {
    appDispatch(remXButton(remove));
  };

  const _enableBackButton = (isEnable: boolean) => {
    appDispatch(enableBackButton(isEnable));
  };

  return {
    modal,
    removeXbutton: _removeXbutton,
    dispatch,
    removeXbuttonDispatch,
    isFullScreen,
    isEnableBackButton,
    enableBackButton: _enableBackButton,
  };
}

export function useChangeNameModal() {
  const modalName = useAppSelector((state) => state.modal.modalName);
  const useDispatch = useAppDispatch();

  const modalNameDispatch = (name: string | undefined) => {
    console.log(name);
    useDispatch(changeName({modalName: name}));
  };

  return {modalName, modalNameDispatch};
}

export function usePage() {
  const pageActive = useAppSelector((state) => state.page.isPage);
  const useDispatch = useAppDispatch();

  const pageDispatch = (isPageActive: boolean) => {
    useDispatch(isPage({isPage: isPageActive}));
  };

  return {pageActive, pageDispatch};
}
