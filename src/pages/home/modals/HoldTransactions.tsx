import { ChangeEvent, useState } from "react";
import { Checkbox } from "../../../common/form/Checkbox";
import { useTheme } from "../../../hooks/theme";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { toast } from "react-toastify";
import { getAllActiveHoldTransactions, manualCloseTransaction } from "../../../store/actions/transaction.action";
import { CustomModal } from "../../../common/modal/CustomModal";
import { Empty, Spin } from "antd";

export function HoldTransactions() {
  const { ButtonStyled, ButtonTextStyled, theme } = useTheme();
  const { allHoldTransactions: allOpenTransactions } = useAppSelector(state => state.transaction);
  const appDispatch = useAppDispatch();

  const [isClosingTrans, setIsClosingTrans] = useState(false);
  const [selectedTrans, setSelectedTrans] = useState<any[]>([]);

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = e.target;

    if (name === 'sel-all') {
      if (checked) {
        setSelectedTrans(allOpenTransactions.data.rows);
      } else {
        setSelectedTrans([]);
      }
      return;
    }

    if (checked) {
      setSelectedTrans([...selectedTrans, allOpenTransactions.data.rows.find((t: any) => t.tabletrncde === name)]);
    } else {
      setSelectedTrans(selectedTrans.filter(t => t.tabletrncde !== name));
    }
  }

  const onCloseTransactions = async () => {
    if (selectedTrans.length === 0) {
      return toast.error("Please select transactions to close.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }

    setIsClosingTrans(true);

    let hasErrors = false;
    await Promise.all(
      selectedTrans.map(async(t: any) => {
        try {
          await appDispatch(manualCloseTransaction(t.tabletrncde));
        } catch (err) {
          hasErrors = true;
          console.error(err);
        }
      })
    );

    if (hasErrors) {
      toast.info("There are transactions that are not closed", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }

    toast.success("Transaction(s) successfully closed", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
    });

    await appDispatch(getAllActiveHoldTransactions());
    setIsClosingTrans(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000)
  }

  if (allOpenTransactions.data.count === 0) {
    return (
      <>
        <div className="flex w-full h-[400px] justify-center items-center">
          <Empty description="No hold transactions" />
        </div>
      </>
    )
  }

  return (
    <>
      {isClosingTrans && (
        <CustomModal 
          modalName={"Closing Transaction"} 
          maxHeight={""} 
          height={50}
        >
          <div className="flex">
            <Spin />
            <span className="ms-5">Closing transaction(s)... Please wait...</span>
          </div>
        </CustomModal>

      )}

      <div id="open-trans">
        <div className="w-full">
          <div className="sticky top-[-2%] w-full bg-white p-2 shadow-md">
            <ButtonStyled $color={theme.primarycolor} className="rounded-md p-1" onClick={onCloseTransactions}>
              <ButtonTextStyled $color={theme.primarycolor} className="text-[14px]">
                CLOSE SELECTED TRANSACTIONS
              </ButtonTextStyled>
            </ButtonStyled>

            <Checkbox
              checked={selectedTrans.length === allOpenTransactions.data.rows.length}
              id={"sel-all"}
              name={"sel-all"}
              description={"Select All"}
              className="pb-0"
              handleInputChange={onSelect}
            />
          </div>

          <div>

            {allOpenTransactions.data.rows.map((d: any) => (
              <div className="flex items-center justify-between">
                <Checkbox 
                  checked={selectedTrans.find(t => t.tabletrncde === d.tabletrncde) !== undefined} 
                  id={d.tabletrncde} 
                  name={d.tabletrncde} 
                  description={d.tabletrncde} 
                  handleInputChange={onSelect}
                />
                <span className={`rounded-sm p-1 text-[12px] font-bold ${d.status === 'OPEN' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>STATUS: {d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
