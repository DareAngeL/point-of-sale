import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../../services";


export const fixOrdocnumDuplicate = createAsyncThunk(
    "utilities/fixOrdocnumDuplicate",
    async (params: { from: string; to: string }) => {
        const response = await ApiService.post(`posfile/fixDuplicate?from=${params.from}&to=${params.to}`, {});
        return response.data;
    }
);