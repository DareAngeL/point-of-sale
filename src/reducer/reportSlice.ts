import {createSlice} from "@reduxjs/toolkit";
import {templateObject} from "../data/reportsList";
import { ZReadingReportProps } from "../pages/reports/zreading/zreadingreport/zreadingReport";
import { getNonZReadData, getCashiers, getXRead } from "../store/actions/posfile.action";
import { PosfileModel } from "../models/posfile";
interface ReportState {
  nonZReading: {
    data: any[];
    isLoaded: boolean;
  };
  // xreading
  xReadingView: {
    data: any;
    fileType: string;
  };
  cashiers: {
    data: any[];
    isLoaded: boolean;
  };
  xReading: {
    data: any[];
    isLoaded: boolean;
  };
  zReadingReportData: {
    data: ZReadingReportProps;
    isReprint?: boolean;
  },
  zReadingPreviousData: {
    data: PosfileModel[];
    isLoaded: boolean;
  }
}

const initialState: ReportState = {
  nonZReading: {
    data: [],
    isLoaded: false,
  },
  xReadingView: {
    data: templateObject,
    fileType: "",
  },
  cashiers: {
    data: [],
    isLoaded: false,
  },
  xReading: {
    data: [],
    isLoaded: false,
  },
  zReadingPreviousData: {
    data: [],
    isLoaded: false
  },
  zReadingReportData: {
    data: {
      header: {
        business1: "",
        business2: "",
        business3: "",
        tin: "",
        address1: "",
        address2: "",
        address3: "",
        machserlno: "",
        title: "",
        date: ""
      },
      datetime: "",
      cashier: "",
      sales_data: [],
      discounts_data: [],
      cash_data: [],
      all_cash_data: [],
      card_sales_data: [],
      other_sales_data: [],
      itemized_sales_data: [],
      category_sales_data: [],
      sales_by_dine_type_data: [],
      summary_data: [],
      postvoids: [],
      beg_void: {
        label: "",
        value: ""
      },
      end_void: {
        label: "",
        value: ""
      },
      postrefunds: [],
      post_refund_data: []
    },
    isReprint: false
  }
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setZReadingReportData: (state, action) => {
      state.zReadingReportData = action.payload;
    },
    setFileType: (state, action) => {
      console.log(action.payload);
      state.xReadingView.fileType = action.payload.fileType;
    },
    setNonZReading: (state, action) => {
      state.nonZReading.data = action.payload;
      state.nonZReading.isLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getNonZReadData.fulfilled, (state, action) => {
      state.nonZReading.data = action.payload;
      state.nonZReading.isLoaded = true;
    });
    builder.addCase(getCashiers.fulfilled, (state, action) => {
      const cashiers = action.payload.map((item: any) => {
        return {value: item.cashier, key: item.cashier};
      });
      state.cashiers.data = [...cashiers];
      state.cashiers.isLoaded = true;
    });
    builder.addCase(getXRead.fulfilled, (state, action) => {
      console.log(action.payload);
      state.xReading.data = action.payload;
      state.xReading.isLoaded = true;
    });
  },
});
export const {setFileType, setZReadingReportData, setNonZReading} = reportSlice.actions;

export default reportSlice.reducer;
