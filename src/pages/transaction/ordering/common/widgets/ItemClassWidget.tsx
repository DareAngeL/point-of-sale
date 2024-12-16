import {Swiper, SwiperSlide} from "swiper/react";
import {OrderingClassCard} from "../cards/OrderingClassCard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

interface ItemClassWidgetProps {
  data: {data?: any[]};
  onClick: (data: any) => void;
  descriptionKey: string;
  searchedItems?: any[];
  isSearching?: boolean;
}

/**
 * Author: Rene Tajos Jr.
 * NOTE: "NOT IN USE" DUE TO THE CHILDREN OVERLAPPING EACH OTHER WHEN THEIR TEXTS IS HUGE
 * PLEASE REFER TO THE NEW VERSION OF THIS COMPONENT
 * New component: ItemClassWidgetV2.tsx
 * @param props 
 * @returns 
 */
export function ItemClassWidget(props: ItemClassWidgetProps) {

  return (
    <>
      <Swiper className="mb-5" slidesPerView={6} onSwiper={(swiper) => console.log(swiper)}>
        {props.data.data?.map((item) => (
          <SwiperSlide key={item.recid} className="w-full h-full">
            <div
              onClick={() => props.onClick(item)}
              className=" flex w-auto h-full justify-center items-center"
            >
              <OrderingClassCard 
                description={item[props.descriptionKey]}
                disable={(props.searchedItems &&
                  props.searchedItems.length > 0 &&
                  !props.searchedItems.find((searchedItem) => searchedItem.class == item.itmclacde)) ||
                  props.isSearching && props.searchedItems?.length === 0}
                selected={false} color={""}              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
