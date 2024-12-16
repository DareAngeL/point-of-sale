import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const putTransactionCombo = createAsyncThunk(
  "ordering/putTransactionCombo",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.put("posfile/transactionBulk", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const putOrderTypeComboBulk = createAsyncThunk(
  "ordering/putOrderTypeComboBulk",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.put(
        "posfile/ordertypebulkcombo",
        payload
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteDiscount = createAsyncThunk(
  "ordering/deleteDiscount",
  async (
    payload: { orderitmid: string; discde: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.delete(
        `posfile/discountdetails/?orderitmid=${payload.orderitmid}&discde=${payload.discde}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const postDiscount = createAsyncThunk(
  "ordering/postDiscount",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("orderitemdiscount/bulk", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const openTransaction = createAsyncThunk(
  "ordering/openTransaction",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.put("transaction", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const refundTransaction = createAsyncThunk(
  "ordering/refundTransaction",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.post("posfile/refund", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
