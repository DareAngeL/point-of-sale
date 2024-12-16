import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getBranch = createAsyncThunk("service/branch/get", async () => {
  try {
    const response = await ApiService.get("branchfile/");
    console.log("Response received:", response);
    return response.data;
  } catch (e) {
    console.error("Error fetching branch data:", e);
    throw e;
  }
});
