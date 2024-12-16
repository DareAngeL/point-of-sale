import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../../services";

export const getAutoOfSalesTransactionAPI = createAsyncThunk(
  "automationofsales/getAutoOfSalesTransactionAPI",
  async (data: object, { rejectWithValue }) => {
    try {
      const response = await ApiService.getAll('posfile/auto_ofsales', {params: data});
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const transferFilesToCentral = createAsyncThunk(
  "automationofsales/getTransferFile",
  async (data: object, { rejectWithValue }) => {
    try {
      const response = await ApiService.getAll('gettransferfile', {params: data});
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadFileToCentral = createAsyncThunk(
  "automationofsales/uploadFileToCentral",
  async (data: object, { rejectWithValue }) => {
    try {
      const response = await ApiService.getAll('uploadfiletocentral', {params: data});
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCorruptedAutoOfSales = createAsyncThunk(
  "automationofsales/getCorruptedAutoOfSales",
  async (_, { rejectWithValue }) => {
    try {

      const data = {
        docnum: "like:POS-",
        trnstat: 1,
        is_corrupted: 1,
        _groupby: "docnum",
        _sortby: "trnsfrdte,docnum",
        _includes: "recid,docnum",
      };

      const response = await ApiService.getAll('posfile/auto_ofsales', {params: data});
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);