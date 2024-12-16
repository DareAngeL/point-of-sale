import {useAppSelector} from "../../../../../store/store";
import {useParams} from "react-router";
import {Checkbox} from "../../../../../common/form/Checkbox";
import {useState, useEffect} from "react";
import {ItemComboModel} from "../../../../../models/itemCombo";
import {useOrdering} from "../../hooks/orderingHooks";
import {InputNumber} from "../../../../../common/form/InputNumber";
import {toggleFullScreen, toggle} from "../../../../../reducer/modalSlice";
import {useAppDispatch} from "../../../../../store/store";
import {ArrowUpOutlined, ArrowDownOutlined} from "@ant-design/icons";
import { ApiService } from "../../../../../services";

type Props = {};

interface ItemCombo {
  recid: number;
  itmcde: string;
  itmcomcde: string;
  itmdsc: string;
  untmea: string;
  itmcomtyp: string;
  upgprc: string;
  itmcderef: null | string;
  itmnum: string;
  comboQuantity: number;
  combodocnum: string;
}

export default function ItemCombo({}: Props) {
  const {itemCombo, /*item*/} = useAppSelector((state) => state.masterfile);
  const { transaction } = useAppSelector((state) => state.order);
  const dispatch = useAppDispatch();
  const {itmcde} = useParams();
  const {onAddTransactionCombo} = useOrdering();

  // const [defaultTotal, setDefaultTotal] = useState<number | undefined>();
  // const [othersTotal, setOthersTotal] = useState<number | undefined>();
  // const [upgradeTotal, setUpgradeTotal] = useState<number | undefined>();

  const [itemPrice, setItemPrice] = useState<number | undefined>();
  const [total, setTotal] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedItems, setSelectedItems] = useState<ItemComboModel[]>([]);
  const [upgradeList, setUpgradeList] = useState<any[]>([]);

  const findItemCombo = itemCombo.data.filter(
    (itm) => itm.itmcomcde === itmcde
  );

  // console.log("shesh", findItemCombo);
  // console.log(itmcde);

  // const itemPriceFinder = (items: any[]) => {
  //   const findItem = item.data.filter((item) => {
  //     return items.some((itm) => itm.itmcde === item.itmcde);
  //   });
  //   let totalPrice = 0;
  //   for (const item of findItem) {
  //     totalPrice += parseFloat(item.untprc as any);
  //   }
  //   return totalPrice.toFixed(2);
  // };
  const oneItemPriceFinder = async (itmcde: string) => {
    // const findItem = item.data.filter((item) => {
    //   return item.itmcde === itmcde;
    // });
    const findItem = (await ApiService.get(`pricedetail/filter/?itmcde=${itmcde}&prccde=${transaction.data?.warcde}`)).data[0];

    // return findItem;
    return parseFloat(findItem.untprc as any).toFixed(2);
  };

  const onCheckboxChange = ({
    target: {name, value, checked},
  }: React.ChangeEvent<HTMLInputElement>) => {
    console.log(name, value, checked);
    const itemObject = JSON.parse(value) as ItemCombo;

    if (checked) {
      if (itemObject.itmcomtyp === "UPGRADE") {
        let subTotal = total;
        subTotal += parseFloat(itemObject.upgprc);
        const cloneUpgrades = [...upgradeList].filter(
          (item) => item.recid !== itemObject.recid
        );

        itemObject.comboQuantity = 1;
        const update = [...cloneUpgrades, itemObject].sort(
          (a, b) => (a.recid || 0) - (b.recid || 0)
        );
        setUpgradeList(update);
        setTotal(subTotal);
      }
      setSelectedItems((prev: ItemComboModel[]) => [...prev, itemObject]);
    } else {
      if (itemObject.itmcomtyp === "UPGRADE") {
        let subTotal = total;

        console.log("eto pa", itemObject);

        if (itemObject.comboQuantity > 0) {
          subTotal -= parseFloat(itemObject.upgprc) * itemObject.comboQuantity;
          itemObject.comboQuantity = 0;
        } else {
          subTotal -= parseFloat(itemObject.upgprc);
          itemObject.comboQuantity = 0;
        }

        const cloneUpgrades = [...upgradeList].filter(
          (item) => item.recid !== itemObject.recid
        );
        const update = [...cloneUpgrades, itemObject].sort(
          (a, b) => (a.recid || 0) - (b.recid || 0)
        );
        setUpgradeList(update);
        setTotal(subTotal);
      }
      const cloneSelected = [...selectedItems].filter(
        (item) => item.recid !== itemObject.recid
      );
      setSelectedItems(cloneSelected);
    }
  };

  const handleUpgradeQuantity = (
    index: number,
    value: string,
    itemObject: ItemCombo,
    mode: "increment" | "decrement"
  ) => {
    const cloneUpgrade = [...upgradeList];
    cloneUpgrade[index].comboQuantity = parseInt(value);

    let subtotal = total;

    if (mode === "increment") {
      console.log("increase");
      subtotal += parseFloat(itemObject.upgprc);
    }
    if (mode === "decrement") {
      const findItem = selectedItems.find(
        (item) => itemObject.recid === item.recid
      );
      if (findItem) {
        subtotal -= parseFloat(itemObject.upgprc);
      }
      console.log(upgradeList);
    }

    console.log("GUMAGANA", subtotal);

    setTotal(subtotal);
    setUpgradeList(cloneUpgrade);

    if (itemObject.comboQuantity === 1) {
      const update: any[] = [...selectedItems, itemObject];

      const seenRecids = new Set<number>();

      const uniqueItems = update.filter((item) => {
        // Check if the recid is already in the Set
        if (seenRecids.has(item.recid)) {
          // Duplicate, filter it out
          return false;
        }

        // Add the recid to the Set to mark it as seen
        seenRecids.add(item.recid);

        // Not a duplicate, keep it in the filtered array
        return true;
      });

      setSelectedItems(uniqueItems);
    } else if (itemObject.comboQuantity === 0) {
      const filter = [...selectedItems].filter(
        (item) => item.recid !== itemObject.recid
      );
      setSelectedItems(filter);
    }
  };

  const handleSubmit = async () => {
    // const baseItem = item.data.filter((item) => {
    //   return item.itmcde === itmcde;
    // });
    const baseItem = (await ApiService.get(`item/filter/?itmcde=${itmcde}`)).data;

    onAddTransactionCombo({
      itm: selectedItems,
      comboTotal: total,
      quantity,
      baseItem,
      quantityReference: upgradeList,
    });

    dispatch(toggleFullScreen(false));
    dispatch(toggle());
  };

  const renderItemCombo = () => {
    return (
      <div className="flex flex-col gap-[15px]">
        {findItemCombo.filter((item) => item.itmcomtyp === "DEFAULT").length >
          0 && (
          <div className="default border-b border-gray-500 flex flex-col gap-[15px]">
            <div className="flex items-center gap-[100px] justify-between">
              <h1 className="font-black text-[20px]">DEFAULT</h1>

              <div className="flex gap-2">
                <InputNumber
                  handleInputChange={() => {
                    // const baseTotal = parseFloat(
                    //   oneItemPriceFinder(itmcde as string)
                    // );
                    // setQuantity(parseInt(e.target.value));
                    // const subTotal = baseTotal * parseInt(e.target.value);
                    // setTotal((prev) => (prev += subTotal));
                  }}
                  disabled={true}
                  name={"quantity"}
                  value={quantity}
                  id={"quantity"}
                  description={"Quantity"}
                  required
                  width={200}
                  min="1"
                  // orientation="landscape"
                />

                <div className="flex flex-col justify-center pt-4 gap-2">
                  <ArrowUpOutlined
                    className="cursor-pointer hover:text-blue-500"
                    onClick={async () => {
                      // const baseTotal = parseFloat(
                      //   await oneItemPriceFinder(itmcde as string)
                      // );
                      const baseTotal = itemPrice;
                      if (!baseTotal) return;
                      let subQuantity = quantity;
                      subQuantity++;

                      setQuantity(subQuantity);

                      const subTotal = baseTotal * subQuantity;
                      console.log("ano ba", baseTotal, subQuantity);
                      console.log(subTotal);
                      console.log(total);

                      const filteredSelected = selectedItems.filter(
                        (item) => item.itmcomtyp === "UPGRADE"
                      );

                      if (filteredSelected.length === 0) {
                        setTotal(subTotal);
                      } else {
                        // const finalTotal =
                        // subQuantity > 0 ? subTotal - baseTotal : subTotal;
                        const totalValue = filteredSelected.reduce(
                          (accumulator: number, item: any) => {
                            const upgprc = parseFloat(item.upgprc);
                            const comboQuantity = item.comboQuantity;

                            if (!isNaN(upgprc) && !isNaN(comboQuantity)) {
                              accumulator += upgprc * comboQuantity;
                            }
                            return accumulator;
                          },
                          0
                        );
                        console.log(filteredSelected);
                        console.log("new total", totalValue);

                        // const finalTotal = subTotal - baseTotal;
                        setTotal(totalValue + subTotal);
                      }

                      // const update = upgradeList.map((item) => {
                      // item.comboQuantity = 0;
                      // return item;
                      // });
                      // const filter = selectedItems.filter(
                      // (item) => item.itmcomtyp !== "UPGRADE"
                      // );
                      // setSelectedItems(filter);
                      // setUpgradeList(update);
                    }}
                  />
                  <ArrowDownOutlined
                    className="cursor-pointer hover:text-red-500"
                    onClick={async () => {
                      // const baseTotal = parseFloat(
                      //   await oneItemPriceFinder(itmcde as string)
                      // );
                      const baseTotal = itemPrice;
                      if (!baseTotal) return;

                      let subQuantity = quantity;
                      subQuantity === 1 ? (subQuantity = 1) : subQuantity--;
                      console.log("baba", subQuantity);
                      setQuantity(subQuantity);

                      // if (subQuantity !== 1) {
                      const subTotal = baseTotal * subQuantity;
                      console.log("ano ba", baseTotal, subQuantity);

                      const filteredSelected = selectedItems.filter(
                        (item) => item.itmcomtyp === "UPGRADE"
                      );

                      if (filteredSelected.length === 0) {
                        setTotal(subTotal);
                      } else {
                        // const finalTotal =
                        // subQuantity > 0 ? subTotal - baseTotal : subTotal;
                        const totalValue = filteredSelected.reduce(
                          (accumulator: number, item: any) => {
                            const upgprc = parseFloat(item.upgprc);
                            const comboQuantity = item.comboQuantity;

                            if (!isNaN(upgprc) && !isNaN(comboQuantity)) {
                              accumulator += upgprc * comboQuantity;
                            }
                            return accumulator;
                          },
                          0
                        );
                        console.log(filteredSelected);
                        console.log("new total", totalValue);

                        // const finalTotal = subTotal - baseTotal;
                        setTotal(totalValue + subTotal);
                      }

                      // const update = upgradeList.map((item) => {
                      //   item.comboQuantity = 0;
                      //   return item;
                      // });
                      // const filter = selectedItems.filter(
                      //   (item) => item.itmcomtyp !== "UPGRADE"
                      // );
                      // setSelectedItems(filter);
                      // setUpgradeList(update);
                      // }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between min-h-[40px] items-center overflow">
              {findItemCombo
                .filter((item) => item.itmcomtyp === "DEFAULT")
                .map((item, index) => {
                  return (
                    <Checkbox
                      disabled={true}
                      key={index}
                      handleInputChange={onCheckboxChange}
                      checked={true}
                      id={"default"}
                      name={"default"}
                      // description={
                      //   `${item.itmdsc} - ${oneItemPriceFinder(item.itmcde)}` ||
                      //   ""
                      // }
                      description={`${item.itmdsc}`}
                      alignment="flex-row-reverse text-[16px] justify-between"
                      fontSize="16px"
                    />
                  );
                })}
            </div>
            <div className="flex justify-start border-t border-gray-1000 p-2 gap-[200px]">
              <p className="font-black text-[16px]">DEFAULT COMBO TOTAL: </p>
              <p className="font-black text-[16px]">
                {/* {oneItemPriceFinder(itmcde as string)} */}
                {itemPrice}
              </p>
            </div>

            {findItemCombo.filter((item) => item.itmcomtyp === "UPGRADE")
              .length === 0 && (
              <div className="flex justify-start border-t border-gray-1000 p-2 gap-[280px]">
                <p className="font-black text-[16px]">COMBO TOTAL: </p>
                <p className="font-black text-[16px]">{total.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        {findItemCombo.filter((item) => item.itmcomtyp === "OTHERS").length >
          0 && (
          <div className="others  border-b border-gray-500 flex flex-col gap-[15px]">
            <h1 className="font-black text-[20px]">OTHERS</h1>
            <div className="flex flex-wrap justify-between min-h-[40px] items-center overflow">
              {findItemCombo
                .filter((item) => item.itmcomtyp === "OTHERS")
                .map((item, index) => {
                  return (
                    <Checkbox
                      key={index}
                      handleInputChange={onCheckboxChange}
                      checked={undefined}
                      id={"others"}
                      name={"others"}
                      description={item.itmdsc || ""}
                      alignment="flex-row-reverse text-[16px] justify-between"
                      fontSize="16px"
                      value={JSON.stringify(item)}
                    />
                  );
                })}
            </div>

            {findItemCombo.filter((item) => item.itmcomtyp === "UPGRADE")
              .length === 0 && (
              <div className="flex justify-start border-t border-gray-1000 p-2 gap-[280px]">
                <p className="font-black text-[16px]">COMBO TOTAL: </p>
                <p className="font-black text-[16px]">{total.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        {findItemCombo.filter((item) => item.itmcomtyp === "UPGRADE").length >
          0 && (
          <div className="upgrade border-b border-gray-500 flex flex-col gap-[15px]">
            <h1 className="font-black text-[20px]">UPGRADE</h1>
            <div className="flex flex-wrap justify-between min-h-[40px] items-center overflow">
              {upgradeList.map((item, index) => {
                return (
                  <div key={index} className="flex gap-10">
                    <Checkbox
                      handleInputChange={onCheckboxChange}
                      checked={selectedItems.some(
                        (itm) => itm.recid === item.recid
                      )}
                      id={`upgrade-${index}`}
                      name={`upgrade-${index}`}
                      description={`${item.itmdsc} - ${item.upgprc}` || ""}
                      alignment="flex-row-reverse text-[16px] justify-between"
                      fontSize="16px"
                      value={JSON.stringify(item)}
                    />

                    <div className="flex gap-2">
                      <InputNumber
                        disabled={true}
                        handleInputChange={() => {
                          // handleUpgradeQuantity(index, e.target.value, item);
                        }}
                        value={item.comboQuantity}
                        id={`upgrade-${index}`}
                        name={`upgrade-${index}`}
                        description={"Quantity"}
                        required
                        width={50}
                        min="0"
                        disableTyping={true}
                      />
                      <div className="flex flex-col justify-center pt-4 gap-2">
                        <ArrowUpOutlined
                          className="cursor-pointer hover:text-blue-500"
                          onClick={() => {
                            let incrementValue = item.comboQuantity;
                            incrementValue++;
                            handleUpgradeQuantity(
                              index,
                              incrementValue,
                              item,
                              "increment"
                            );
                          }}
                        />
                        <ArrowDownOutlined
                          className="cursor-pointer hover:text-red-500"
                          onClick={() => {
                            let decrementValue = item.comboQuantity;
                            decrementValue === 0
                              ? (decrementValue = 0)
                              : decrementValue--;
                            handleUpgradeQuantity(
                              index,
                              decrementValue,
                              item,
                              "decrement"
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-start border-t border-gray-1000 p-2 gap-[280px]">
              <p className="font-black text-[16px]">COMBO TOTAL: </p>
              <p className="font-black text-[16px]">{total.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {

    const load = async () => {
      const baseTotal = parseFloat(await oneItemPriceFinder(itmcde as string));
      setItemPrice(baseTotal);
      const defaultItems = findItemCombo.filter(
        (item) => item.itmcomtyp === "DEFAULT"
      );
      const upgradeItems = findItemCombo
        .filter((item) => item.itmcomtyp === "UPGRADE")
        .map((combo) => {
          return {...combo, comboQuantity: 0};
        });

      setUpgradeList(upgradeItems);
      setSelectedItems(defaultItems);
      setTotal(baseTotal);
    }

    load();
  }, []);

  console.log("UPGRADE NEW", upgradeList);
  console.log("SELECTED", selectedItems);

  return (
    <div className="flex flex-col gap-[10px]">
      {renderItemCombo()}
      <button
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full m-auto"
        type="button"
        onClick={handleSubmit}
      >
        Done
      </button>
    </div>
  );
}
