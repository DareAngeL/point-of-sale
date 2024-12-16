import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../../services";
import { toast } from "react-toastify";

export const backupData = createAsyncThunk(
  "backupdata/backupData",
  async (payload: { path: string | undefined }, { rejectWithValue }) => {
    try {
      const response = await ApiService.get('backupdatabase', {params: payload});
      return response.data;
    } catch (error: any) {
      toast.error(error.message, {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000,
      });
      return rejectWithValue(error.message);
    }
  }
);