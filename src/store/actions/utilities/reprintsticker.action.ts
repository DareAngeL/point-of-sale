import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../../services";

export const getOrdocnumItems = createAsyncThunk(
  "reprintsticker/reprintSticker",
  async (ordocnum: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(`posfile/ordocnumItems/${ordocnum}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);