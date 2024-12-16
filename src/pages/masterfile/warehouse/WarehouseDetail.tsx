/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import {WarehouseDetailsModel} from "../../../models/warehousedetail";
import {useNavigate, useParams} from "react-router";
import {BackButton} from "../../../common/backbutton/BackButton";
import {InputText} from "../../../common/form/InputText";
import {Selection} from "../../../common/form/Selection";
import {Checkbox} from "../../../common/form/Checkbox";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {ApiService} from "../../../services";
import {toast} from "react-toastify";
import {setWarehouse} from "../../../reducer/masterfileSlice";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {MODULES, METHODS} from "../../../enums/activitylogs";
import {useCentral} from "../../../hooks/centralHooks";
export function WarehouseDetail() {
  const params = useParams();

  const navigate = useNavigate();

  const appDispatcher = useAppDispatch();
  const {warehouse, dineType, priceList} = useAppSelector(
    (state) => state.masterfile
  );
  const [warehouseDetailSend, setWarehouseDetailSend] = useState<{
    [key: string]: WarehouseDetailsModel;
  }>({});
  const [title, setTitle] = useState("");
  const [tenant, setTenant] = useState("");
  const [errors, setErrors] = useState<boolean[]>([]);
  const {postActivity} = useUserActivityLog();

  const {checkLinkInputsCentral, isCentralConnected} = useCentral();

  useEffect(() => {
    checkLinkInputsCentral(); // check if the inputs are linked to central - if it is, disable the inputs if central is connected
    const find = warehouse.data.find((w) => w.warcde == params.warcde);

    setWarehouseDetailSend(() => {
      const obj: { [key: string]: WarehouseDetailsModel } = {};

      if (!find?.warehousefile2s) return obj;

      find?.warehousefile2s.forEach((w: WarehouseDetailsModel) => {
        obj[w.postypcde] = w;
      });

      return obj;
    });
    setTitle(find?.wardsc as string);
    setTenant(find?.wardsc as string);
  }, []);

  const handleInputChange =
    (postypcde: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = e.target;

      setWarehouseDetailSend((prev) => ({
        ...prev,
        [postypcde]: {
          ...warehouseDetailSend[postypcde],
          postypcde: value,
          warcde: params.warcde,
          is_active: checked ? 1 : 0,
        },
      }));
    };

  const handleTenantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTenant(value);
  };

  const handleSelectChange =
    (postypcde: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      setWarehouseDetailSend((prev) => ({
        ...prev,
        [postypcde]: { ...prev[postypcde], prccde: value },
      }));
    };

  const updateWarehouse = async (values: WarehouseDetailsModel[]) => {
    const find = warehouse.data.find((w) => w.warcde == params.warcde);
    console.log("find: ", find);
    const copyFind = Object.assign({}, find);
    if (copyFind) copyFind.wardsc = tenant;
    Reflect.deleteProperty(copyFind, "warehousefile2s");
    Reflect.deleteProperty(copyFind, "title");

    const warehouseResult = ApiService.put("warehouse", copyFind);
    const result = await toast.promise(warehouseResult, {
      pending: "Pending request",
      success: {
        hideProgressBar: true,
        autoClose: 1500,
        position: 'top-center',
        render: "Successfully updated!",
      },
      error: {
        render: "Something went wrong. Unable to update.",
      },
    });

    if (result?.status === 200) {
      // update the redux state also
      appDispatcher(
        setWarehouse(
          warehouse.data.map((w) => {
            if (w.warcde == params.warcde) {
              return {
                ...w,
                wardsc: tenant,
                warehousefile2s: values,
              };
            }

            return w;
          })
        )
      );
      navigate(-1);

      return;
    }

    toast.error("Something went wrong. Unable to update.", {
      autoClose: 1500,
      position: 'top-center',
      hideProgressBar: true,
    });
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    postActivity({
      method: METHODS.UPDATE,
      module: MODULES.WAREHOUSE,
      remarks: `UPDATED WAREHOUS DETAILS: \n${tenant} | ${params.warcde}`,
    });

    if (errors.some((e) => e)) {
      toast.error("Please fill out all required fields.", {
        autoClose: 1500,
        position: 'top-center',
        hideProgressBar: true,
      });
      return;
    }

    const values = Object.values(warehouseDetailSend);
    if (values.length === 0) {
      updateWarehouse([]);
      return;
    }

    const warehousedetailResult = await ApiService.put(
      `warehousedetail/${params.warcde}`,
      values
    );

    if (warehousedetailResult?.status == 200) {
      updateWarehouse(values);
    } else {
      toast.error("Something went wrong. Unable to update.", {
        autoClose: 1500,
        position: 'top-center',
        hideProgressBar: true,
      });
    }

    warehouseDetailSend;
  };

  return (
    <>
      <section className="h-screen w-full relative items-center flex flex-col gap-4 p-[60px]">
        <div className="bg-white flex justify-between w-full items-center fixed z-10 left-[3%] top-0 pt-2">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={title} />
          </div>
        </div>

        <form id="w-form" onSubmit={handleOnSubmit} className="w-[70%]">
          <InputText
            handleInputChange={handleTenantNameChange}
            name={"wardsc"}
            value={tenant}
            id={"wardsc"}
            description={"Warehouse/Tenant"}
            linkCentral={true}
          />

          <div className="border">
            <div className="grid grid-cols-12 items-center h-[50px] font-montserrat text-[1rem] text-white font-bold bg-slate-700">
              <div className="col-span-2" />
              <div className="col-span-2 text-center">{"Dine Type"}</div>
              <div className="col-span-2" />
              <div className="col-span-2" />
              <div className="col-span-2 text-center w-[165px]">
                {"Price List"}
              </div>
              <div className="col-span-2" />
            </div>

            {dineType.data.map((item, index) => (
              <div key={item.recid} className="grid grid-cols-12 border">
                <div className="col-span-2" />
                <Checkbox
                  className="col-span-2 ms-[15%]"
                  handleInputChange={handleInputChange(item.postypcde)}
                  checked={warehouseDetailSend[item.postypcde]?.is_active === 1}
                  id={`postypdsc${index}`}
                  name={`postypdsc${index}`}
                  description={item.postypdsc}
                  value={item.postypcde}
                  linkCentral={true}
                />
                <div className="col-span-2" />

                <div className="col-span-2" />

                <Selection
                  className="col-span-2 w-[165px] py-2"
                  handleSelectChange={handleSelectChange(item.postypcde)}
                  description={""}
                  value={warehouseDetailSend[item.postypcde]?.prccde}
                  disabled={
                    !warehouseDetailSend[item.postypcde]?.is_active &&
                    !isCentralConnected.current
                  }
                  id={"prccde"}
                  name={"prccde"}
                  keyValuePair={priceList.data.map((pl) => {
                    return { key: pl.prcdsc, value: pl.prccde };
                  })}
                  showEmptyIndicator={
                    warehouseDetailSend[item.postypcde]?.postypcde != null &&
                    warehouseDetailSend[item.postypcde]?.is_active === 1 &&
                    warehouseDetailSend[item.postypcde]?.prccde == null
                  }
                  onShowEmptyIndicator={(isShown) => {
                    setErrors((prev) => {
                      prev[index] = isShown;
                      return [...prev];
                    });
                  }}
                  linkCentral={true}
                />
                <div className="col-span-2" />
              </div>
            ))}
          </div>
        </form>

        <ButtonForm
          isShowWarningCancel
          dontEmptyUndefinedData
          data={
            Object.keys(warehouseDetailSend).length === 0
              ? undefined
              : {
                  tenant: tenant,
                  ...warehouseDetailSend,
                }
          }
          formName={"w-form"}
          okBtnTxt="Update Data"
          isActivated={true}
          isCentralConnected={isCentralConnected.current}
        />
      </section>
    </>
  );
}
