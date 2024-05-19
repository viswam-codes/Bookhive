const mongoose=require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    image: [{
        type: String,
        required: true
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    stock:{
        type:Number,
        required:true
    },
    isListed:{
        type:String,
        enum:["Active","Inactive"],
        default:"Active"
    },
    discountPrice:{
        type:Number,
        default:0,
        min:0
    }
});



module.exports = mongoose.model("Product", productSchema);