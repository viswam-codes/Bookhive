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
    createdOn:{
        type:Date,
        required:true
    }
})

module.exports=mongoose.model("Categories",categorySchema);