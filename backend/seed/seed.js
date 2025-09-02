const {seedBrand}=require("./Brand")
const {seedCategory}=require("./Category")
const {seedProduct}=require("./Product")
const {seedUser}=require("./User")
const {seedAddress}=require("./Address")
const {seedWishlist}=require("./Wishlist")
const {seedCart}=require("./Cart")
const {seedReview}=require("./Review")
const {seedOrder}=require("./Order")
const {connectToDatabase}=require("../database/db")

const seedData=async()=>{
    try {
        await connectToDatabase()
        console.log('Seed [started] please wait..');
        await seedBrand()
        await seedCategory()
        await seedProduct()
        await seedUser()
        await seedAddress()
        await seedWishlist()
        await seedCart()
        await seedReview()
        await seedOrder()

        console.log('Seed completed..');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
}

seedData()