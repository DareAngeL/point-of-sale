import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getItems = createAsyncThunk(
  "service/item",
  async (pagination?: { page?: number; pageSize?: number }) => {
    try {
      const response = await ApiService.get(
        `item/?page=${pagination?.page || 0}&pageSize=${
          pagination?.pageSize || 10
        }`
      );
      return response.data;
    } catch (err: any) {
      console.error("err:" + err);
      return undefined;
    }
  }
);

export const getSingleItem = createAsyncThunk(
  "service/single_item",
  async (itemCode: string) => {
    try {
      const response = await ApiService.get(`item/${itemCode}`);
      return response.data;
    } catch (err: any) {
      console.error("err:" + err);
      return undefined;
    }
  }
);

export const checkBarcode = createAsyncThunk(
  "service/check_barcode",
  async (data: { id: number; barcode: string }) => {
    try {
      const response = await ApiService.get(
        `item/check_barcde/${data.id}?barcde=${data.barcode}`
      );
      return response.data;
    } catch (err: any) {
      console.error("err:" + err);
      return undefined;
    }
  }
);

export const getItemCombo = createAsyncThunk("service/itemcombo", async () => {
  try {
    const response = await ApiService.get("itemcombo");
    return response.data;
  } catch (err: any) {
    console.error("err:" + err);
    return undefined; // Handle error appropriately
  }
});

export const getItemAll = createAsyncThunk("service/itemAll/get", async () => {
  try {
    const response = await ApiService.get("item/all");
    return response.data;
  } catch (err: any) {
    console.error("err:" + err);
    return undefined;
  }
});

export const putItemCombo = createAsyncThunk(
  "service/put_itemcombo",
  async (data: any) => {
    try {
      const response = await ApiService.put("itemcombo", data);
      return response.data;
    } catch (err: any) {
      console.error("err:" + err);
      return undefined;
    }
  }
);

export const putBulkItems = createAsyncThunk(
  "service/put_bulk_items",
  async (data: any) => {
    try {
      const response = await ApiService.put("item/bulk", data);
      return response.data;
    } catch (err: any) {
      console.error("err:" + err);
      return undefined;
    }
  }
);

export const putItem = createAsyncThunk(
  "service/put_item",
  async (data: any) => {
    try {
      const response = await ApiService.put("item", data);
      return response.data;
    } catch (err: any) {
      console.error("err:" + err);
      // check the error response code
      if (err.response.status === 409) {
        return "Item already exists.";
      }
      return undefined;
    }
  }
);

export const deleteItem = createAsyncThunk(
  "service/delete_item",
  async (recid: string) => {
    try {
      const response = await ApiService.delete(`item/${recid}`);
      return response.data;
    } catch (err: any) {
      console.error("err:" + err);
      return undefined;
    }
  }
);
