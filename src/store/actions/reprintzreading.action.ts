import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getReprintZreading = createAsyncThunk(
  "reprintzreading/getReprintZreading",
  async (size: number) => {
    try {
      const response = await ApiService.get(
        `posfile/reprint_zreading/?page=0&pageSize=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reprint Zreading:", error);
      throw error;
    }
  }
);
