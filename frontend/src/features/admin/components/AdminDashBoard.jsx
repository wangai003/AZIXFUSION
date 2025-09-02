import { Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Pagination, Select, Stack, Typography, useMediaQuery, useTheme, Box, Tabs, Tab, CircularProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import { selectBrands } from '../../brands/BrandSlice'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { selectCategories } from '../../categories/CategoriesSlice'
import { ProductCard } from '../../products/components/ProductCard'
import { deleteProductByIdAsync, fetchProductsAsync, selectProductIsFilterOpen, selectProductTotalResults, selectProducts, toggleFilters, undeleteProductByIdAsync } from '../../products/ProductSlice';
import { Link } from 'react-router-dom';
import {motion} from 'framer-motion'
import ClearIcon from '@mui/icons-material/Clear';
import { ITEMS_PER_PAGE } from '../../../constants';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { ErrorBoundary } from 'react-error-boundary';

const sortOptions=[
    {name:"Price: low to high",sort:"price",order:"asc"},
    {name:"Price: high to low",sort:"price",order:"desc"},
]

export const AdminDashBoard = () => {

    const [filters,setFilters]=useState({})
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const [sort,setSort]=useState(null)
    const [page,setPage]=useState(1)
    const products=useSelector(selectProducts)
    // Ensure products is always an array to prevent "not iterable" errors
    const safeProducts = Array.isArray(products) ? products : [];
    const dispatch=useDispatch()
    const theme=useTheme()
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const isProductFilterOpen=useSelector(selectProductIsFilterOpen)
    const totalResults=useSelector(selectProductTotalResults)
    
    const is1200=useMediaQuery(theme.breakpoints.down(1200))
    const is800=useMediaQuery(theme.breakpoints.down(800))
    const is700=useMediaQuery(theme.breakpoints.down(700))
    const is600=useMediaQuery(theme.breakpoints.down(600))
    const is488=useMediaQuery(theme.breakpoints.down(488))

    useEffect(()=>{
        setPage(1)
    },[totalResults])

    useEffect(()=>{
        const finalFilters={...filters}

        finalFilters['pagination']={page:page,limit:ITEMS_PER_PAGE}
        finalFilters['sort']=sort

        dispatch(fetchProductsAsync(finalFilters))
        
    },[filters,sort,page])

    const handleBrandFilters=(e)=>{

        const filterSet=new Set(filters.brand)

        if(e.target.checked){filterSet.add(e.target.value)}
        else{filterSet.delete(e.target.value)}

        const filterArray = Array.from(filterSet);
        setFilters({...filters,brand:filterArray})
    }

    const handleCategoryFilters=(e)=>{
        const filterSet=new Set(filters.category)

        if(e.target.checked){filterSet.add(e.target.value)}
        else{filterSet.delete(e.target.value)}

        const filterArray = Array.from(filterSet);
        setFilters({...filters,category:filterArray})
    }

    const handleProductDelete=(productId)=>{
        dispatch(deleteProductByIdAsync(productId))
    }

    const handleProductUnDelete=(productId)=>{
        dispatch(undeleteProductByIdAsync(productId))
    }

    const handleFilterClose=()=>{
        dispatch(toggleFilters())
    }

  return (
    <ErrorBoundary FallbackComponent={({ error }) => <Box color="error.main" p={2}>Error: {error.message}</Box>}>
      <Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {/* ...tabs... */}
        </Tabs>
        {tab === 0 && (
          <Box mt={3}>
            {loading ? <CircularProgress /> : !analytics ? (
              <Box p={2} textAlign="center">No analytics data available.</Box>
            ) : (
              <Grid container spacing={2}>
                {/* ...cards/charts as before... */}
              </Grid>
            )}
          </Box>
        )}
        {/* ...other tabs, wrap each in ErrorBoundary and add empty state as needed... */}
      </Box>
    </ErrorBoundary>
  )
}
