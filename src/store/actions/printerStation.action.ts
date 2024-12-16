import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { PrinterStationModel } from "../../models/printerstation";

export const getPrinterStations = createAsyncThunk(
  "service/printerStation",
  async () => {
    try {
      const response = await ApiService.get("printerstation/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching printer stations:", error);
      throw error;
    }
  }
);

export const getSinglePrinterStation = createAsyncThunk(
  "service/singlePrinterStation",
  async (locationcde: string | undefined) => {
    try {
      const response = await ApiService.get(
        `printerstation/single/${locationcde}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching single printer station:", error);
      throw error;
    }
  }
);

export const putPrinterStation = createAsyncThunk(
  "service/putPrinterStation",
  async (data: PrinterStationModel | undefined) => {
    if (!data) {
      console.error("No data to update");
      return undefined;
    }

    try {
      const response = await ApiService.put("printerstation", data);
      console.log("asd:", response);
      return response.data;
    } catch (error) {
      console.error("Error updating printer station:", error);
      throw error;
    }
  }
);

export const deletePrinterStation = createAsyncThunk(
  "service/deletePrinterStation",
  async (recid: number) => {
    try {
      const response = await ApiService.delete(`printerstation/${recid}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting printer station:", error);
      throw error;
    }
  }
);
