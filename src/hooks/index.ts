import { useChangeNameModal, useModal } from "./modalHooks";

export const useModalHook = () => {

    const {dispatch} = useModal();
    const {modalNameDispatch} = useChangeNameModal();

    const onOpenModal =(modalName: string) => {
        dispatch();
        modalNameDispatch(modalName || "Add new record");
    }

    return {onOpenModal, dispatchModal: dispatch}

}