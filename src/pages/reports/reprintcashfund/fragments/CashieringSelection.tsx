import { useEffect, useState } from "react";
import { RadioButton } from "../../../../common/form/RadioButton";
import { PosfileModel } from "../../../../models/posfile";
import { useAppDispatch } from "../../../../store/store";
import { getAllCashDeclarations, getAllCashfunds, getAllCashins, getAllCashouts } from "../../../../store/actions/posfile.action";
import { formatNumberWithCommasAndDecimals } from "../../../../helper/NumberFormat";
import { Empty, Modal } from "antd";
import { setReprintCashiering } from "../../../../reducer/transactionSlice";
import { formatTimeTo12Hour } from "../../../../helper/Date";

interface Props {
  onSubmit: () => void;
}

export function CashieringSelection({onSubmit}: Props) {

  const appDispatch = useAppDispatch();
  const [selectedCashieringType, setSelectedCashieringType] = useState<'none'|'cashfund'|'cashin'|'cashout'|'cashdeclaration'>('none');
  const [posData, setPosData] = useState<PosfileModel[]>([]);
  const [openWarningModal, setOpenWarningModal] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      let response;
      switch (selectedCashieringType) {
        case 'cashfund':
          response = await appDispatch(getAllCashfunds());
          if (response.meta.requestStatus === 'fulfilled') {
            setPosData(response.payload);
          }
          break;
        case 'cashin':
          response = await appDispatch(getAllCashins());
          if (response.meta.requestStatus === 'fulfilled') {
            setPosData(response.payload);
          } 
          break;
        case 'cashout':
          response = await appDispatch(getAllCashouts());
          if (response.meta.requestStatus === 'fulfilled') {
            setPosData(response.payload);
          }
          break;
        case 'cashdeclaration':
          response = await appDispatch(getAllCashDeclarations());
          if (response.meta.requestStatus === 'fulfilled') {
            setPosData(response.payload);
          }
          break;
        default:
          return;
      }
    }

    init();
  }, [selectedCashieringType]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSelectedCashieringType(value as any);
  }

  const dispatchReprintCashiering = (pos: PosfileModel) => {
    appDispatch(setReprintCashiering({type: selectedCashieringType, data: pos}));
  }

  const removeReprintCashiering = () => {
    appDispatch(setReprintCashiering({type: 'none', data: null}));
  }

  return (
    <>
      <Modal
        open={openWarningModal}
        title="Are you sure you want to reprint?"
        okButtonProps={{ style: { backgroundColor: 'green' } }}
        onOk={() => {
          onSubmit();
          setOpenWarningModal(false);
        }}
        onCancel={() => {
          setOpenWarningModal(false);
          removeReprintCashiering();
        }}
      />

      <div className="flex flex-col">
        <RadioButton 
          name={""} 
          radioDatas={[
            {
              id: "0",
              value: "cashfund",
              name: "Cash Fund",
            },
            {
              id: "1",
              value: "cashin",
              name: "Cash In",
            },
            {
              id: "2",
              value: "cashout",
              name: "Cash Out",
            },
            {
              id: "3",
              value: "cashdeclaration",
              name: "Cash Declaration",
            }
          ]}
          value={selectedCashieringType} 
          description={"Choose Cashiering Type"} 
          handleInputChange={handleInputChange}
        />

        {posData.length > 0 && (
          <>
            <div className="h-[1px] bg-gray-700"/>
            <p className="text-[12px] mt-3">{selectedCashieringType.toLocaleUpperCase()}(S)</p>
            {posData.map((pos, index) => (
              <div 
                key={index} 
                className="flex justify-between"
                onClick={() => {
                  dispatchReprintCashiering(pos);
                  setOpenWarningModal(true);
                }}
              >
                <div className="select-none flex hover:bg-slate-300 hover:cursor-pointer w-full p-1">
                  <span className="bg-green-500 text-[12px] p-1 rounded-md text-white font-bold">Amount</span> 
                  <span className="ms-2">₱{formatNumberWithCommasAndDecimals(pos.extprc||0, 2)}</span>
                  <span className="ms-auto">{formatTimeTo12Hour(pos.logtim!)}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {(selectedCashieringType !== 'none' && posData.length === 0) && (
          <>
            <div className="h-[1px] bg-gray-700"/>
            <Empty className="mt-10" /> 
          </>
        )}
      </div>
    </>
  );
}
