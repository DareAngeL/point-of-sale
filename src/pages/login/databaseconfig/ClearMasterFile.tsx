import { useState } from "react";
import { Checkbox } from "../../../common/form/Checkbox";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { useChangeNameModal, useModal } from "../../../hooks/modalHooks";
import { toast } from "react-toastify";
import { useService } from "../../../hooks/reportHooks";
import { useNavigate } from "react-router";

export function ClearMasterFile() {
  const [data, setData] = useState({
    itemclassification: true,
    itemsubclassification: true,
    item: true,
    dinetype: true,
    pricelist: true,
    warehouse: true,
  });
  const [tableList, setTableList] = useState<any>([
    "itemclassification",
    "itemsubclassification",
    "item",
    "dinetype",
    "pricelist",
    "warehouse",
  ]);
  const [confirm, setConfirm] = useState(false);
  const { postData } = useService();

  const { dispatch } = useModal();
  const { modalNameDispatch } = useChangeNameModal();
  const navigate = useNavigate();

  const handleInputChange = ({
    target: { name, checked },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev: any) => ({
      ...prev,
      [name]: checked,
    }));
    if (checked) {
      tableList.push(name);
    } else {
      setTableList(tableList.filter((e: any) => e !== name));
    }
  };

  const onConfirm = () => {
    if (tableList && tableList.length > 0) {
      if (tableList.find((e: any) => e === "item")) {
        tableList.push("itemcombo");
      }
      if (tableList.find((e: any) => e === "pricelist")) {
        tableList.push("pricedetail");
      }
      if (tableList.find((e: any) => e === "warehouse")) {
        tableList.push("warehousedetail");
      }
      if (
        tableList.find((e: any) => e === "itemclassification") &&
        !tableList.find((e: any) => e === "itemsubclassification")
      ) {
        toast.error("If Class is selected, Subclass should be included", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
        return;
      }
      if (
        tableList.find((e: any) => e === "itemclassification") &&
        !tableList.find((e: any) => e === "item")
      ) {
        toast.error("If Class is selected, Item should be included", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
        return;
      }
      if (
        tableList.find((e: any) => e === "itemsubclassification") &&
        !tableList.find((e: any) => e === "item")
      ) {
        toast.error("If Subclass is selected, Item should be included", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
        return;
      }
    } else {
      toast.error("No Masterfile Selected", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
      return;
    }

    modalNameDispatch("CLEAR MASTERFILE");
    setConfirm(true);
  };

  const onOkBtnClick = async () => {
    const loading = toast.loading("Resetting Masterfile...", {
      position: 'top-center',
    });
    await postData("clearmasterfile", { tables: tableList }, (res: any) => {
      if (res.data.success) {
        toast.dismiss(loading);
        dispatch();
        navigate("/pages/login");
        window.location.reload();
      }
    });
  };

  return (
    <>
      {confirm ? (
        <>
          <div>
            <label>
              This will reset data for the selected Masterfile. Are you sure?
            </label>

            <ButtonForm
              formName=""
              okBtnTxt="Yes"
              cancelBtnTxt="No"
              onOkBtnClick={onOkBtnClick}
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <Checkbox
              description="Item Classifications"
              name="itemclassification"
              id="itemclassification"
              value={data.itemclassification}
              checked={data.itemclassification}
              handleInputChange={handleInputChange}
            />

            <Checkbox
              description="Item Subclassifications"
              name="itemsubclassification"
              id="itemsubclassification"
              value={data.itemsubclassification}
              checked={data.itemsubclassification}
              handleInputChange={handleInputChange}
            />

            <Checkbox
              description="Items"
              name="item"
              id="item"
              value={data.item}
              checked={data.item}
              handleInputChange={handleInputChange}
            />

            <Checkbox
              description="Dine Type"
              name="dinetype"
              id="dinetype"
              value={data.dinetype}
              checked={data.dinetype}
              handleInputChange={handleInputChange}
            />

            <Checkbox
              description="Pricelist"
              name="pricelist"
              id="pricelist"
              value={data.pricelist}
              checked={data.pricelist}
              handleInputChange={handleInputChange}
            />

            <Checkbox
              description="Warehouse/Tenant"
              name="warehouse"
              id="warehouse"
              value={data.warehouse}
              checked={data.warehouse}
              handleInputChange={handleInputChange}
            />
          </div>

          <ButtonForm
            isShowWarningCancel
            data={data}
            formName=""
            okBtnTxt="Confirm"
            onOkBtnClick={onConfirm}
          />
        </>
      )}
    </>
  );
}
