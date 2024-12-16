import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getCompany = createAsyncThunk("service/company", async () => {
  try {
    const response = await ApiService.get("company");
    return response.data;
  } catch (e) {
    console.error(
      "There's an error while fetching company data. Check the network: ",
      e
    );
    throw e;
  }
});
