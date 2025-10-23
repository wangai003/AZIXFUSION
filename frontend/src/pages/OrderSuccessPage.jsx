import { Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme, Alert, CircularProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { resetCurrentOrder, selectCurrentOrder } from '../features/order/OrderSlice'
import { selectUserInfo } from '../features/user/UserSlice'
import { getPaymentStatusAsync, selectCurrentPaymentStatus, selectPaymentStatusCheck } from '../features/payment/PaymentSlice'
import { orderSuccessAnimation } from '../assets'
import Lottie from 'lottie-react'

export const OrderSuccessPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const currentOrder = useSelector(selectCurrentOrder)
    const userDetails = useSelector(selectUserInfo)
    const paymentStatus = useSelector(selectCurrentPaymentStatus)
    const statusCheckLoading = useSelector(selectPaymentStatusCheck)
    const { id } = useParams() // This could be orderId or paymentIntentId

    const theme = useTheme()
    const is480 = useMediaQuery(theme.breakpoints.down(480))
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false)
    const [showPollingStatus, setShowPollingStatus] = useState(false)

    useEffect(() => {
        // If we have a payment intent ID, check payment status
        if (id && id.startsWith('pi_')) {
            setShowPollingStatus(true)
            dispatch(getPaymentStatusAsync(id)).then((result) => {
                if (result.payload?.status === 'paid') {
                    setIsPaymentConfirmed(true)
                    setShowPollingStatus(false)
                }
            })
        } else if (!currentOrder) {
            // If no order and not a payment intent, redirect
            navigate("/")
        }
    }, [id, currentOrder, dispatch, navigate])

  // Show loading state while checking payment status
  if (showPollingStatus && statusCheckLoading) {
    return (
      <Stack width={'100vw'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>
        <Stack component={Paper} boxShadow={is480?'none':""} rowGap={3} elevation={1} p={is480?1:4} justifyContent={'center'} alignItems={'center'}>
          <CircularProgress size={60} />
          <Typography variant='h6'>Confirming your payment...</Typography>
          <Typography variant='body2' color='text.secondary'>Please wait while we verify your transaction</Typography>
        </Stack>
      </Stack>
    )
  }

  // Show payment pending state
  if (showPollingStatus && paymentStatus?.status === 'pending') {
    return (
      <Stack width={'100vw'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>
        <Stack component={Paper} boxShadow={is480?'none':""} rowGap={3} elevation={1} p={is480?1:4} justifyContent={'center'} alignItems={'center'}>
          <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
            Your payment is being processed. This may take a few moments.
          </Alert>
          <CircularProgress size={60} />
          <Typography variant='h6'>Processing Payment...</Typography>
          <Typography variant='body2' color='text.secondary'>We'll redirect you once confirmed</Typography>
        </Stack>
      </Stack>
    )
  }

  // Show payment failed state
  if (showPollingStatus && paymentStatus?.status === 'failed') {
    return (
      <Stack width={'100vw'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>
        <Stack component={Paper} boxShadow={is480?'none':""} rowGap={3} elevation={1} p={is480?1:4} justifyContent={'center'} alignItems={'center'}>
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            Payment failed. Please try again or contact support.
          </Alert>
          <Button component={Link} to={'/cart'} variant='contained' color='error'>
            Return to Cart
          </Button>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack width={'100vw'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>

        <Stack component={Paper} boxShadow={is480?'none':""} rowGap={3} elevation={1} p={is480?1:4} justifyContent={'center'} alignItems={'center'}>

            <Box width={'10rem'} height={'7rem'}>
                <Lottie animationData={orderSuccessAnimation}></Lottie>
            </Box>

            <Stack mt={2} textAlign={'center'} justifyContent={'center'} alignItems={'center'} rowGap={1}>
                <Typography variant='h6' fontWeight={400}>Hey {userDetails?.name}</Typography>
                <Typography variant='h5' >
                  {isPaymentConfirmed
                    ? `Payment Confirmed! Order #${id} is being processed`
                    : `Your Order ${currentOrder?._id || id} is confirmed`
                  }
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {isPaymentConfirmed
                    ? 'Your crypto payment was successful. Check your email for details.'
                    : 'Thank you for shopping with us❤️'
                  }
                </Typography>
            </Stack>

            {isPaymentConfirmed && (
              <Alert severity="success" sx={{ width: '100%' }}>
                ✅ Payment received successfully via MoonPay
              </Alert>
            )}

            <Button component={Link} to={'/orders'} onClick={()=>dispatch(resetCurrentOrder())} size={is480?"small":""}  variant='contained'>
              Check order status in my orders
            </Button>
        </Stack>

    </Stack>
  )
}
