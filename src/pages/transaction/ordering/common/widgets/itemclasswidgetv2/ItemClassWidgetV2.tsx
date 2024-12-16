/* eslint-disable react-hooks/rules-of-hooks */
import { OrderingClassCard } from "../../cards/OrderingClassCard";
import { useItemClassWidgetBehavior } from "./itemClassWidgetBehavior";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../../../store/store";
import { useTheme } from "../../../../../../hooks/theme";
import { getItemSubclassificationsByItemClassification } from "../../../../../../store/actions/itemSubclassification.action";

interface ItemClassWidgetPropsV2 {
  data?: { data?: any[] };
  itmclacde?: string;
  itmsubclacde?: string;
  type: "itemclass" | "itemsubclass";
  onClick: (data: any) => void;
  descriptionKey: string;
  searched: any;
  isSearching?: boolean;
  activePrinterStation: string;
}

export function ItemClassWidgetV2(props: ItemClassWidgetPropsV2) {

  const { theme } = useTheme();

  // Setting up the slice of syspar.allow_printerstation for disabling the OrderingClassCard
  // const selector = useAppSelector(state => state);
  // const {masterfile} = selector;
  // const {order} = selector

  // const {syspar} = masterfile;
  // const {posfiles} = order;

  // Logic for knowing if specific OrderingClassCard is disabled or not because of the printerstation that depends on the first item in the transaction.
  // const isItemActive = (itemClass: any) => {
  //   const filterType = syspar.data[0].itemclass_printer_station_tag?"itemclass":"itemsubclass";

  //   if(syspar.data[0].allow_printerstation === 1 && filterType === props.type){

  //     if(posfiles.data.length == 0){
  //       return false; 
  //     }

  //     if (props.activePrinterStation === '') {
  //       return false;
  //     }

  //     return props.activePrinterStation !== (itemClass.locationcde || '');
  //   }
  //   return false;

  // };

  //#region: subclass
  if (!props.data) {
    // const { data, nextData, initData, setData, reset, fetching } =
    //   useLazyLoading(
    //     props.type === "itemclass"
    //       ? "itemclassification"
    //       : `itemsubclassification/subclass/${props.itmclacde}`
    //   );

    const appDispatch = useAppDispatch();
    const [itemSubclassData, setItemSubclassData] = useState<any[]>([]);

    useEffect(() => {
      const fetch = async () => {

        if (props.type === "itemsubclass") {
          const data = await appDispatch(getItemSubclassificationsByItemClassification(props.itmclacde || ""));
          setItemSubclassData(data.payload);
        }

      //   reset();
      //   const data = await initData();
      //   setData(data);
      // };

      }

      fetch();

    }, [props.itmclacde]);

    // const onScrollReachedEnd = async () => {
    //   await nextData();
    // };

    const { containerRef } = useItemClassWidgetBehavior();
    //   {
    //   listener: {
    //     onReachedEnd: onScrollReachedEnd,
    //   },
    // });

    return (
      <>
        <div ref={containerRef} className="flex mb-6 overflow-x-hidden touch-none">
          {itemSubclassData?.map((item: any) => (
            <div
              onClick={() => {
                if (
                  Object.keys(props?.searched ?? {}).length > 0 &&
                  props.searched?.[
                    item.itmclacde as keyof typeof props.searched
                  ] &&
                  !props.searched[
                    item.itmclacde as keyof typeof props.searched
                  ].find((d: any) => d.subclass === item.itemsubclasscde) //|| isItemActive(item)
                ) {
                  return;
                }

                props.onClick(item);
              }}
              className=" flex w-auto h-full justify-center items-center mx-2"
            >
              <OrderingClassCard
                color={theme.orderingbtnscolor}
                description={item[props.descriptionKey]}
                selected={item.itemsubclasscde === props.itmsubclacde}
                disable={
                  Object.keys(props?.searched ?? {}).length > 0 &&
                  props.searched?.[
                    item.itmclacde as keyof typeof props.searched
                  ] &&
                  !props.searched[
                    item.itmclacde as keyof typeof props.searched
                  ].find((d:any) => d.subclass === item.itemsubclasscde) //|| isItemActive(item)
                }
              />
            </div>
          ))}
          {/* dirty approach on removing the unremovable scrollbar - LMAAAOO */}
          {itemSubclassData?.length === 0 && (
            <div className="p-3"></div>
          )}
          {/* <Spin className={`opacity-[${fetching ? 1 : 0}]`} /> */}
        </div>
      </>
    );
  }
  //#endregion

  //#region: itemclass
  const { containerRef } = useItemClassWidgetBehavior();

  return (
    <>
      <div ref={containerRef} className="flex mb-6 overflow-x-hidden touch-none">
        {props.data?.data?.map((item: any) => (
          <div
            onClick={() => {
              if (
                Object.keys(props?.searched ?? {}).length > 0 &&
                !props.searched?.[item.itmclacde as keyof typeof props.searched] //|| isItemActive(item)
              ) {
                return;
              }

              props.onClick(item);
            }}
            className=" flex w-auto h-full justify-center items-center mx-2"
          >
            <OrderingClassCard
              color={theme.orderingbtnscolor}
              selected={item.itmclacde === props.itmclacde}
              description={item[props.descriptionKey]}
              disable={
                Object.keys(props?.searched ?? {}).length > 0 &&
                !props.searched?.[item.itmclacde as keyof typeof props.searched] //|| isItemActive(item)
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}
