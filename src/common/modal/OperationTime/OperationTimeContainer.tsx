import { useAppSelector } from "../../../store/store"
import { OperationNotification } from "./OperationNotification"



export const OperationTimeContainer = () => {

    const { allowAccess } = useAppSelector(state => state.account);

    if (!allowAccess) return null;

    return (
        <>
            <OperationNotification />
        </>
    )
}