import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate} from 'react-router-dom'
import { addProductAsync, resetProductAddStatus, selectProductAddStatus,updateProductByIdAsync } from '../../products/ProductSlice'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useForm } from "react-hook-form"
import { 
  selectBrands,
  fetchAllBrandsAsync 
} from '../../brands/BrandSlice'
import { 
  fetchCategories,
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  selectCategories,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory
} from '../../categories/CategoriesSlice';
import { toast } from 'react-toastify'

export const AddProduct = () => {

    const {register,handleSubmit,reset,formState: { errors }, watch, setValue } = useForm()

    const dispatch=useDispatch()
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const mainCategories=useSelector(selectMainCategories)
    const subcategoriesByParent=useSelector(selectSubcategoriesByParent)
    const elementsBySubcategory=useSelector(selectElementsBySubcategory)
    const productAddStatus=useSelector(selectProductAddStatus)
    const navigate=useNavigate()
    const theme=useTheme()
    const is1100=useMediaQuery(theme.breakpoints.down(1100))
    const is480=useMediaQuery(theme.breakpoints.down(480))

    // Watch category and subcategory for cascading updates
    const watchedCategory = watch("category")
    const watchedSubcategory = watch("subcategory")

    useEffect(() => {
        if(productAddStatus==='fullfilled'){
            reset()
            toast.success("New product added")
            navigate("/admin/dashboard")
        }
        else if(productAddStatus==='rejected'){
            toast.error("Error adding product, please try again later")
        }
    },[productAddStatus])

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchMainCategories());
        dispatch(fetchAllBrandsAsync());
    }, [dispatch]);

    // Watch for category changes to fetch subcategories
    useEffect(() => {
      if (watchedCategory) {
        dispatch(fetchSubcategories(watchedCategory));
      }
    }, [watchedCategory, dispatch]);

    // Watch for subcategory changes to fetch elements
    useEffect(() => {
      if (watchedSubcategory) {
        dispatch(fetchElements(watchedSubcategory));
      }
    }, [watchedSubcategory, dispatch]);

    const handleAddProduct=(data)=>{
        const newProduct={...data,images:[data.image0,data.image1,data.image2,data.image3]}
        delete newProduct.image0
        delete newProduct.image1
        delete newProduct.image2
        delete newProduct.image3

        dispatch(addProductAsync(newProduct))
    }

    
  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} >
        

        <Stack width={is1100?"100%":"60rem"} rowGap={4} mt={is480?4:6} mb={6} component={'form'} noValidate onSubmit={handleSubmit(handleAddProduct)}> 
            
            {/* feild area */}
            <Stack rowGap={3}>
                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Title</Typography>
                    <TextField {...register("title",{required:'Title is required'})}/>
                </Stack> 

                <Stack flexDirection={'row'} gap={2}>

                    <FormControl fullWidth>
                        <InputLabel id="brand-selection">Brand</InputLabel>
                        <Select {...register("brand",{required:"Brand is required"})} labelId="brand-selection" label="Brand">
                            
                            {
                                brands.map((brand)=>(
                                    <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
                                ))
                            }

                        </Select>
                    </FormControl>


                    <FormControl fullWidth>
                        <InputLabel id="category-selection">Main Category</InputLabel>
                        <Select {...register("category",{required:"Category is required"})} labelId="category-selection" label="Main Category">
                            
                            {
                                mainCategories && mainCategories.map((category)=>(
                                    <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                                ))
                            }

                        </Select>
                    </FormControl>

                </Stack>

                <Stack flexDirection={'row'} gap={2}>

                    <FormControl fullWidth>
                        <InputLabel id="subcategory-selection">Subcategory</InputLabel>
                        <Select 
                            {...register("subcategory")} 
                            labelId="subcategory-selection" 
                            label="Subcategory"
                            disabled={!watchedCategory}
                        >
                            <MenuItem value="">
                                <em>Select a main category first</em>
                            </MenuItem>
                            {watchedCategory && subcategoriesByParent[watchedCategory] && 
                                subcategoriesByParent[watchedCategory].map((subcat) => (
                                    <MenuItem key={subcat._id} value={subcat._id}>
                                        {subcat.name}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="element-selection">Element</InputLabel>
                        <Select 
                            {...register("element")} 
                            labelId="element-selection" 
                            label="Element"
                            disabled={!watchedSubcategory}
                        >
                            <MenuItem value="">
                                <em>Select a subcategory first</em>
                            </MenuItem>
                            {watchedSubcategory && elementsBySubcategory[watchedSubcategory] && 
                                elementsBySubcategory[watchedSubcategory].map((elem) => (
                                    <MenuItem key={elem._id} value={elem._id}>
                                        {elem.name}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                </Stack>

                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Description</Typography>
                    <TextField {...register("description",{required:'Description is required'})} multiline rows={4}/>
                </Stack>

                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Price</Typography>
                    <TextField {...register("price",{required:'Price is required'})} type="number" />
                </Stack>

                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Stock Quantity</Typography>
                    <TextField {...register("stockQuantity",{required:'Stock quantity is required'})} type="number" />
                </Stack>

                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Thumbnail Image URL</Typography>
                    <TextField {...register("image0",{required:'Thumbnail image is required'})} />
                </Stack>

                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Additional Image URLs</Typography>
                    <TextField {...register("image1")} placeholder="Image 1 (optional)" />
                    <TextField {...register("image2")} placeholder="Image 2 (optional)" />
                    <TextField {...register("image3")} placeholder="Image 3 (optional)" />
                </Stack>

                <Button type="submit" variant="contained" size="large">
                    Add Product
                </Button>
            </Stack>
        </Stack>
    </Stack>
  )
}
