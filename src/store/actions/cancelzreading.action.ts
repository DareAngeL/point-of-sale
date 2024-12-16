import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const cancelZReading = createAsyncThunk(
  "cancelZReading/cancelZReading",
  async () => {
    try {
      const response = await ApiService.post("cancelzreading/", {});
      return response.data;
    } catch (e) {
      console.error("There's an error while canceling the z-reading: ", e);
      throw e;
    }
  }
);
