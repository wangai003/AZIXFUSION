import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { googleLogoutAsync, selectLoggedInUser } from '../AuthSlice'
import { useNavigate } from 'react-router-dom'

export const Logout = () => {
    const dispatch=useDispatch()
    const loggedInUser=useSelector(selectLoggedInUser)
    const navigate=useNavigate()

    useEffect(()=>{
        dispatch(googleLogoutAsync())
    },[])

    useEffect(()=>{
        if(!loggedInUser){
            navigate("/login")
        }
    },[loggedInUser])

  return (
    <></>
  )
}
