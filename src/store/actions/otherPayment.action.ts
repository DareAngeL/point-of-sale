import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getPaymentType = createAsyncThunk(
  "service/otherpayment",
  async () => {
    try {
      const response = await ApiService.get("otherpayment");
      return response.data;
    } catch (error) {
      console.log("Error while fetching payment type: ", error);
      throw new Error("Failed to fetch payment type: " + error);
    }
  }
);
