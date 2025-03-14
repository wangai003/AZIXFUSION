const mongoose=require("mongoose")
const {Schema}=mongoose

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true
    },
    walletSecret: {
        type: String,
        select: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model("User",userSchema)