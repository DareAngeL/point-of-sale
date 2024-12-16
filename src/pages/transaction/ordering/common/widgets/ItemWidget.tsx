import {OrderingItemCard} from "../cards/OrderingItemCard";
import {ItemModel} from "../../../../../models/items";
import {useOrderingModal} from "../../hooks/orderingModalHooks";
import { useEffect } from "react";
import { useLazyLoading } from "../../../../../hooks/lazyLoading";
import { Empty, Spin } from "antd";
import { useTheme } from "../../../../../hooks/theme";
import { useAppSelector } from "../../../../../store/store";

interface ItemWidgetProps {
  // data: {data?: any[]};
  container: React.RefObject<HTMLDivElement>;
  itmsubclacde: string|undefined;
  prccde: string|undefined;
  onClick: (data: any) => void;
  descriptionName: string;
  itemCombo: {data: any[]};
  searchedTerm?: any;
}

export function ItemWidget(props: ItemWidgetProps) {

  const { theme } = useTheme();
  const { isTransactionProcessing, transaction } = useAppSelector(state => state.order); 

  const {onAddItem} = useOrderingModal();
  const {
    data,
    fetching,
    initData,
    nextData,
    setData,
    reset
  } = useLazyLoading(`item/items/${props.itmsubclacde}/${props.prccde}/${props.searchedTerm}`, undefined, 40);

  // const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetch = async () => {
      reset();
      props.container.current && props.container.current.removeEventListener("scroll", onScroll);
      if (!props.itmsubclacde) return;

      console.log("pricecode:", transaction.data?.warcde, props.prccde);
      

      const _data = await initData();
      setData(_data);
    }


    fetch();
  }, [props.itmsubclacde, props.prccde]);

  useEffect(() => {
    let cc: any = null;

    const initiate = async () => {
      if (!props.itmsubclacde) return;
     
      cc = props.container.current;

      if (cc) {
        cc.addEventListener("scroll", onScroll);
        if (!(cc.scrollHeight > cc.clientHeight)) {
          if (data.length > 0) {
            await nextData();
          }
        }
      }
    }

    initiate();

    return () => {
      cc && cc.removeEventListener("scroll", onScroll);
    }

  }, [data]);

  const onScroll = async () => {
    const cc = props.container.current;
    
    if (!cc) return;

    if (!fetching && cc.scrollTop + cc.clientHeight >= cc.scrollHeight) {
      console.log("NEXTING DATA");
      await nextData();
    }
  }

  const handleItemAdd = (item: ItemModel) => {
    console.log("Searched term", props.searchedTerm);
    console.log(item);
    const findItemCombo = props.itemCombo.data.filter(
      (itm) => itm.itmcomcde === item.itmcde
    );

    if (findItemCombo.length > 0) {
      onAddItem(item.itmcde, item.itmdsc);
    } else {
      props.onClick({itm: item});
    }
  };

  return (
    <>
      <div ref={props.container} className="flex flex-wrap">
        {data.map((item: any) => (

          !item.inactive && (
            <>

              <div
                // onClick={() => props.onClick({itm: item})}
                
                onClick={() => {
                  if (isTransactionProcessing) return;

                  handleItemAdd(item);
                }}
                key={item.recid}
                className="h-[50px] mb-2"
              >
                <OrderingItemCard 
                  color={isTransactionProcessing ? '#808080' : theme.orderingbtnscolor}
                  description={item[props.descriptionName]} 
                />
              </div>
            
            </>
          )
        ))}
        <div className="flex flex-col mx-auto my-6">
          {(data.length === 0 && props.itmsubclacde) && (
            <Empty
              className="mx-auto my-auto text-gray-500 font-montserrat"
              description="NO AVAILABLE ITEMS"
            />
          )}
          {fetching && (
            <Spin className="mx-auto" />
          )}
        </div>
      </div>
    </>
  );
}
