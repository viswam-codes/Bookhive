const mongoose=require("mongoose");

const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isListed : {
        type : Boolean,
        default : true
    },
    craatedOn:{
        type:Date,
        required:true
    }
})