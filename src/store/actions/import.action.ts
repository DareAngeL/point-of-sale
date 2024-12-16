import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const postImport = createAsyncThunk(
  "import/postImport",
  async (
    payload: {
      query: string;
      data: any;
      config: { [index: string]: any };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.post(
        `importfile?${payload.query}`,
        payload.data,
        payload.config
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
