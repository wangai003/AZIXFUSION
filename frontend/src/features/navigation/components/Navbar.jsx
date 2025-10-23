import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Badge, 
  Button, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Stack, 
  useMediaQuery, 
  useTheme, 
  Box,
  Divider,
  Fade
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HandymanIcon from '@mui/icons-material/Handyman';
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice';
import CurrencySelector from '../../currency/CurrencySelector';
import CountrySelector from '../../currency/CountrySelector';
import { motion } from 'framer-motion';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';

export const Navbar = ({ isProductList = false }) => {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const userInfo = useSelector(selectUserInfo);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);
  
  // Debug: Log user data to see what's happening
  console.log('Navbar - loggedInUser:', loggedInUser);
  console.log('Navbar - user roles:', loggedInUser?.roles);
  console.log('Navbar - sellerType:', loggedInUser?.sellerType);
  console.log('Navbar - isAdmin:', loggedInUser?.isAdmin);
  console.log('Navbar - seller check result:', loggedInUser?.roles?.includes('seller'));
  console.log('Navbar - should show admin options:', loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods'));
  console.log('Navbar - should show seller dashboard:', loggedInUser?.roles?.includes('seller'));
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters());
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const settings = [
    { name: "Home", to: "/", icon: <HomeIcon /> },
    { name: 'Profile', to: (loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods')) ? "/admin/profile" : "/profile", icon: <PersonIcon /> },
    { name: (loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods')) ? 'Orders' : 'My orders', to: (loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods')) ? "/admin/orders" : "/orders", icon: <ShoppingBagIcon /> },
    // Add admin dashboard link if user is admin or goods seller
    ...(loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods') ? [
      { name: 'Admin Dashboard', to: "/admin/dashboard", icon: <DashboardIcon /> }
    ] : []),
    // Add seller dashboard link if user is a seller
    ...(loggedInUser?.roles?.includes('seller') ? [
      { name: 'Seller Dashboard', to: "/seller/dashboard", icon: <StorefrontIcon /> }
    ] : []),
    // Add exporter dashboard link if user is an exporter
    ...(loggedInUser?.roles?.includes('exporter') ? [
      { name: 'Exporter Dashboard', to: "/exporter/dashboard", icon: <PublicIcon /> }
    ] : []),
    { name: 'Logout', to: "/logout", icon: <LogoutIcon /> },
  ];

  const navLinks = [
    { name: "Retail & Consumer Goods", to: "/goods-marketplace", icon: <StorefrontIcon /> },
    { name: "African Exports & Global Trade", to: "/export-marketplace", icon: <PublicIcon /> },
    { name: "Live Bidding Hub", to: "/auctions", icon: <GavelIcon /> },
    { name: "Services", to: "/services", icon: <HandymanIcon /> },
    { name: "Local Experiences", to: "/experiences", icon: <LocationOnIcon /> },
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: "white", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        color: "text.primary"
      }}
      component={motion.div}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ p: 1, minHeight: "4.5rem", display: "flex", justifyContent: "space-between" }}>
          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src="https://files.catbox.moe/r7gvct.png"
              alt="AEM Logo"
              style={{ height: "100px", width: "auto" }}
            />
          </Box>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Stack direction="row" spacing={3}>
              {navLinks.map((link) => (
                <Button 
                  key={link.name}
                  component={Link}
                  to={link.to}
                  color="inherit"
                  sx={{ 
                    fontWeight: 500,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '0%',
                      height: '2px',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: theme.palette.primary.main,
                      transition: 'width 0.3s ease'
                    },
                    '&:hover::after': {
                      width: '70%'
                    }
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </Stack>
          )}

          {/* Right Side - User Menu, Cart, etc. */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <IconButton 
                edge="start" 
                color="inherit" 
                aria-label="menu"
                onClick={handleMobileMenuToggle}
              >
                <MenuIcon />
              </IconButton>
            )}

            <CurrencySelector />

            <CountrySelector />

            {/* Cart Icon */}
            <Badge badgeContent={cartItems?.length || 0} color="secondary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
              <IconButton 
                onClick={() => navigate("/cart")}
                sx={{ 
                  color: theme.palette.text.primary,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <ShoppingCartOutlinedIcon />
              </IconButton>
            </Badge>

            {/* Wishlist Icon */}
            {!(loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods')) && (
              <Badge badgeContent={wishlistItems?.length || 0} color="secondary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                <IconButton 
                  component={Link} 
                  to="/wishlist"
                  sx={{ 
                    color: theme.palette.text.primary,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                >
                  <FavoriteBorderIcon />
                </IconButton>
              </Badge>
            )}

            {/* Filter Toggle for Product List */}
            {isProductList && (
              <IconButton 
                onClick={handleToggleFilters}
                sx={{ 
                  color: isProductFilterOpen ? theme.palette.primary.main : theme.palette.text.primary,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <TuneIcon />
              </IconButton>
            )}

            {/* Admin Badge */}
            {loggedInUser?.isAdmin && (
              <Button 
                variant="contained" 
                color="secondary"
                size="small"
                sx={{ 
                  borderRadius: '20px',
                  px: 2,
                  py: 0.5,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 8px rgba(255, 0, 110, 0.3)'
                }}
              >
                Admin
              </Button>
            )}

            {/* Seller Badge */}
            {loggedInUser?.roles?.includes('seller') && (
              <Button 
                variant="contained" 
                color={loggedInUser?.sellerVerificationStatus === 'verified' ? 'success' : 'warning'}
                size="small"
                sx={{ 
                  borderRadius: '20px',
                  px: 2,
                  py: 0.5,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  boxShadow: loggedInUser?.sellerVerificationStatus === 'verified' 
                    ? '0 2px 8px rgba(76, 175, 80, 0.3)' 
                    : '0 2px 8px rgba(255, 152, 0, 0.3)',
                  ml: loggedInUser?.isAdmin ? 1 : 0
                }}
              >
                {loggedInUser?.sellerVerificationStatus === 'verified' ? 'Verified Seller' : 'Pending Verification'}
              </Button>
            )}

            {/* User Avatar & Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!is480 && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mr: 1.5, 
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {userInfo?.name ? `Hey, ${userInfo.name.split(" ")[0]}` : 'Hello'}
                </Typography>
              )}
              
              <Tooltip title="Account settings">
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: 0,
                    border: `2px solid ${theme.palette.primary.main}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                >
                  <Avatar 
                    alt={userInfo?.name || 'User'} 
                    src="/static/images/avatar/2.jpg"
                    sx={{ 
                      width: 36, 
                      height: 36,
                      bgcolor: theme.palette.primary.main
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>

            {/* User Menu Dropdown */}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              TransitionComponent={Fade}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: 2,
                  minWidth: 180,
                  overflow: 'visible',
                  mt: 1.5,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
               {(loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods')) && (
                 <MenuItem onClick={handleCloseUserMenu}>
                   <ListItemIcon>
                     <AddCircleOutlineIcon fontSize="small" color="primary" />
                   </ListItemIcon>
                   <Typography 
                     component={Link} 
                     to="/admin/add-product" 
                     sx={{ 
                       textDecoration: "none", 
                       color: 'text.primary',
                       fontWeight: 500
                     }}
                   >
                     Add Product
                   </Typography>
                 </MenuItem>
               )}
               
               {(loggedInUser?.isAdmin || (loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods')) && <Divider sx={{ my: 1 }} />}
              
              {settings.map((setting) => (
                <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    {setting.icon}
                  </ListItemIcon>
                  <Typography 
                    component={Link} 
                    to={setting.to} 
                    sx={{ 
                      textDecoration: "none", 
                      color: 'text.primary',
                      fontWeight: setting.name === 'Logout' ? 600 : 500,
                      color: setting.name === 'Logout' ? 'error.main' : 'text.primary'
                    }}
                  >
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Toolbar>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '0 16px 16px 0',
            pt: 2
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img
              src="https://files.catbox.moe/r7gvct.png"
              alt="AEM Logo"
              style={{ height: "80px", width: "auto" }}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {navLinks.map((link) => (
              <ListItem 
                button 
                key={link.name} 
                component={Link} 
                to={link.to}
                onClick={handleMobileMenuToggle}
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(58, 134, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText primary={link.name} />
              </ListItem>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            {settings.map((setting) => (
              <ListItem 
                button 
                key={setting.name} 
                component={Link} 
                to={setting.to}
                onClick={handleMobileMenuToggle}
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: setting.name === 'Logout' 
                      ? 'rgba(255, 82, 82, 0.08)' 
                      : 'rgba(58, 134, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: setting.name === 'Logout' ? 'error.main' : 'primary.main'
                }}>
                  {setting.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={setting.name} 
                  primaryTypographyProps={{
                    fontWeight: setting.name === 'Logout' ? 600 : 500,
                    color: setting.name === 'Logout' ? 'error.main' : 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}