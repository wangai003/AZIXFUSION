import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addProduct, deleteProductById, fetchProductById, fetchProducts, undeleteProductById, updateProductById, fetchSellerProducts, updateProduct, deleteProduct, fetchFeaturedProducts } from "./ProductApi";


const initialState={
    status:"idle",
    productUpdateStatus:'idle',
    productAddStatus:"idle",
    productFetchStatus:"idle",
    products:[],
    totalResults:0,
    isFilterOpen:false,
    selectedProduct:null,
    errors:null,
    successMessage:null,
    sellerProducts: [],
    sellerProductsStatus: 'idle',
    sellerProductsError: null,
    productActionStatus: 'idle',
    productActionError: null,
    featuredProducts: [],
    featuredProductsStatus: 'idle',
    featuredProductsError: null,
}

export const addProductAsync=createAsyncThunk("products/addProductAsync",async(data)=>{
    const addedProduct=await addProduct(data)
    return addedProduct
})
export const fetchProductsAsync=createAsyncThunk("products/fetchProductsAsync",async(filters)=>{
    const products=await fetchProducts(filters)
    return products
})
export const fetchProductByIdAsync=createAsyncThunk("products/fetchProductByIdAsync",async(id)=>{
    const selectedProduct=await fetchProductById(id)
    return selectedProduct
})
export const updateProductByIdAsync=createAsyncThunk("products/updateProductByIdAsync",async(update)=>{
    const updatedProduct=await updateProductById(update)
    return updatedProduct
})
export const undeleteProductByIdAsync=createAsyncThunk("products/undeleteProductByIdAsync",async(id)=>{
    const unDeletedProduct=await undeleteProductById(id)
    return unDeletedProduct
})
export const deleteProductByIdAsync=createAsyncThunk("products/deleteProductByIdAsync",async(id)=>{
    const deletedProduct=await deleteProductById(id)
    return deletedProduct
})

export const fetchSellerProductsAsync = createAsyncThunk('products/fetchSellerProductsAsync', async (sellerId) => {
  return await fetchSellerProducts(sellerId);
});

export const updateProductAsync = createAsyncThunk('products/updateProductAsync', async ({ id, data }) => {
  return await updateProduct(id, data);
});

export const deleteProductAsync = createAsyncThunk('products/deleteProductAsync', async (id) => {
  return await deleteProduct(id);
});

// Fetch featured products with highest ratings
export const fetchFeaturedProductsAsync = createAsyncThunk('products/fetchFeaturedProductsAsync', async ({ limit = 8, filters = {} } = {}) => {
  return await fetchFeaturedProducts(limit, filters);
});

