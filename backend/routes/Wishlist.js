const express=require("express")
const wishlistController=require("../controllers/Wishlist")
const router=express.Router()


router
    .post("/",wishlistController.create)
    .get("/user/:id",wishlistController.getByUserId)
    .delete("/:id",wishlistController.deleteById)

module.exports=router