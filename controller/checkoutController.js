const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category=require('../model/categoryModel');
const Cart=require("../model/cartModel");

const loadCheckout=async(req,res)=>{
    try{
        const userId=req.session.user;
        const user=await User.findById(userId);
        const cart=await Cart.findOne({userId:userId}).populate("product.productId");
        res.render("checkout",{user,cart})

    }catch(error){
        console.log(error.message);
    }
}

const confirmQuantity=async(req,res)=>{
    try{
        const userId=req.session.user;
        const cart=await Cart.findOne({userId});

        for(const item of cart.product){
            const product= await Product.findById(item.productId);

            //check of product exists
            if(!product){
                return res.json({success:false,message:"product not found"})
            }

            //check quantity 
            if (item.quantity <= 0 || item.quantity>product.stock){
                return res.json({success:false,message:"Quantity is invalid or out of stock"})
            }

            
        }
        //if all the checks passed
        return res.json({success:true}) 

    }catch(error){
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}



module.exports={
    loadCheckout,
    confirmQuantity
}