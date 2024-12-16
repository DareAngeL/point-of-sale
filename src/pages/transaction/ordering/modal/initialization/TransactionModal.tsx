import { useNavigate } from "react-router";
import { ButtonForm } from "../../../../../common/form/ButtonForm";
import { useAppDispatch } from "../../../../../store/store";
import { toggle } from "../../../../../reducer/modalSlice";


export function TransactionModal(){

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const onConfirm = () => {
        
        dispatch(toggle());
        navigate("/pages/ordering")
    };

    return(
        <>
            <div id="x">
                <p>
                    Please end the currently open transaction.
                </p>
                <ButtonForm formName={"x"} okBtnTxt="Confirm" cancelBtnTxt="Cancel" isActivated={true} onOkBtnClick={onConfirm}/>
            </div>
        </>
    )
}