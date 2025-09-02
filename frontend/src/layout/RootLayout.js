import React from 'react'
import { Outlet } from 'react-router-dom'
import { SellerFAB } from '../features/seller/SellerFAB'

export const RootLayout = () => {
  return (
    <main>
        <Outlet/>
        <SellerFAB />
    </main>
  )
}
