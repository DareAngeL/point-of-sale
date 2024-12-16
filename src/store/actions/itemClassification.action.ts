import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { ItemClassificationModel } from "../../models/itemclassification";

export const getItemClassifications = createAsyncThunk(
  "service/itemclassification",
  async () => {
    try {
      const response = await ApiService.get("itemclassification/join");
      return response.data;
    } catch (e) {
      console.error(
        "There's an error while fetching the item class, please check the network: ",
        e
      );
      throw e;
    }
  }
);

export const putItemClassifications = createAsyncThunk(
  "service/itemclassification/put",
  async (payload: ItemClassificationModel | undefined) => {
    try {
      const response = await ApiService.put("itemclassification", payload);
      return response.data;
    } catch (err: any) {
      console.error(err);
      return err.response.status;
    }
  }
);

export const putBulkItemClassifications = createAsyncThunk(
  "service/itemclassification/putBulk",
  async (payload: any) => {
    try {
      const response = await ApiService.put("itemclassification/bulk", payload);
      return response.data;
    } catch (e) {
      console.error(
        "There's an error while updating the item class, please check the network: ",
        e
      );
      throw e;
    }
  }
);

export const deleteItemClassifications = createAsyncThunk(
  "service/itemclassification/delete",
  async (recid: string) => {
    try {
      const response = await ApiService.delete(`itemclassification/${recid}`);
      return response.data;
    } catch (e) {
      console.error(
        "There's an error while deleting the item classification, please check the network: ",
        e
      );
      throw e;
    }
  }
);
