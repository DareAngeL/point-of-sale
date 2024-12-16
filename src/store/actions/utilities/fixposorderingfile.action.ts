import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../../services";


export const fixNoOrdocnum = createAsyncThunk(
    "utilities/fixNoOrdocnum",
    async () => {
        try {
            const response = await ApiService.delete(`posorderingfile/fixNoOrdocnum`);
            return response.data;   
        } catch (error) {
            console.error("Error fixNoOrdocnum:", error);
            throw error;
        }
    }
);