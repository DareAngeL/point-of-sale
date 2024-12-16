import { toast } from "react-toastify";
import { PosfileModel } from "../../../../models/posfile";

export function useAutoSalesTranTableInputHandler(
  setIsTransferByDate: React.Dispatch<React.SetStateAction<boolean>>,
  setIsConfirmation: React.Dispatch<React.SetStateAction<boolean>>,
  setModalTitle: React.Dispatch<React.SetStateAction<string>>,
  setDocnumValue: React.Dispatch<React.SetStateAction<string[]>>,
  setArrayCheck: React.Dispatch<any>,
  allLoadedData: PosfileModel[],
  arrayCheck: any,
) {

  const onClickTransfer = (value: string) => {
    if (value == "date") {
      setIsTransferByDate(true);
    } else {
      const count = Object.values(arrayCheck).filter((e: any) => {
        return e.checked == true;
      }).length;
      if (count > 0) {
        setIsConfirmation(true);
        setModalTitle(
          `Are you sure you want to transfer (${count}) transaction(s)?`
        );
        const filterDocument: string[] = [];
        allLoadedData.map((posres: PosfileModel) => {
          Object.values(arrayCheck)
            .filter((e: any) => {
              return e.checked == true;
            })
            .forEach((res: any) => {
              if (posres.docnum == res.docnum) {
                filterDocument.push(res.docnum);
              }
            });
        });

        setDocnumValue(filterDocument);
      } else {
        toast.error("Please select at least one (1) transaction.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      }
    }
  };

  const selectAll = (checked: boolean) => {
    for (const [key, value] of Object.entries(arrayCheck)) {
      const values: any = value;
      if (!values.disable) {
        setArrayCheck((prev: any) => ({
          ...prev,
          [key]: {
            ...prev[key],
            checked: checked,
            disable: false,
          },
          selectall: checked,
        }));
      }
    }
  };

  const onChangeCheck = (recid: string, checked: boolean) => {
    setArrayCheck((prev: any) => ({
      ...prev,
      [recid]: {
        ...prev[recid],
        checked: checked ? true : false,
      },
      selectall:
        Object.values(arrayCheck).filter((e: any) => {
          return e.checked == true;
        }).length <
        Object.values(arrayCheck).filter((e: any) => {
          return e.disable == false;
        }).length
          ? false
          : true,
    }));
  };

  return {
    onClickTransfer,
    selectAll,
    onChangeCheck,
  }
}