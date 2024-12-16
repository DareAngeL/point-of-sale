import { useState } from "react";
import { CustomModal } from "../../../../common/modal/CustomModal";
import { SingleButtonForm } from "../../../../common/form/SingleButtonForm";
import { fixNoOrdocnum } from "../../../../store/actions/utilities/fixposorderingfile.action";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../../store/store";

interface FixPosOrderingfileProps {
    onClose: () => void;
}

export function FixPosOrderingfile(props: FixPosOrderingfileProps) {

    const appDispatch = useAppDispatch();
    const [isFixing, setIsFixing] = useState(false);

    const onFixClick = async () => {
        setIsFixing(true);
        document.body.style.cursor = "wait";
        const loadingToastId = toast.loading("Fixing duplicate no ordocnum in 'posorderingfile' table... Please wait...", {
            position: "top-center",
            autoClose: false,
            hideProgressBar: true
        });

        const result = await appDispatch(fixNoOrdocnum());
        const resultPayload = result.payload;

        if (resultPayload && resultPayload.status === 'success') {
            toast.success("Successfully fixed duplicate no ordocnum items", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
            });
        }
        else if (resultPayload && resultPayload.status === 'failed') {
            toast.info(resultPayload.message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
            });
        }
        else {
            toast.error('Something went wrong', {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
            })
        }

        document.body.style.cursor = "default";
        loadingToastId && toast.dismiss(loadingToastId);
        setIsFixing(false);
    }

    return (
        <CustomModal 
            modalName={"Fix 'No Ordocnum' Duplicate"} 
            maxHeight={""}
            isShowXBtn={!isFixing}
            onExitClick={props.onClose}
        >
            <p>Click 'FIX' to start fixing.</p>

            <SingleButtonForm 
                formName={""} 
                labelName={"FIX"} 
                onClick={onFixClick}
                disabled={isFixing}
            />
        </CustomModal>
    )
}