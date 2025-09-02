import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { createOrder, getAllOrders, getOrderByUserId, updateOrderById, fetchSellerOrders, updateOrderStatus, fetchBuyerOrders } from './OrderApi'


const initialState={
    status:"idle",
    orderUpdateStatus:"idle",
    orderFetchStatus:"idle",
    orders:[],
    currentOrder:null,
    errors:null,
    successMessage:null,
    sellerOrders: [],
    sellerOrdersStatus: 'idle',
    sellerOrdersError: null,
    orderActionStatus: 'idle',
    orderActionError: null,
    buyerOrders: [],
    buyerOrdersStatus: 'idle',
    buyerOrdersError: null,
}

export const createOrderAsync=createAsyncThunk("orders/createOrderAsync",async(order)=>{
    const createdOrder=await createOrder(order)
    return createdOrder
})

export const getAllOrdersAsync=createAsyncThunk("orders/getAllOrdersAsync",async()=>{
    const orders=await getAllOrders()
    return orders
})

export const getOrderByUserIdAsync=createAsyncThunk("orders/getOrderByUserIdAsync",async(id)=>{
    const orders=await getOrderByUserId(id)
    return orders
})

export const updateOrderByIdAsync=createAsyncThunk("orders/updateOrderByIdAsync",async(update)=>{
    const updatedOrder=await updateOrderById(update)
    return updatedOrder
})

export const fetchSellerOrdersAsync = createAsyncThunk('orders/fetchSellerOrdersAsync', async (sellerId) => {
  return await fetchSellerOrders(sellerId);
});

export const updateOrderStatusAsync = createAsyncThunk('orders/updateOrderStatusAsync', async ({ id, data }) => {
  return await updateOrderStatus(id, data);
});

export const fetchBuyerOrdersAsync = createAsyncThunk('orders/fetchBuyerOrdersAsync', async (buyerId) => {
  return await fetchBuyerOrders(buyerId);
});

const orderSlice=createSlice({
    name:'orderSlice',
    initialState:initialState,
    reducers:{
        resetCurrentOrder:(state)=>{
            state.currentOrder=null
        },
        resetOrderUpdateStatus:(state)=>{
            state.orderUpdateStatus='idle'
        },
        resetOrderFetchStatus:(state)=>{
            state.orderFetchStatus='idle'
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(createOrderAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(createOrderAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.orders.push(action.payload)
                state.currentOrder=action.payload
            })
            .addCase(createOrderAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(getAllOrdersAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getAllOrdersAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                state.orders=action.payload
            })
            .addCase(getAllOrdersAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(getOrderByUserIdAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getOrderByUserIdAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                state.orders=action.payload
            })
            .addCase(getOrderByUserIdAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(updateOrderByIdAsync.pending,(state)=>{
                state.orderUpdateStatus='pending'
            })
            .addCase(updateOrderByIdAsync.fulfilled,(state,action)=>{
                state.orderUpdateStatus='fulfilled'
                const index=state.orders.findIndex((order)=>order._id===action.payload._id)
                state.orders[index]=action.payload
            })
            .addCase(updateOrderByIdAsync.rejected,(state,action)=>{
                state.orderUpdateStatus='rejected'
                state.errors=action.error
            })

            .addCase(fetchSellerOrdersAsync.pending, (state) => {
                state.sellerOrdersStatus = 'pending';
            })
            .addCase(fetchSellerOrdersAsync.fulfilled, (state, action) => {
                state.sellerOrdersStatus = 'fulfilled';
                state.sellerOrders = action.payload;
            })
            .addCase(fetchSellerOrdersAsync.rejected, (state, action) => {
                state.sellerOrdersStatus = 'rejected';
                state.sellerOrdersError = action.error;
            })

            .addCase(updateOrderStatusAsync.pending, (state) => {
                state.orderActionStatus = 'pending';
            })
            .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
                state.orderActionStatus = 'fulfilled';
                const idx = state.sellerOrders.findIndex(o => o._id === action.payload._id);
                if (idx !== -1) state.sellerOrders[idx] = action.payload;
            })
            .addCase(updateOrderStatusAsync.rejected, (state, action) => {
                state.orderActionStatus = 'rejected';
                state.orderActionError = action.error;
            })

            .addCase(fetchBuyerOrdersAsync.pending, (state) => {
                state.buyerOrdersStatus = 'pending';
            })
            .addCase(fetchBuyerOrdersAsync.fulfilled, (state, action) => {
                state.buyerOrdersStatus = 'fulfilled';
                state.buyerOrders = action.payload;
            })
            .addCase(fetchBuyerOrdersAsync.rejected, (state, action) => {
                state.buyerOrdersStatus = 'rejected';
                state.buyerOrdersError = action.error;
            });
    }
})

// exporting reducers
export const {resetCurrentOrder,resetOrderUpdateStatus,resetOrderFetchStatus}=orderSlice.actions

// exporting selectors
export const selectOrderStatus=(state)=>state.OrderSlice.status
export const selectOrders=(state)=>state.OrderSlice.orders
export const selectOrdersErrors=(state)=>state.OrderSlice.errors
export const selectOrdersSuccessMessage=(state)=>state.OrderSlice.successMessage
export const selectCurrentOrder=(state)=>state.OrderSlice.currentOrder
export const selectOrderUpdateStatus=(state)=>state.OrderSlice.orderUpdateStatus
export const selectOrderFetchStatus=(state)=>state.OrderSlice.orderFetchStatus
export const selectSellerOrders = (state) => state.OrderSlice.sellerOrders;
export const selectSellerOrdersStatus = (state) => state.OrderSlice.sellerOrdersStatus;
export const selectSellerOrdersError = (state) => state.OrderSlice.sellerOrdersError;
export const selectOrderActionStatus = (state) => state.OrderSlice.orderActionStatus;
export const selectOrderActionError = (state) => state.OrderSlice.orderActionError;
export const selectBuyerOrders = (state) => state.OrderSlice.buyerOrders;
export const selectBuyerOrdersStatus = (state) => state.OrderSlice.buyerOrdersStatus;
export const selectBuyerOrdersError = (state) => state.OrderSlice.buyerOrdersError;

export default orderSlice.reducer