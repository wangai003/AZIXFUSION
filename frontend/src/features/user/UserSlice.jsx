import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { fetchLoggedInUserById, updateUserById, becomeSeller, fetchSellerDashboard } from './UserApi'

const initialState={
    status:"idle",
    userInfo:null,
    errors:null,
    successMessage:null,
    sellerOnboardingStatus: "idle",
    sellerDashboard: null,
    sellerDashboardStatus: "idle"
}

export const fetchLoggedInUserByIdAsync=createAsyncThunk('user/fetchLoggedInUserByIdAsync',async(id)=>{
    const userInfo=await fetchLoggedInUserById(id)
    return userInfo
})
export const updateUserByIdAsync=createAsyncThunk('user/updateUserByIdAsync',async(update)=>{
    const updatedUser=await updateUserById(update)
    return updatedUser
})

export const becomeSellerAsync = createAsyncThunk('user/becomeSellerAsync', async (data) => {
    const user = await becomeSeller(data);
    return user;
});

export const fetchSellerDashboardAsync = createAsyncThunk('user/fetchSellerDashboardAsync', async () => {
    const dashboard = await fetchSellerDashboard();
    return dashboard;
});

const userSlice=createSlice({
    name:"userSlice",
    initialState:initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(fetchLoggedInUserByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(fetchLoggedInUserByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.userInfo=action.payload
            })
            .addCase(fetchLoggedInUserByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(updateUserByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(updateUserByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.userInfo=action.payload
            })
            .addCase(updateUserByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(becomeSellerAsync.pending, (state) => {
                state.sellerOnboardingStatus = 'pending';
            })
            .addCase(becomeSellerAsync.fulfilled, (state, action) => {
                state.sellerOnboardingStatus = 'fulfilled';
                state.userInfo = action.payload;
            })
            .addCase(becomeSellerAsync.rejected, (state, action) => {
                state.sellerOnboardingStatus = 'rejected';
                state.errors = action.error;
            })

            .addCase(fetchSellerDashboardAsync.pending, (state) => {
                state.sellerDashboardStatus = 'pending';
            })
            .addCase(fetchSellerDashboardAsync.fulfilled, (state, action) => {
                state.sellerDashboardStatus = 'fulfilled';
                state.sellerDashboard = action.payload;
            })
            .addCase(fetchSellerDashboardAsync.rejected, (state, action) => {
                state.sellerDashboardStatus = 'rejected';
                state.errors = action.error;
            });
    }
})

// exporting selectors
export const selectUserStatus=(state)=>state.UserSlice.status
export const selectUserInfo=(state)=>state.UserSlice.userInfo
export const selectUserErrors=(state)=>state.UserSlice.errors
export const selectUserSuccessMessage=(state)=>state.UserSlice.successMessage
export const selectSellerOnboardingStatus = (state) => state.UserSlice.sellerOnboardingStatus;
export const selectSellerDashboard = (state) => state.UserSlice.sellerDashboard;
export const selectSellerDashboardStatus = (state) => state.UserSlice.sellerDashboardStatus;

export default userSlice.reducer