import {configureStore} from '@reduxjs/toolkit'
import AuthSlice from '../features/auth/AuthSlice'
import ProductSlice from '../features/products/ProductSlice'
import UserSlice from '../features/user/UserSlice'
import BrandSlice from '../features/brands/BrandSlice'
import CategoriesSlice from '../features/categories/CategoriesSlice'
import CartSlice from '../features/cart/CartSlice'
import AddressSlice from '../features/address/AddressSlice'
import ReviewSlice from '../features/review/ReviewSlice'
import OrderSlice from '../features/order/OrderSlice'
import WishlistSlice from '../features/wishlist/WishlistSlice'
import currencyReducer from '../features/currency/currencySlice'
import countryReducer from '../features/currency/countrySlice'
import AdminReducer from '../features/admin/AdminSlice'
import ServiceSlice from '../features/services/ServiceSlice';
import auctionSlice from '../features/auctions/auctionSlice';
import paymentReducer from '../features/payment/PaymentSlice';

export const store=configureStore({
    reducer:{
        AuthSlice,
        ProductSlice,
        UserSlice,
        BrandSlice,
        CategoriesSlice,
        CartSlice,
        AddressSlice,
        ReviewSlice,
        OrderSlice,
        WishlistSlice,
        AdminSlice: AdminReducer,
        currency: currencyReducer,
        country: countryReducer,
        ServiceSlice,
        auctions: auctionSlice,
        payment: paymentReducer,
    }
})