import { DatePicker } from "antd";
import { useState } from "react"
import dayjs from 'dayjs';
import moment from "moment";

interface DateRangeProps {
 onDatePicked?: (date: { date_start?:string; date_end?:string }) => void
}

export function DateRange(props: DateRangeProps) {

  const [openMonthPicker, setOpenMonthPicker] = useState(false)
  const [dateRange, setDateRange] = useState<{ date_start?:string; date_end?:string } | undefined>({})

  const onMonthPicked = (value: dayjs.Dayjs | null) => { 
    
    const selectedDate = {
      date_start: moment(`${value?.year()}-${(value?.month()||0)+1}-1`).format('YYYY-MM-DD'),
      date_end: moment(`${value?.year()}-${(value?.month()||0)+1}-1`).endOf('month').format('YYYY-MM-DD')
    };
    
    setDateRange(selectedDate);
    setOpenMonthPicker(false);
    props.onDatePicked && props.onDatePicked(selectedDate);
  }

  return (
    <>
      <div className="flex">
        <div>
          <label>Start <span className="text-gray-500 text-[13px]">(yyyy-mm-dd)</span></label>
          <div className="relative me-52 bg-slate-200">
            <DatePicker 
              className="absolute top-0"
              picker="month"
              open={openMonthPicker}
              onChange={onMonthPicked}
            />

            <p
              onClick={() => setOpenMonthPicker(!openMonthPicker)}
              className={`absolute w-[200px] bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 hover:cursor-pointer`}>
                {dateRange?.date_start || '____-__-__'}
            </p>
            
          </div>
        </div>

        <div>
          <label>End <span className="text-gray-500 text-[13px]">(yyyy-mm-dd)</span></label>
          <div>
            <p
              className={`w-[200px] bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 hover:cursor-pointer`}>
                {dateRange?.date_end || '____-__-__'}
            </p>
            
          </div>
        </div>
      </div>

    </>
  )
}