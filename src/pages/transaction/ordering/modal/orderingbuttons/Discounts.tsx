import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {Selection} from "../../../../../common/form/Selection";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {useEffect, useRef, useState} from "react";
import {PosfileModel} from "../../../../../models/posfile";
import {Checkbox} from "../../../../../common/form/Checkbox";
// import {useOrderingButtons} from "../../hooks/orderingHooks";
import {DiscountModel} from "../../../../../models/discount";
import {CustomModal} from "../../../../../common/modal/CustomModal";
import DiscountUserDetails from "./discount/DiscountUserDetails";
import {Empty} from "antd";
import {toast} from "react-toastify";
import { useFormInputValidation } from "../../../../../hooks/inputValidation";
import { getSingleItem } from "../../../../../store/actions/items.action";
import { useOrderingButtons } from "../../hooks/orderingHooks";
import { formatNumberWithCommasAndDecimals } from "../../../../../helper/NumberFormat";

interface DiscountRequiredValues {
  "Type of Discount *": string;
}

export function Discount() {
  // const dispatch = useAppDispatch();
  const {discount /*item*/} = useAppSelector((state) => state.masterfile);
  const {posfiles, orderDiscount} = useAppSelector((state) => state.order);
  const { discountButton } = useOrderingButtons();

  // const orderingButtons = useOrderingButtons();

  const [discountPosfile, setDiscountPosfile] = useState<PosfileModel[]>([]);

  const [discountModel, setDiscountModel] = useState<DiscountModel>();
  const [checkedPosfile, setCheckedPosfile] = useState<PosfileModel[]>([]);
  const [customModal, setCustomModal] = useState<boolean>(false);
  const [isSelectAll, setSelectAll] = useState<boolean>(false);
  const [disable, setDisable] = useState(false);
  const [remainingDiscountsToAdd, setRemainingDiscountsToAdd] = useState<{[index: string]: number}>({}); // e.g. {'orderitmid': 2}

  const appDispatch = useAppDispatch();

  const formRef = useRef<HTMLFormElement>(null);
  const {
    handleSubmit,
    changeRequiredValue,
    errors,
  } = useFormInputValidation<DiscountRequiredValues>(undefined, {
    form: formRef,
    inputNames: ["discde"],
    data: discountModel
  });

  useEffect(() => {
    const load = async () => {
      const clonedUpdatePosfile = await Promise.all(
        posfiles.data.map(async (d) => {
          // const findItem = item.data.find((itm) => itm.itmcde == d.itmcde);

          const item = (await appDispatch(getSingleItem(d.itmcde || ''))).payload;

          return {...d, itmdsc: item.itmdsc};
        })
      );

      const filteredPosfile = clonedUpdatePosfile.filter((d) => {
        
        const itempax = d.itmpaxcount === 0 ? 1 : d.itmpaxcount;
        const itemOrderDiscounts = orderDiscount.data.filter(f => f.orderitmid === d.orderitmid);
        const remaining = (itempax || itemOrderDiscounts.length) - itemOrderDiscounts.length;

        setRemainingDiscountsToAdd(prev => {
          return {
            ...prev,
            [d.orderitmid as string]: remaining
          };
        });

        return remaining > 0;
      });

      setDiscountPosfile(filteredPosfile);
    };

    load();
  }, []);

  const onSelectChange = ({
    target: {value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    const findDiscount = discount.data.find((d) => d.discde == value);
    changeRequiredValue("discde", value);
    setDiscountModel(findDiscount as DiscountModel);
  };

  const onCheckboxChange = ({
    target: {value, checked},
  }: React.ChangeEvent<HTMLInputElement>) => {
    const findPosfile = posfiles.data.find((pf) => pf.orderitmid == value);
    const tempPosfile = checkedPosfile.filter((tpf) => tpf.orderitmid != value);

    if (checked) {
      setCheckedPosfile([...tempPosfile, findPosfile] as PosfileModel[]);
    } else {
      setCheckedPosfile(tempPosfile as PosfileModel[]);
    }
  };

  const handleSelectAll = () => {
    console.log(discountPosfile);
    setSelectAll(!isSelectAll);
    if (isSelectAll === true) {
      setCheckedPosfile([]);
    } else {
      setCheckedPosfile([...discountPosfile]);
    }
  };

  const onSubmit = () => {

    setDisable(true);

    if (checkedPosfile.length <= 0) {
      toast.error("No item selected. Unable to proceed.", {
        autoClose: 2000,
        position: 'top-center',
        hideProgressBar: true,
      });
      return;
    }

    const isGovDisc = (discountModel?.govdisc as number)*1 === 1;
    if (isGovDisc) {
      setCustomModal(true);
      return;
    }

    // if discount is not a government discount don't show the customer detail modal
    discountButton(discountModel as DiscountModel, checkedPosfile);
  }

  const findItemCheck = (id: any) => {
    return checkedPosfile.some((obj) => obj.recid === id);
  };

  return (
    <>
      <form
        ref={formRef}
        id="discounts"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Selection
          handleSelectChange={onSelectChange}
          description={"Type of Discount *"}
          id={"discde"}
          name={"discde"}
          keyValuePair={discount.data.map((disc) => {
            return {key: disc.disdsc, value: disc.discde};
          })}
          value={discountModel?.discde}
          error={errors}
          required
        />

        <div className="mt-9 font-black">
          {discountPosfile.length > 0 ? (
            <label>Select item you want discount to be applied.</label>
          ) : posfiles.data.length > 0 ? (
            <Empty description="You have already added all items a discount." />
          ) : (
            <Empty description="No available items to add a discount." />
          )}
        </div>

        <div className=" h-[300px] overflow-y-auto">
          {discountPosfile.filter(
            (item) => item.itmcomtyp === null && item.isaddon !== 1
          ).length > 1 && (
            <div className="flex justify-end items-center gap-[5px]">
              <p className="h-[20px] font-bold">
                {isSelectAll ? "Unselect All" : "Select All"}
              </p>
              <Checkbox
                handleInputChange={handleSelectAll}
                checked={undefined}
                id={"orderitmid"}
                name={"orderitmid"}
                // value={d.orderitmid}
                description={""}
                alignment="flex-row justify-between"
              />
            </div>
          )}

          {discountPosfile
            .filter((item) => item.itmcomtyp === null && item.isaddon !== 1 && item.extprc!*1 > 0)
            .map((d, index) => (
              <>
                <Checkbox
                  key={index}
                  handleInputChange={onCheckboxChange}
                  // checked={undefined}
                  checked={findItemCheck(d.recid)}
                  id={"orderitmid" + index}
                  name={"orderitmid" + index}
                  value={d.orderitmid}
                  description={(formatNumberWithCommasAndDecimals(d.itmqty || "")+"pcs "+d.itmdsc) || ""}
                  alignment="pb-[1px] flex-row justify-between"
                />
                {(d.itmpaxcount || 1) > 1 && (
                  <span className="text-[11px]">** Can be able to add {d.itmpaxcount} discounts: <span className="bg-green-400 rounded p-[2px] px-2 font-bold text-white">{remainingDiscountsToAdd[d.orderitmid || '']} left</span></span>
                )}
                <div className="border-[1px]" />
              </>
            ))}

          {/* {discountPosfileCheck.map((d, index) => (
            <>
              <Checkbox
                key={index}
                handleInputChange={onCheckboxChange}
                checked={d.isChecked}
                id={"orderitmid"}
                name={"orderitmid"}
                value={d.orderitmid}
                description={d.itmdsc || ""}
                alignment="flex-row justify-between"
              />
            </>
          ))} */}
        </div>
      </form>

      <ButtonForm
        formName={"discounts"}
        okBtnTxt="Update"
        disabled={disable}
      />
      {customModal && (
        <CustomModal
          modalName={discountModel?.disdsc || ""}
          maxHeight={""}
          onExitClick={() => setCustomModal(false)}
          isShowXBtn={true}
        >
          {
            <DiscountUserDetails
              itmcde={discountModel?.discde as string}
              discountContent={discountModel as DiscountModel}
              checkedPosfile={checkedPosfile as any}
              onSubmit={() => {
                setCustomModal(false);
              }}
            />
          }
        </CustomModal>
      )}
    </>
  );
}
