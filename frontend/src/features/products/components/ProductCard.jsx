import { FormHelperText, Paper, Stack, Typography, useMediaQuery, useTheme} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { addToCartAsync,selectCartItems } from '../../cart/CartSlice';
import {motion} from 'framer-motion';
import { formatPrice } from '../../currency/CurrencySelector';
import { selectCurrency, selectRates } from '../../currency/currencySlice';

export const ProductCard = ({id,title,product,price,thumbnail,brand,stockQuantity,handleAddRemoveFromWishlist,isWishlistCard,isAdminCard}) => {


    const navigate=useNavigate()
    const selectedCurrency = useSelector(selectCurrency);
    const rates = useSelector(selectRates);
    const wishlistItems=useSelector(selectWishlistItems)
    const loggedInUser=useSelector(selectLoggedInUser)
    const cartItems=useSelector(selectCartItems)
    const dispatch=useDispatch()
    let isProductAlreadyinWishlist=-1


    const theme=useTheme()
    const is1410=useMediaQuery(theme.breakpoints.down(1410))
    const is932=useMediaQuery(theme.breakpoints.down(932))
    const is752=useMediaQuery(theme.breakpoints.down(752))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is608=useMediaQuery(theme.breakpoints.down(608))
    const is488=useMediaQuery(theme.breakpoints.down(488))
    const is408=useMediaQuery(theme.breakpoints.down(408))

    // Defensive: Only check _id if item and product exist
    isProductAlreadyinWishlist = Array.isArray(wishlistItems) && wishlistItems.some(
      (item) => item && item.product && item.product._id === id
    ) || false;

    const isProductAlreadyInCart = Array.isArray(cartItems) && cartItems.some(
      (item) => item && item.product && item.product._id === id
    ) || false;

    const handleAddToCart=async(e)=>{
        e.stopPropagation()
        if(loggedInUser && loggedInUser._id && id) {
            const data={user:loggedInUser._id,product:id}
            dispatch(addToCartAsync(data))
        }
    }


  return (
    <>

    {

    isProductAlreadyinWishlist!==-1 ?
            <Stack component={isAdminCard?"":isWishlistCard?"":is408?'':Paper} mt={is408?2:0} elevation={1} p={2} width={is408?'auto':is488?"200px":is608?"240px":is752?"300px":is932?'240px':is1410?'300px':'340px'} sx={{cursor:"pointer"}} onClick={()=>id ? navigate(`/product-details/${id}`) : null}>

        {/* image display */}
        <Stack>
            <img width={'100%'} style={{aspectRatio:1/1,objectFit:"contain"}} height={'100%'}  src={thumbnail || ''} alt={`${title || 'Product'} photo unavailable`} />
        </Stack>

        {/* lower section */}
        <Stack flex={2} justifyContent={'flex-end'} spacing={1} rowGap={2}>

            <Stack>
                <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant='h6' fontWeight={400}>{title || 'No Title'}</Typography>
                    {
                    !isAdminCard && 
                    <motion.div whileHover={{scale:1.3,y:-10,zIndex:100}} whileTap={{scale:1}} transition={{duration:.4,type:"spring"}}>
                        <Checkbox onClick={(e)=>e.stopPropagation()} checked={isProductAlreadyinWishlist} onChange={(e)=>id ? handleAddRemoveFromWishlist(e,id) : null} icon={<FavoriteBorder />} checkedIcon={<Favorite sx={{color:'red'}} />} />
                    </motion.div>
                    }
                </Stack>
                <Typography color={"text.secondary"}>{brand || 'Unknown Brand'}</Typography>
            </Stack>

            <Stack sx={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                <Typography> {price && formatPrice ? formatPrice(price, selectedCurrency, rates) : `$${price || 0}`}</Typography>
                {
                    !isWishlistCard? isProductAlreadyInCart?
                    'Added to cart'
                    :
                    !isAdminCard &&
                    <motion.button  whileHover={{scale:1.030}} whileTap={{scale:1}} onClick={(e)=>id ? handleAddToCart(e) : null} style={{padding:"10px 15px",borderRadius:"3px",outline:"none",border:"none",cursor:"pointer",backgroundColor:"black",color:"white",fontSize:is408?'.9rem':is488?'.7rem':is500?'.8rem':'.9rem'}}>
                        <div style={{display:"flex",alignItems:"center",columnGap:".5rem"}}>
                            <p>Add To Cart</p>
                        </div>
                    </motion.button>
                    :''
                }
                
            </Stack>
            {
                stockQuantity && stockQuantity > 0 && stockQuantity <= 20 && (
                    <FormHelperText sx={{fontSize:".9rem"}} error>{stockQuantity === 1 ? "Only 1 stock is left" : "Only few are left"}</FormHelperText>
                )
            }
        </Stack>
    </Stack> 
    :''
    
    
    }
    
    </>
  )
}
