import {RadioButton} from "../../../../../../common/form/RadioButton";
import {useEffect, useState} from "react";
import {PaymentButtons} from "../../../common/buttons/PaymentButtons";
import {CustomModal} from "../../../../../../common/modal/CustomModal";
import Check from "./DetailedModals/Check";
import OtherPayment from "./DetailedModals/OtherPayment";
import Card from "./DetailedModals/Card";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import useRefundHooks from "../../../hooks/refundHooks";
import {setModeOfRefund2} from "../../../../../../reducer/refundSlice";
import { RefundReceiptV2 } from "../../../receipt/RefundReceiptV2";
import { getPreviousTrnsactionPayment } from "../../../../../../store/actions/posfile.action";

interface RefundModeProps {
  onClear: () => void;
}

export function RefundModeOfRefund({}: RefundModeProps) {
  const {toRefund} = useAppSelector((state) => state.refund);
  const dispatch = useAppDispatch();
  // const {refundTransaction, reprintRefund} = useOrderingButtons();
  const {handleSubmit} = useRefundHooks();

  const [modeOfRefund, setModeOfRefund] = useState<string>("CASH");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getPreviousTrnsactionPayment(toRefund.data[0].ordercde));
  }, []);

  const handleProceed = async () => {
    if (modeOfRefund === "CASH") {
      handleSubmit({modeOfRefund: "CASH", supportingDetails: undefined});
    } else {
      setIsDetailsModalOpen(true);
    }
  };

  const renderDetailedModal = () => {
    switch (modeOfRefund) {
      case "CHECK":
        return <Check modeOfRefund={modeOfRefund} />;
      case "DEBIT CARD":
        return (
          <Card selectedCardType="DEBIT CARD" /*modeOfRefund={modeOfRefund}*/ />
        );
      case "CREDIT CARD":
        return (
          <Card selectedCardType="CREDIT CARD" /*modeOfRefund={modeOfRefund}*/ />
        );
      case "OTHER PAYMENT":
        return <OtherPayment />;
    }
  };

  return (
    <>
      {isDetailsModalOpen ? (
        <CustomModal
          modalName={modeOfRefund}
          maxHeight={""}
          onExitClick={() => {
            setIsDetailsModalOpen(false);
          }}
          isShowXBtn={true}
        >
          {renderDetailedModal()}
        </CustomModal>
      ) : (
        <div>
          {/* <div className="hidden"> */}
          <div className="top-0 left-0 fixed z-20 opacity-[0] bg-white">
            <RefundReceiptV2
              voidPosfile={undefined}
              modeOfRefund={modeOfRefund}
            />
          </div>
          <RadioButton
            name={"exemptvat"}
            id={"exemptvat"}
            radioDatas={[
              {name: "CASH", id: "cash", value: "CASH"},
              {name: "CHECK", id: "check", value: "CHECK"},
              {name: "DEBIT CARD", id: "debitcard", value: "DEBIT CARD"},
              {name: "CREDIT CARD", id: "creditcard", value: "CREDIT CARD"},
              //   {name: "GIFT CHECK", id: "giftcheck", value: "GIFT CHECK"},
              {
                name: "OTHER PAYMENT",
                id: "otherpayment",
                value: "OTHER PAYMENT",
              },
            ]}
            value={modeOfRefund}
            description={"Mode of Refund"}
            handleInputChange={(e) => {
              dispatch(setModeOfRefund2(e.target.value));
              setModeOfRefund(e.target.value);
            }}
          />

          <PaymentButtons buttonName={"Proceed"} onClick={handleProceed} />
        </div>
      )}
    </>
  );
}
