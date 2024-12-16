import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { MallHookup2Model } from "../../models/mallhookupfile2";

export const getMallFields = createAsyncThunk(
  "service/getmallfields",
  async (id: number) => {
    try {
      const response = await ApiService.get(`mallhookup/getMallFields/${id}`);
      console.log("Get Mall Fields", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching mall fields:", error);
      throw error;
    }
  }
);

export const updateMallFields = createAsyncThunk(
  "service/updatemallfields",
  async (data: MallHookup2Model) => {
    try {
      const response = await ApiService.post(
        `mallhookup/updateMallFields`,
        data
      );
      console.log("Update Mall", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating mall fields:", error);
      throw error;
    }
  }
);

export const testRobinsonConnection = createAsyncThunk(
  "service/testrobinsonconnection",
  async () => {
    try {
      const response = await ApiService.get("mallhookup/testRobinsonConnection");
      return response.data;
    } catch (error) {
      console.error("Error testing robinson connection:", error);
      throw error;
    }
  }
)