import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getDiscount = createAsyncThunk("service/discount", async () => {
  try {
    const response = await ApiService.get("discount/all");
    return response.data;
  } catch (e) {
    console.error(
      "There's an error while fetching the discount, please check the network: ",
      e
    );
    throw e;
  }
});

export const checkGovernmentDiscounts = createAsyncThunk(
  "service/discount",
  async () => {
    try {
      const response = await ApiService.get("discount/checkGovernment");
      return response.data;
    } catch (e) {
      console.error(
        "There's an error while fetching discount gov, please check the network: ",
        e
      );
      throw e;
    }
  }
);

export const getOrderDiscount = createAsyncThunk(
  "orderdiscount/details",
  async () => {
    try {
      const response = await ApiService.get(`orderitemdiscount/details`);
      return response.data;
    } catch (e) {
      console.error(
        "There's an error while fetching the discount order, please check the network: ",
        e
      );
      throw e;
    }
  }
);

export const getOrderDiscountByCode = createAsyncThunk(
  "orderdiscount/detailsByCode",
  async (ordercde: string) => {
    const response = await ApiService.get(
      `orderitemdiscount/details/${ordercde}`
    );
    console.log(response.data);
    return response.data;
  }
);
