const mongoose=require("mongoose");

const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isListed : {
        type : String,
        enum:["Active","Inactive"],
        default :"Active"
    },
    createdOn:{
        type:Date,
        required:true
    },
    deleted:{
        type:Boolean,
        required:true,
        default:false
    },
    discount:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model("Categories",categorySchema);