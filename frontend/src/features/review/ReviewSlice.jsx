import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { createReview, deleteReviewById, fetchReviewsByProductId, updateReviewById, fetchProductReviews, fetchServiceReviews, fetchUserReviews } from './ReviewApi'


const initialState={
    status:"idle",
    reviewAddStatus:"idle",
    reviewDeleteStatus:"idle",
    reviewUpdateStatus:"idle",
    reviewFetchStatus:"idle",
    reviews:[],
    errors:null,
    successMessage:null,
    productReviews: [],
    productReviewsStatus: 'idle',
    productReviewsError: null,
    serviceReviews: [],
    serviceReviewsStatus: 'idle',
    serviceReviewsError: null,
    userReviews: [],
    userReviewsStatus: 'idle',
    userReviewsError: null,
    reviewActionStatus: 'idle',
    reviewActionError: null,
}

export const createReviewAsync=createAsyncThunk('review/createReviewAsync',async(review)=>{
    const createdReview=await createReview(review)
    return createdReview
})

export const fetchReviewsByProductIdAsync=createAsyncThunk('review/fetchReviewsByProductIdAsync',async(id)=>{
    const reviews=await fetchReviewsByProductId(id)
    return reviews
})

export const updateReviewByIdAsync=createAsyncThunk("review/updateReviewByIdAsync",async(update)=>{
    const updatedReview=await updateReviewById(update)
    return updatedReview
})

export const deleteReviewByIdAsync=createAsyncThunk('reviews/deleteReviewByIdAsync',async(id)=>{
    const deletedReview=await deleteReviewById(id)
    return deletedReview
})

export const fetchProductReviewsAsync = createAsyncThunk('reviews/fetchProductReviewsAsync', async (productId) => {
  return await fetchProductReviews(productId);
});

export const fetchServiceReviewsAsync = createAsyncThunk('reviews/fetchServiceReviewsAsync', async (serviceId) => {
  return await fetchServiceReviews(serviceId);
});

export const fetchUserReviewsAsync = createAsyncThunk('reviews/fetchUserReviewsAsync', async (userId) => {
  return await fetchUserReviews(userId);
});

