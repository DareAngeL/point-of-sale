
import React, {useEffect, useState} from "react";
import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {Checkbox} from "../../../../../common/form/Checkbox";
import {useAppSelector} from "../../../../../store/store";
import {
  priceListGenerator,
  useOrderingButtons,
} from "../../hooks/orderingHooks";
import {OrderingModel} from "../../model/OrderingModel";
import {ItemModel} from "../../../../../models/items";
import { ApiService } from "../../../../../services";
import { Empty, Spin } from "antd";
import { toast } from "react-toastify";

export function AddOn() {

  const [isFetching, setIsFetching] = useState(false);
  const {addOnItem} = useOrderingButtons();

const {warehouse, priceList, /*item*/} = useAppSelector(
    (state) => state.masterfile
  );
  const {transaction} = useAppSelector((state) => state.order);

  const [addOnItems, setAddOnItems] = useState<ItemModel[]>();
  const [tempAddOnItems, setTempAddOnItems] = useState<{
    [item: string]: ItemModel;
  }>();

  useEffect(() => {
    const load = async () => {
      const activePricelist = await priceListGenerator(
        warehouse.data,
        priceList.data,
        transaction.data as OrderingModel
      );
  
      // const filteredPricelist = activePricelist?.pricecodefile2s.filter(
      //   (d) => item.data.find((it) => it.itmcde == d.itmcde)?.isaddon
      // );
      setIsFetching(true);
      const addons = (await ApiService.get(`pricedetail/load_addons/${activePricelist?.prccde}`)).data;
      setIsFetching(false);
      // const mappedPricelist = await Promise.all(filteredPricelist?.map(async (d:any) => {
      //   // return item.data.find((it) => it.itmcde == d.itmcde) as ItemModel;
      //   return (await ApiService.get(`item/filter/?itmcde=${d.itmcde}&page=0&pageSize=10`)).data[0];
      // }));
  
      setAddOnItems(addons);
    }

    load();
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempAddOnItems || Object.keys(tempAddOnItems).length === 0) {
      return toast.error("Please select at least one addon.", {
        autoClose: 2000,
        position: 'top-center',
        hideProgressBar: true,
      });
    }
    
    const addOnItems = Object.values(
      tempAddOnItems as {[item: string]: ItemModel}
    );

    addOnItem(addOnItems);
  };

  const onChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value, checked} = e.target;

    if (checked) {
      const findItem = addOnItems?.find((d) => d.recid + "" == value);

      setTempAddOnItems(
        (prev) =>
          ({
            ...prev,
            [value]: findItem,
          } as {[item: string]: ItemModel})
      );
    } else {
      if (tempAddOnItems) {
        const {[value]: removed, ...newState} = tempAddOnItems;

        console.log(removed);
        console.log(newState);

        setTempAddOnItems(newState);
      }
    }

    console.log(tempAddOnItems);
  };

  return (
    <>
      <section>
        <form id="addon" onSubmit={onSubmit}>
          {isFetching && (
            <div className="flex">
              <Spin className="mx-auto" />
            </div>
          )}
          {addOnItems &&
            addOnItems.map((item) => (
              <>
                <Checkbox
                  checked={
                    tempAddOnItems && tempAddOnItems[item.recid + ""]?.isaddon
                  }
                  id={"isaddon"}
                  name={"isaddon"}
                  description={item?.itmdsc as string}
                  value={item.recid}
                  handleInputChange={onChangeCheckbox}
                />
              </>
            ))}
            {addOnItems && addOnItems.length === 0 && (
              <Empty
                description="No available addons"
              />
            )}
        </form>

        <ButtonForm formName={"addon"} />
      </section>
    </>
  );
}
