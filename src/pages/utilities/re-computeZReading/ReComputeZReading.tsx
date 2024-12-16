/* eslint-disable @typescript-eslint/no-explicit-any */
import {ProcessingFragment} from "./fragments/ProcessingFragment";
import {DateFragment} from "./fragments/DateFragment";
import {useState} from "react";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import {useService} from "../../../hooks/serviceHooks";
import {toast} from "react-toastify";
import { useUserActivityLog } from "../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../enums/activitylogs";

enum FragmentType {
  DEFAULT,
  PROCESSING,
  DATE,
}

export default function RegenerateMallFiles() {
  const {dispatch: dispatchModal} = useModal();
  const {putData} = useService<unknown>("posfile/zreading");
  const {getData, query} = useService<unknown>("posfile/recomputeZReading");
  const {getData: getZread} = useService<unknown>("xzreading/generate");
  const [fragmentType, setFragmentType] = useState<FragmentType>(
    FragmentType.DATE
  );
  const [dateForm, setDateForm] = useState({
    dateFrom: "",
    dateTo: "",
  });
  const {modalNameDispatch} = useChangeNameModal();
  const { postActivity } = useUserActivityLog();

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const {value, name} = e.target;
  //   setDateForm((prev) => ({...prev, [name]: value}));
  // };

  const handleDateInputChange = (name: string, value: string) => {
    setDateForm((prev) => ({...prev, [name]: value}));
  };

  const submitData = async () => {

    if (dateForm.dateFrom === "" || dateForm.dateTo === "") {
      toast.error("Please fillup all dates", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
      setFragmentType(FragmentType.DATE);
      return;
    }

    setFragmentType(FragmentType.PROCESSING);
    modalNameDispatch("Processing");

    const getBatchNumsQuery = query({
      batchnum: "ne:",
      _sortby: "trndte:asc,recid:desc",
      _distinct: "batchnum",
      trndte: `and:[gte=${dateForm.dateFrom},lte=${dateForm.dateTo}]`,
    })

    // get all batchnums
    const batchnumsData = await getData(getBatchNumsQuery, async (_, error) => {
        if (error) {
          toast.error("Something went wrong", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });

          console.error(error);
          
        }
      }) as any;

    if (batchnumsData.data.length === 0) {
      toast.info(`No data found for: ${dateForm.dateFrom} to ${dateForm.dateTo}`, {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 4000,
      });
      setFragmentType(FragmentType.DATE);
      return;
    }

    let hasError = false;
    for (const bNumData of batchnumsData.data as unknown as {batchnum: string}[]) {
      const batchnum = bNumData.batchnum;
      const getItemsWithBatchNumQuery = query({
        batchnum,
        _sortby: "trndte:asc,recid:asc",
        _distinct: "-1",
        _limit: "1",
        _includes: "trndte,logtim",
      });

      const posfileItem = await getData(getItemsWithBatchNumQuery, async (_, error) => {
        if (error) {
          toast.error("Something went wrong", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
          console.error(error);
          hasError = true;
        }
      }) as any;

      if (!posfileItem || !posfileItem.data || posfileItem.data.length === 0) {
        toast.info("No data found", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 2000,
        });
        setFragmentType(FragmentType.DATE);
        return;
      }
      
      const fromDate = (posfileItem as any).data[0].trndte;
      setDateForm((prev) => ({...prev, dateFrom: fromDate}));
      setFragmentType(FragmentType.PROCESSING);

      const zreadData = await getZread(query({
        batchnum,
        trnstat: 1,
        isRecompute: true,
      }), async (_, error) => {
        if (error) {
          toast.error("Something went wrong", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
          console.error(error);
          hasError = true;
        }
      }) as any;
      
      if (!zreadData || !zreadData.data || zreadData.data.length === 0 ) {
        toast.info("No data found", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 2000,
        });
        setFragmentType(FragmentType.DATE);
        return;
      }

      const zread = (zreadData as any).data[0] as ZReadData;
      await putData(`?batchnum=${batchnum}`, {
        extprc: zread.end_sales,
      }, async (data: any, error) => {
        if (error) {
          toast.error("Something went wrong", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
          console.error(error);
          hasError = true;
          return;
        }

        const isSuccess = data.success;
        if (!isSuccess) hasError = true;
      });
    }

    if (hasError) return;

    toast.success("Recomputing is successful", {
      hideProgressBar: true,
      autoClose: 1500,
      position: "top-center",
    });

    setTimeout(() => {
      dispatchModal();
    }, 1500);

    postActivity({
      module: MODULES.RECOMPUTE_ZREADING,
      method: METHODS.CREATE,
      remarks: `Recompute Z Reading from ${dateForm.dateFrom} to ${dateForm.dateTo}`,
    });
  };

  const handleSubmit = async () => {

    try {
      await submitData();
    } catch (error) {
      setTimeout(() => {
        dispatchModal();
      }, 1500);
      console.log(error);
    }
  };

  switch (fragmentType) {
    case FragmentType.PROCESSING:
      return <ProcessingFragment date={dateForm} />;
    case FragmentType.DATE:
      return (
        <DateFragment
          dateFrom={dateForm.dateFrom}
          dateTo={dateForm.dateTo}
          onConfirm={handleSubmit}
          handleInputChange={handleDateInputChange}
        />
      );
    default:
      return (
        <div>
          <h1>Recompute z reading</h1>
        </div>
      );
  }
}
