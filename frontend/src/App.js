import { useSelector } from 'react-redux';
import {
  Navigate,
  Route, RouterProvider, createBrowserRouter, createRoutesFromElements
} from "react-router-dom";
import { selectIsAuthChecked, selectLoggedInUser } from './features/auth/AuthSlice';
import { Logout } from './features/auth/components/Logout';
import { Protected } from './features/auth/components/Protected';
import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";
import { AddProductPage, AdminOrdersPage, CartPage, CheckoutPage, ForgotPasswordPage, HomePage, LoginPage, OrderSuccessPage, OtpVerificationPage, ProductDetailsPage, ProductUpdatePage, ResetPasswordPage, SignupPage, UserOrdersPage, UserProfilePage, WishlistPage, MarketplaceList, BecomeSellerPage, SellerDashboardPage, BuyerDashboardPage, ServiceRequestPage, ServicesPage, GoodsMarketplace } from './pages';
import LiveBiddingHub from './pages/LiveBiddingHub';
import AuctionDetailPage from './pages/AuctionDetailPage';
import AuctionCreatePage from './pages/AuctionCreatePage';
import { BecomeExperienceHostPage } from './pages/BecomeExperienceHostPage';
import ExperienceMarketplacePage from './pages/ExperienceMarketplacePage';
import ExperienceCreatePage from './pages/ExperienceCreatePage';
import HostDashboardPage from './pages/HostDashboardPage';
import BecomeExportVendorPage from './pages/BecomeExportVendorPage';
import ExporterDashboardPage from './pages/ExporterDashboardPage';
import ExportMarketplacePage from './pages/ExportMarketplacePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import ServiceDetails from './features/services/ServiceDetails';


function App() {

  const isAuthChecked=useSelector(selectIsAuthChecked)
  const loggedInUser=useSelector(selectLoggedInUser)

  // Debug: Log user data to see what's happening
  console.log('App.js - loggedInUser:', loggedInUser);
  console.log('App.js - user roles:', loggedInUser?.roles);
  console.log('App.js - sellerType:', loggedInUser?.sellerType);
  console.log('App.js - isAdmin:', loggedInUser?.isAdmin);
  console.log('App.js - seller check result:', loggedInUser?.roles?.includes('seller'));
  console.log('App.js - exporter check result:', loggedInUser?.roles?.includes('exporter'));
  console.log('App.js - should show admin routes:', loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods'));

  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);


  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Public routes - always accessible */}
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/verify-otp' element={<OtpVerificationPage/>}/>
        <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
        <Route path='/reset-password/:userId/:passwordResetToken' element={<ResetPasswordPage/>}/>
        
        {/* Protected routes - only when user is logged in */}
        {loggedInUser && (
          <>
            <Route exact path='/logout' element={<Protected><Logout/></Protected>}/>
            <Route exact path='/product-details/:id' element={<Protected><ProductDetailsPage/></Protected>}/>

            {(loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods')) ? (
              // admin routes - accessible to both admins and goods sellers
              <>
                <Route path='/admin/dashboard' element={<Protected><AdminDashboardPage/></Protected>}/>
                <Route path='/admin/product-update/:id' element={<Protected><ProductUpdatePage/></Protected>}/>
                <Route path='/admin/add-product' element={<Protected><AddProductPage/></Protected>}/>
                {/* Only show orders route to full admins, not goods sellers */}
                {loggedInUser?.isAdmin && (
                  <Route path='/admin/orders'  element={<Protected><AdminOrdersPage/></Protected>}/>
                )}
                <Route path='/' element={<Navigate to={'/admin/dashboard'}/>}/>
              </>
            ) : (
              // user routes
              <>
                <Route path='/' element={<Protected><HomePage/></Protected>}/>
                <Route path='/cart' element={<Protected><CartPage/></Protected>}/>
                <Route path='/profile' element={<Protected><UserProfilePage/></Protected>}/>
                <Route path='/checkout' element={<Protected><CheckoutPage/></Protected>}/>
                <Route path='/order-success/:id' element={<Protected><OrderSuccessPage/></Protected>}/>
                <Route path='/orders' element={<Protected><UserOrdersPage/></Protected>}/>
                <Route path='/wishlist' element={<Protected><WishlistPage/></Protected>}/>
                <Route path='/marketplace' element={<Protected><MarketplaceList type='product' /></Protected>} />
                <Route path='/goods-marketplace' element={<Protected><GoodsMarketplace /></Protected>} />
                <Route path='/services' element={<Protected><ServicesPage /></Protected>} />
                <Route path='/services/:id' element={<Protected><ServiceDetails /></Protected>} />
                <Route path='/auctions' element={<Protected><LiveBiddingHub /></Protected>} />
                <Route path='/auctions/create' element={<Protected><AuctionCreatePage /></Protected>} />
                <Route path='/auctions/:id' element={<Protected><AuctionDetailPage /></Protected>} />
                <Route path='/experiences' element={<Protected><ExperienceMarketplacePage /></Protected>} />
                <Route path='/experiences/create' element={<Protected><ExperienceCreatePage /></Protected>} />
                <Route path='/become-seller' element={<Protected><BecomeSellerPage /></Protected>} />
                <Route path='/become-experience-host' element={<Protected><BecomeExperienceHostPage /></Protected>} />
                <Route path='/become-export-vendor' element={<Protected><BecomeExportVendorPage /></Protected>} />
                <Route path='/export-marketplace' element={<Protected><ExportMarketplacePage /></Protected>} />
                <Route path='/exporter/dashboard' element={<Protected><ExporterDashboardPage /></Protected>} />
                <Route path='/host/dashboard' element={<Protected><HostDashboardPage /></Protected>} />
                <Route path='/seller/dashboard' element={<Protected><SellerDashboardPage /></Protected>} />
                <Route path='/buyer/dashboard' element={<Protected><BuyerDashboardPage /></Protected>} />
                <Route path='/service-request' element={<Protected><ServiceRequestPage /></Protected>} />
              </>
            )}
          </>
        )}

        {/* Default redirect when not authenticated */}
        {!loggedInUser && isAuthChecked && (
          <Route path='*' element={<Navigate to='/login'/>} />
        )}

        {/* 404 page */}
        <Route path='*' element={<NotFoundPage/>} />

      </>
    )
  )

  
  return isAuthChecked ? <RouterProvider router={routes}/> : "";
}

export default App;
