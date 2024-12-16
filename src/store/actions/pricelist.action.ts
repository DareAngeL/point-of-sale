import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { toast } from "react-toastify";

export const getPriceList = createAsyncThunk("service/priceList", async () => {
  try {
    const response = await ApiService.get("pricelist/join");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
});

export const getSinglePriceListByID = createAsyncThunk(
  "service/priceList/single",
  async (id: string) => {
    try {
      const response = await ApiService.get(`pricelist/filter/?recid=${id}`);
      return response.data[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

export const getSinglePriceListByPriceCode = createAsyncThunk(
  "service/priceList/single2",
  async (prccde: string) => {
    try {
      const response = await ApiService.get(
        `pricelist/filter/?prccde=${prccde}`
      );
      return response.data[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

export const deletePriceList = createAsyncThunk(
  "service/priceList/delete",
  async (id: string) => {
    try {
      const deletedData = await ApiService.delete(`pricelist/${id}`);
      return deletedData.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

export const importPricelist = createAsyncThunk(
  "service/priceList/import",
  async (data: { prccde: string; formData: FormData }) => {
    try {
      const response = await ApiService.post(
        `pricedetail/import?prccde=${data.prccde}`,
        data.formData
      );
      return response.data;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return null;
    }
  }
);

export const getLazyLoadedPriceDetails = createAsyncThunk(
  "service/priceList/details",
  async (prccde: string) => {
    try {
      const response = await ApiService.get(
        `pricedetail/all/${prccde}/?page=0&pageSize=10`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

export const setLoadItems = createAsyncThunk(
  "service/priceList/items",
  async (data: { prccde: string; page: number; pageSize: number }) => {
    try {
      const response = await ApiService.get(
        `pricedetail/load_items/${data.prccde}/?page=${data.page}&pageSize=${data.pageSize}`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);
