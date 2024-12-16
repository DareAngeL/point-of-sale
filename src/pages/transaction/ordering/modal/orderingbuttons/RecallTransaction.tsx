import {useEffect, useState} from "react";
import {useAppSelector} from "../../../../../store/store";
import {OrderingModel} from "../../model/OrderingModel";
import {useOrderingButtons} from "../../hooks/orderingHooks";

export function RecallTransaction() {
  const {transactions} = useAppSelector((state) => state.order);

  const [activeTransaction, setActiveTransaction] = useState<OrderingModel[]>();
  const {recallTransaction} = useOrderingButtons();

  useEffect(() => {
    const filteredTran = transactions.data.filter((d) => d.status == "HOLD");

    console.log(filteredTran);

    setActiveTransaction(filteredTran);
  }, [transactions]);

  return (
    <>
      <section>
        {activeTransaction?.map((item) => (
          <>
            <div
              className="flex justify-between mt-2 border-b cursor-pointer"
              onClick={() => {
                recallTransaction(item.ordercde);
              }}
            >
              {item.tabletrncde}
            </div>
          </>
        ))}
      </section>
    </>
  );
}
