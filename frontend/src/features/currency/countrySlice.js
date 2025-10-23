import { createSlice } from '@reduxjs/toolkit';
import { updateUserByIdAsync } from '../user/UserSlice';

const countrySlice = createSlice({
    name: 'country',
    initialState: {
        selectedCountry: 'Kenya', // Default country
        status: 'idle',
        error: null,
    },
    reducers: {
        setSelectedCountry: (state, action) => {
            state.selectedCountry = action.payload;
        },
        setCountryStatus: (state, action) => {
            state.status = action.payload;
        },
        setCountryError: (state, action) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateUserByIdAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateUserByIdAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Update selectedCountry from the updated user data if available
                if (action.payload && action.payload.country) {
                    state.selectedCountry = action.payload.country;
                }
                state.error = null;
            })
            .addCase(updateUserByIdAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { setSelectedCountry, setCountryStatus, setCountryError } = countrySlice.actions;

export const selectCountry = (state) => state.country.selectedCountry;
export const selectCountryStatus = (state) => state.country.status;
export const selectCountryError = (state) => state.country.error;

export default countrySlice.reducer;