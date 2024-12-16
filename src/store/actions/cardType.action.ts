import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getCardType = createAsyncThunk("service/cardType", async () => {
  const response = await ApiService.get("cardtype/");
  console.log("responde", response);

  return response.data;
});
