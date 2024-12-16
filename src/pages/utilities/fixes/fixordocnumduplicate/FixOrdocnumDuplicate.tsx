import moment from "moment";
import { useState } from "react";
import { InputDateV2 } from "../../../../common/form/InputDate";
import { SingleButtonForm } from "../../../../common/form/SingleButtonForm";
import { useAppDispatch } from "../../../../store/store";
import { fixOrdocnumDuplicate } from "../../../../store/actions/utilities/fixordocnumduplicate.action";
import { toast } from "react-toastify";
import { CustomModal } from "../../../../common/modal/CustomModal";


interface FixOrdocnumDuplicateProps {
    onClose: () => void;
}

export function FixOrdocnumDuplicate(props: FixOrdocnumDuplicateProps) {

    const appDispatch = useAppDispatch();

    const [dateRange, setDateRange] = useState({
        from: moment().format("YYYY-MM-DD"),
        to: moment().format("YYYY-MM-DD"),
    });
    const [isFixingOrdercde, setIsFixingOrdercde] = useState<boolean>(false);

    const onChangeDate = (name: string, value: string) => {
        setDateRange((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onFixClick = async () => {
        setIsFixingOrdercde(true);
        document.body.style.cursor = "wait";
        const loadingToastId = toast.loading("Fixing duplicate ordocnum items... Please wait...", {
            position: "top-center",
            autoClose: false,
            hideProgressBar: true
        });

        const result = await appDispatch(fixOrdocnumDuplicate(dateRange));
        const deletedItem = result.payload;

        if (deletedItem && deletedItem.length > 0) {
            toast.success("Successfully fixed duplicate ordocnum items", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
            });
        }
        else {
            toast.error("No duplicate ordocnum items found", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
            });
        }

        document.body.style.cursor = "default";
        loadingToastId && toast.dismiss(loadingToastId);
        setIsFixingOrdercde(false);
    }

    return (
        <>
            <CustomModal 
                modalName={"Fix Duplicate Ordocnum"} 
                maxHeight={""}
                isShowXBtn={!isFixingOrdercde}
                onExitClick={props.onClose}
            >
                <div className="flex">
                    <div className="flex-auto mx-2">
                        <InputDateV2
                            handleInputChange={onChangeDate}
                            name={"from"}
                            value={dateRange.from}
                            id={"from"}
                            description={"Date From:"}
                        />
                    </div>
                    <div className="flex-auto">
                        <InputDateV2
                            handleInputChange={onChangeDate}
                            name={"to"}
                            value={dateRange.to}
                            id={"to"}
                            description={"Date To:"}
                        />
                    </div>
                </div>

                <SingleButtonForm 
                    formName={""} 
                    labelName={"FIX"} 
                    onClick={onFixClick}
                    disabled={isFixingOrdercde}
                />
            </CustomModal>
        </>
    )
}