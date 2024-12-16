import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getRefundItemsByCode = createAsyncThunk(
  "refund/posfileday",
  async (ordercde: string | undefined) => {
    try {
      const response = await ApiService.get(`posfile/day/${ordercde}`);
      console.log("refundAction", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching refund items:", error);
      throw error;
    }
  }
);
