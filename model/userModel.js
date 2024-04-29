const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    is_admin:{
        type:Number,
        required:true,
    },
    is_verified:{
        type:Boolean,
        default:true
    },
    address:[{
        houseName: {
            type: String,
            required: true
        },
        street: {
            type: String,
            requried: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        type: {
            type: String,
        }
    }]

});

module.exports=mongoose.model("User",userSchema);