import { cashieringModals } from "../../../data/cashieringdata";
import "./Cashiering.css";
import { BackButton } from "../../../common/backbutton/BackButton";
import { CashieringModal } from "./modal/CashieringModal";
import { CashieringCard } from "./common/CashieringCard/CashieringCard";
import { useEffect, useState } from "react";
import {
  useCashiering,
  useServiceCashiering,
} from "../../../hooks/cashieringHooks";
import { useModal } from "../../../hooks/modalHooks";
import { useAppSelector } from "../../../store/store";
import { AuthenticationGuard } from "../../../security/authentication/AuthGuards";
import { CashieringTransactType } from "./cashieringEnums";
import { useVisitingTransactionChecking } from "../../../hooks/transactionHook";
import { useUserAccessHook } from "../../../hooks/userAccessHook";
import Receipt from "./common/reciepts/Receipt";

interface CashOptionsInterface {
  disableCashInOut: boolean;
  disableCashFund: boolean;
  disableCashDeclaration: boolean;
}

export function Cashiering() {
  const { dispatch } = useModal();
  const { init } = useServiceCashiering();
  const { lastTransaction, hasCashFund, noEOD, isEnd } = useAppSelector(
    (state) => state.transaction
  );
  const { remainingZread } = useAppSelector((state) => state.order);

  const { clearInput } = useCashiering();
  const { canProceed } = useVisitingTransactionChecking();
  const { isRootUser, hasAccess, useraccessfiles } = useUserAccessHook();

  useEffect(() => {
    clearInput();
  }, [dispatch]);

  useEffect(() => {
    document.scrollingElement?.scrollTo(0, 0);

    canProceed("lastTransaction");
    init(); // init cashiering
  }, []);

  useEffect(() => {
    renderComponents();
  }, [hasCashFund.data, lastTransaction]);

  const [cashOptions, setCashOptions] = useState<CashOptionsInterface>({
    disableCashInOut: false,
    disableCashFund: false,
    disableCashDeclaration: false,
  });

  const renderComponents = () => {
    if (
      (remainingZread.data?.hasRemainingZread &&
        lastTransaction.trntyp === CashieringTransactType.CASH_DECLARATION) ||
      (noEOD.NOEOD &&
        lastTransaction.trntyp === CashieringTransactType.CASH_DECLARATION) ||
      (noEOD.NOEOD && lastTransaction.trntyp === CashieringTransactType.EMPTY)
    ) {
      setCashOptions({
        disableCashInOut: true,
        disableCashFund: true,
        disableCashDeclaration: true,
      });
      return;
    }

    if (isEnd) {
      setCashOptions({
        disableCashInOut: true,
        disableCashFund: true,
        disableCashDeclaration:
          lastTransaction.trntyp == "DECLARATION" ? true : false,
      });
      return;
    }

    if (remainingZread.data?.hasRemainingZread) {
      setCashOptions({
        disableCashInOut: true,
        disableCashFund: true,
        disableCashDeclaration: false,
      });
      return;
    }

    if (!hasCashFund.data) {
      setCashOptions({
        disableCashInOut: true,
        disableCashFund: false,
        disableCashDeclaration: true,
      });
    } else {
      switch (lastTransaction.trntyp) {
        case CashieringTransactType.CASHFUND:
        case CashieringTransactType.CASHIN:
        case CashieringTransactType.CASHOUT:
        default:
          setCashOptions({
            disableCashInOut: false,
            disableCashFund: true,
            disableCashDeclaration: false,
          });
          break;
        case CashieringTransactType.CASH_DECLARATION:
          setCashOptions({
            disableCashFund: false,
            disableCashDeclaration: true,
            disableCashInOut: false,
          });
          console.log("aHEHEHE");
          console.log("aHIHIHIHIIHI");
          break;
        case CashieringTransactType.EMPTY:
          setCashOptions({
            disableCashInOut: true,
            disableCashFund: false,
            disableCashDeclaration: true,
          });
          break;
      }
    }
  };

  return (
    <>
      <AuthenticationGuard
        condition={
          canProceed("printer_station") &&
          canProceed("hasRequiredHeaders") &&
          // canProceed("remainingZRead") &&
          remainingZread.isLoaded &&
          canProceed("lastTransaction")
        }
        redirectTo={"/pages/home"}
      >
        <CashieringModal />
        <div className="flex w-full ps-10 shadow">
          <BackButton navigateTo={"/pages/home"} />
          <h1 className="font-montserrat text-[48px]">Cashiering</h1>
        </div>
        <section className="cashiering-container p-10 ">
          <div className="form-holder flex flex-col border border-gray-300 shadow-md w-[600px] mx-auto rounded-md p-4 gap-4">
            <div className="h-[100%] cards-container">
              {cashieringModals
                .filter(
                  (item) =>
                    isRootUser() ||
                    useraccessfiles.find(
                      (a: any) =>
                        a.menfield ===
                          item.name.replace(" ", "").toLocaleLowerCase() &&
                        hasAccess(a)
                    ) !== undefined
                )
                .map((item, index) => {
                  if (cashOptions.disableCashFund && item.name === "Cash Fund")
                    return (
                      <CashieringCard
                        index={index}
                        key={index}
                        {...item}
                        disabled={cashOptions.disableCashFund}
                      />
                    );
                  if (cashOptions.disableCashInOut && item.name === "Cash In")
                    return (
                      <CashieringCard
                        index={index}
                        key={index}
                        {...item}
                        disabled={cashOptions.disableCashInOut}
                      />
                    );
                  if (cashOptions.disableCashInOut && item.name === "Cash Out")
                    return (
                      <CashieringCard
                        index={index}
                        key={index}
                        {...item}
                        disabled={cashOptions.disableCashInOut}
                      />
                    );
                  if (
                    cashOptions.disableCashDeclaration &&
                    item.name === "Cash Declaration"
                  )
                    return (
                      <CashieringCard
                        index={index}
                        key={index}
                        {...item}
                        disabled={cashOptions.disableCashDeclaration}
                      />
                    );

                  return <CashieringCard index={index} key={index} {...item} />;
                })}
            </div>
          </div>
        </section>

        <div className="absolute top-0 right-0 -z-10 h-full w-[50%] bg-white opacity-[0] ">
          <Receipt />
        </div>
      </AuthenticationGuard>
    </>
  );
}
