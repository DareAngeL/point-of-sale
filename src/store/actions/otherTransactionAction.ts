import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const checkRecall = createAsyncThunk(
  "transaction/check-recall",
  async () => {
    try {
      const response = await ApiService.post(`transaction/check-recall`, {});
      console.log("checkRecall", response);
      return response.data;
    } catch (error) {
      console.error("Error in checkRecall:", error);
      throw error;
    }
  }
);
