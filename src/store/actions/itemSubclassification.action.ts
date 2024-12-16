import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { ItemSubclassificationModel } from "../../models/itemsubclassification";

export const getItemSubclassifications = createAsyncThunk(
  "service/itemsubclassification/get",
  async () => {
    try {
      const response = await ApiService.get("itemsubclassification/all");
      return response.data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
);

export const getItemSubclassificationsByItemClassification = createAsyncThunk(
  "service/itemsubclassification/getByItemClassification",
  async (itemClassification: string) => {
    try {
      const response = await ApiService.get(
        `itemsubclassification/subclass/${itemClassification}`
      );
      return response.data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
);

export const putItemSubclassifications = createAsyncThunk(
  "service/itemsubclassification/put",
  async (payload: ItemSubclassificationModel | undefined) => {
    try {
      const response = await ApiService.put("itemsubclassification", payload);
      return response.data;
    } catch (err: any) {
      console.error(err);
      return err.response.status;
    }
  }
);

export const putBulkItemSubclassifications = createAsyncThunk(
  "service/itemsubclassification/putBulk",
  async (payload: any) => {
    try {
      const response = await ApiService.put(
        "itemsubclassification/bulk",
        payload
      );
      return response.data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
);

export const deleteItemSubclassifications = createAsyncThunk(
  "service/itemsubclassification/delete",
  async (recid: string) => {
    try {
      const response = await ApiService.delete(
        `itemsubclassification/${recid}`
      );
      return response.data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
);

// export const getItemSubclassifications = createAsyncThunk(
//   "service/itemsubclassification",
//   async () => {
//     const response = await ApiService.get("itemsubclassification");
//     return response.data;
//   }
// );
