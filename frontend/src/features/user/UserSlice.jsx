import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { fetchLoggedInUserById, updateUserById, becomeSeller, fetchSellerDashboard, becomeExperienceHost, becomeExporter } from './UserApi'

const initialState={
    status:"idle",
    userInfo:null,
    errors:null,
    successMessage:null,
    sellerOnboardingStatus: "idle",
    sellerDashboard: null,
    sellerDashboardStatus: "idle",
    hostOnboardingStatus: "idle",
    exporterOnboardingStatus: "idle"
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

export const becomeExperienceHostAsync = createAsyncThunk('user/becomeExperienceHostAsync', async (data) => {
    const user = await becomeExperienceHost(data);
    return user;
});

export const becomeExporterAsync = createAsyncThunk('user/becomeExporterAsync', async (data) => {
    const user = await becomeExporter(data);
    return user;
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
            })

            .addCase(becomeExperienceHostAsync.pending, (state) => {
                state.hostOnboardingStatus = 'pending';
            })
            .addCase(becomeExperienceHostAsync.fulfilled, (state, action) => {
                state.hostOnboardingStatus = 'fulfilled';
                state.userInfo = action.payload;
            })
            .addCase(becomeExperienceHostAsync.rejected, (state, action) => {
                state.hostOnboardingStatus = 'rejected';
                state.errors = action.error;
            })

            .addCase(becomeExporterAsync.pending, (state) => {
                state.exporterOnboardingStatus = 'pending';
            })
            .addCase(becomeExporterAsync.fulfilled, (state, action) => {
                state.exporterOnboardingStatus = 'fulfilled';
                state.userInfo = action.payload;
            })
            .addCase(becomeExporterAsync.rejected, (state, action) => {
                state.exporterOnboardingStatus = 'rejected';
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
export const selectHostOnboardingStatus = (state) => state.UserSlice.hostOnboardingStatus;
export const selectExporterOnboardingStatus = (state) => state.UserSlice.exporterOnboardingStatus;

export default userSlice.reducer