const reviewSlice=createSlice({
    name:"reviewSlice",
    initialState:initialState,
    reducers:{
        resetReviewAddStatus:(state)=>{
            state.reviewAddStatus='idle'
        },
        resetReviewDeleteStatus:(state)=>{
            state.reviewDeleteStatus='idle'
        },
        resetReviewUpdateStatus:(state)=>{
            state.reviewUpdateStatus='idle'
        },
        resetReviewFetchStatus:(state)=>{
            state.reviewFetchStatus='idle'
        }
    },
    extraReducers:(builder)=>{
        builder
            // createReviewAsync - handles both general reviews and action status
            .addCase(createReviewAsync.pending,(state)=>{
                state.reviewAddStatus='pending'
                state.reviewActionStatus = 'pending';
            })
            .addCase(createReviewAsync.fulfilled,(state,action)=>{
                state.reviewAddStatus='fulfilled'
                state.reviewActionStatus = 'fulfilled';
                state.reviews.push(action.payload)
            })
            .addCase(createReviewAsync.rejected,(state,action)=>{
                state.reviewAddStatus='rejected'
                state.reviewActionStatus = 'rejected';
                state.errors=action.error
                state.reviewActionError = action.error;
            })

            .addCase(fetchReviewsByProductIdAsync.pending,(state)=>{
                state.reviewFetchStatus='pending'
            })
            .addCase(fetchReviewsByProductIdAsync.fulfilled,(state,action)=>{
                state.reviewFetchStatus='fulfilled'
                state.reviews=action.payload
            })
            .addCase(fetchReviewsByProductIdAsync.rejected,(state,action)=>{
                state.reviewFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(updateReviewByIdAsync.pending,(state)=>{
                state.reviewUpdateStatus='pending'
            })
            .addCase(updateReviewByIdAsync.fulfilled,(state,action)=>{
                state.reviewUpdateStatus='fulfilled'
                const index=state.reviews.findIndex((review)=>review._id===action.payload._id)
                if (index !== -1) state.reviews[index]=action.payload
            })
            .addCase(updateReviewByIdAsync.rejected,(state,action)=>{
                state.reviewUpdateStatus='rejected'
                state.errors=action.error
            })

            .addCase(deleteReviewByIdAsync.pending,(state)=>{
                state.reviewDeleteStatus='pending'
            })
            .addCase(deleteReviewByIdAsync.fulfilled,(state,action)=>{
                state.reviewDeleteStatus='fulfilled'
                state.reviews=state.reviews.filter((review)=>review._id!==action.payload._id)
            })
            .addCase(deleteReviewByIdAsync.rejected,(state,action)=>{
                state.reviewDeleteStatus='rejected'
                state.errors=action.error
            })

            .addCase(fetchProductReviewsAsync.pending, (state) => {
                state.productReviewsStatus = 'pending';
            })
            .addCase(fetchProductReviewsAsync.fulfilled, (state, action) => {
                state.productReviewsStatus = 'fulfilled';
                state.productReviews = action.payload;
            })
            .addCase(fetchProductReviewsAsync.rejected, (state, action) => {
                state.productReviewsStatus = 'rejected';
                state.productReviewsError = action.error;
            })
            .addCase(fetchServiceReviewsAsync.pending, (state) => {
                state.serviceReviewsStatus = 'pending';
            })
            .addCase(fetchServiceReviewsAsync.fulfilled, (state, action) => {
                state.serviceReviewsStatus = 'fulfilled';
                state.serviceReviews = action.payload;
            })
            .addCase(fetchServiceReviewsAsync.rejected, (state, action) => {
                state.serviceReviewsStatus = 'rejected';
                state.serviceReviewsError = action.error;
            })
            .addCase(fetchUserReviewsAsync.pending, (state) => {
                state.userReviewsStatus = 'pending';
            })
            .addCase(fetchUserReviewsAsync.fulfilled, (state, action) => {
                state.userReviewsStatus = 'fulfilled';
                state.userReviews = action.payload;
            })
            .addCase(fetchUserReviewsAsync.rejected, (state, action) => {
                state.userReviewsStatus = 'rejected';
                state.userReviewsError = action.error;
            });
    }
})


// exporting selectors
export const selectReviewStatus=(state)=>state.ReviewSlice.status
export const selectReviews=(state)=>state.ReviewSlice.reviews
export const selectReviewErrors=(state)=>state.ReviewSlice.errors
export const selectReviewSuccessMessage=(state)=>state.ReviewSlice.successMessage
export const selectReviewAddStatus=(state)=>state.ReviewSlice.reviewAddStatus
export const selectReviewDeleteStatus=(state)=>state.ReviewSlice.reviewDeleteStatus
export const selectReviewUpdateStatus=(state)=>state.ReviewSlice.reviewUpdateStatus
export const selectReviewFetchStatus=(state)=>state.ReviewSlice.reviewFetchStatus
export const selectProductReviews = (state) => state.ReviewSlice.productReviews;
export const selectProductReviewsStatus = (state) => state.ReviewSlice.productReviewsStatus;
export const selectProductReviewsError = (state) => state.ReviewSlice.productReviewsError;
export const selectServiceReviews = (state) => state.ReviewSlice.serviceReviews;
export const selectServiceReviewsStatus = (state) => state.ReviewSlice.serviceReviewsStatus;
export const selectServiceReviewsError = (state) => state.ReviewSlice.serviceReviewsError;
export const selectUserReviews = (state) => state.ReviewSlice.userReviews;
export const selectUserReviewsStatus = (state) => state.ReviewSlice.userReviewsStatus;
export const selectUserReviewsError = (state) => state.ReviewSlice.userReviewsError;
export const selectReviewActionStatus = (state) => state.ReviewSlice.reviewActionStatus;
export const selectReviewActionError = (state) => state.ReviewSlice.reviewActionError;

// exporting actions
export const {resetReviewAddStatus,resetReviewDeleteStatus,resetReviewUpdateStatus,resetReviewFetchStatus}=reviewSlice.actions

export default reviewSlice.reducer