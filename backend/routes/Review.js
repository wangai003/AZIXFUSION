const express=require('express')
const reviewController=require("../controllers/Review")
const router=express.Router()


router
    .post("/",reviewController.create)
    .get('/product/:id',reviewController.getByProductId)
    .patch('/:id',reviewController.updateById)
    .delete("/:id",reviewController.deleteById)
    .get('/service/:id',reviewController.getByServiceId)
    .get('/user/:id',reviewController.getByRevieweeId)

module.exports=router