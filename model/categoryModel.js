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
    }
})

module.exports=mongoose.model("Categories",categorySchema);