const productSlice=createSlice({
    name:"productSlice",
    initialState:initialState,
    reducers:{
        clearProductErrors:(state)=>{
            state.errors=null
        },
        clearProductSuccessMessage:(state)=>{
            state.successMessage=null
        },
        resetProductStatus:(state)=>{
            state.status='idle'
        },
        clearSelectedProduct:(state)=>{
            state.selectedProduct=null
        },
        resetProductUpdateStatus:(state)=>{
            state.productUpdateStatus='idle'
        },
        resetProductAddStatus:(state)=>{
            state.productAddStatus='idle'
        },
        toggleFilters:(state)=>{
            state.isFilterOpen=!state.isFilterOpen
        },
        resetProductFetchStatus:(state)=>{
            state.productFetchStatus='idle'
        },
        clearProducts:(state)=>{
            state.products=[]
            state.totalResults=0
        }
    },
    extraReducers:(builder)=>{
        builder
            // addProductAsync - handles both general products and seller products
            .addCase(addProductAsync.pending,(state)=>{
                state.productAddStatus='pending'
                state.productActionStatus = 'pending';
            })
            .addCase(addProductAsync.fulfilled,(state,action)=>{
                state.productAddStatus='fulfilled'
                state.productActionStatus = 'fulfilled';
                console.log('ProductSlice - addProductAsync.fulfilled - adding product:', action.payload);
                console.log('ProductSlice - addProductAsync.fulfilled - current products count:', state.products.length);
                state.products.push(action.payload)
                state.sellerProducts.push(action.payload);
                console.log('ProductSlice - addProductAsync.fulfilled - new products count:', state.products.length);
            })
            .addCase(addProductAsync.rejected,(state,action)=>{
                state.productAddStatus='rejected'
                state.productActionStatus = 'rejected';
                state.errors=action.error
                state.productActionError = action.error;
            })

            // fetchProductsAsync
            .addCase(fetchProductsAsync.pending,(state)=>{
                state.productFetchStatus='pending'
            })
            .addCase(fetchProductsAsync.fulfilled,(state,action)=>{
                state.productFetchStatus='fulfilled'
                console.log('ProductSlice - fetchProductsAsync.fulfilled - payload:', action.payload);
                console.log('ProductSlice - fetchProductsAsync.fulfilled - products count:', action.payload.data?.length);
                // Ensure products is always an array, even if the API returns undefined/null
                state.products = Array.isArray(action.payload.data) ? action.payload.data : [];
                state.totalResults = action.payload.totalResults || 0;
            })
            .addCase(fetchProductsAsync.rejected,(state,action)=>{
                state.productFetchStatus='rejected'
                state.errors=action.error
                // Reset products to empty array on error to prevent "not iterable" errors
                state.products = [];
                state.totalResults = 0;
            })

            // fetchProductByIdAsync
            .addCase(fetchProductByIdAsync.pending,(state)=>{
                state.productFetchStatus='pending'
            })
            .addCase(fetchProductByIdAsync.fulfilled,(state,action)=>{
                state.productFetchStatus='fulfilled'
                state.selectedProduct=action.payload
            })
            .addCase(fetchProductByIdAsync.rejected,(state,action)=>{
                state.productFetchStatus='rejected'
                state.errors=action.error
            })

            // updateProductByIdAsync - for admin updates
            .addCase(updateProductByIdAsync.pending,(state)=>{
                state.productUpdateStatus='pending'
            })
            .addCase(updateProductByIdAsync.fulfilled,(state,action)=>{
                state.productUpdateStatus='fulfilled'
                const index=state.products.findIndex((product)=>product.product._id===action.payload._id)
                if (index !== -1) state.products[index]=action.payload
            })
            .addCase(updateProductByIdAsync.rejected,(state,action)=>{
                state.productUpdateStatus='rejected'
                state.errors=action.error
            })

            // undeleteProductByIdAsync
            .addCase(undeleteProductByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(undeleteProductByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                const index=state.products.findIndex((product)=>product._id===action.payload._id)
                if (index !== -1) state.products[index]=action.payload
            })
            .addCase(undeleteProductByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            // deleteProductByIdAsync - for admin deletes
            .addCase(deleteProductByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(deleteProductByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                const index=state.products.findIndex((product)=>product._id===action.payload._id)
                if (index !== -1) state.products[index]=action.payload
            })
            .addCase(deleteProductByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            // fetchSellerProductsAsync
            .addCase(fetchSellerProductsAsync.pending, (state) => {
                state.sellerProductsStatus = 'pending';
            })
            .addCase(fetchSellerProductsAsync.fulfilled, (state, action) => {
                state.sellerProductsStatus = 'fulfilled';
                state.sellerProducts = action.payload;
            })
            .addCase(fetchSellerProductsAsync.rejected, (state, action) => {
                state.sellerProductsStatus = 'rejected';
                state.sellerProductsError = action.error;
            })

            // updateProductAsync - for seller updates
            .addCase(updateProductAsync.pending, (state) => {
                state.productActionStatus = 'pending';
            })
            .addCase(updateProductAsync.fulfilled, (state, action) => {
                state.productActionStatus = 'fulfilled';
                const idx = state.sellerProducts.findIndex(p => p._id === action.payload._id);
                if (idx !== -1) state.sellerProducts[idx] = action.payload;
            })
            .addCase(updateProductAsync.rejected, (state, action) => {
                state.productActionStatus = 'rejected';
                state.productActionError = action.error;
            })

            // deleteProductAsync - for seller deletes
            .addCase(deleteProductAsync.pending, (state) => {
                state.productActionStatus = 'pending';
            })
            .addCase(deleteProductAsync.fulfilled, (state, action) => {
                state.productActionStatus = 'fulfilled';
                state.sellerProducts = state.sellerProducts.filter(p => p._id !== action.meta.arg);
            })
            .addCase(deleteProductAsync.rejected, (state, action) => {
                state.productActionStatus = 'rejected';
                state.productActionError = action.error;
            })

            // fetchFeaturedProductsAsync
            .addCase(fetchFeaturedProductsAsync.pending, (state) => {
                state.featuredProductsStatus = 'pending';
            })
            .addCase(fetchFeaturedProductsAsync.fulfilled, (state, action) => {
                state.featuredProductsStatus = 'fulfilled';
                if (action.payload && action.payload.success) {
                    state.featuredProducts = action.payload.data || [];
                } else {
                    state.featuredProducts = [];
                }
            })
            .addCase(fetchFeaturedProductsAsync.rejected, (state, action) => {
                state.featuredProductsStatus = 'rejected';
                state.featuredProductsError = action.error;
                state.featuredProducts = [];
            });
    }
})

// exporting selectors
export const selectProductStatus=(state)=>state.ProductSlice.status
export const selectProducts=(state)=>state.ProductSlice.products
export const selectProductTotalResults=(state)=>state.ProductSlice.totalResults
export const selectSelectedProduct=(state)=>state.ProductSlice.selectedProduct
export const selectProductErrors=(state)=>state.ProductSlice.errors
export const selectProductSuccessMessage=(state)=>state.ProductSlice.successMessage
export const selectProductUpdateStatus=(state)=>state.ProductSlice.productUpdateStatus
export const selectProductAddStatus=(state)=>state.ProductSlice.productAddStatus
export const selectProductIsFilterOpen=(state)=>state.ProductSlice.isFilterOpen
export const selectProductFetchStatus=(state)=>state.ProductSlice.productFetchStatus

export const selectSellerProducts = (state) => state.ProductSlice.sellerProducts;
export const selectSellerProductsStatus = (state) => state.ProductSlice.sellerProductsStatus;
export const selectSellerProductsError = (state) => state.ProductSlice.sellerProductsError;
export const selectProductActionStatus = (state) => state.ProductSlice.productActionStatus;
export const selectProductActionError = (state) => state.ProductSlice.productActionError;
export const selectFeaturedProducts = (state) => state.ProductSlice.featuredProducts;
export const selectFeaturedProductsStatus = (state) => state.ProductSlice.featuredProductsStatus;
export const selectFeaturedProductsError = (state) => state.ProductSlice.featuredProductsError;

// exporting actions
export const {clearProductSuccessMessage,clearProductErrors,clearSelectedProduct,resetProductStatus,resetProductUpdateStatus,resetProductAddStatus,toggleFilters,resetProductFetchStatus,clearProducts}=productSlice.actions

export default productSlice.reducer
