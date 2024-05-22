const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category=require('../model/categoryModel');
const Coupon=require('../model/coupenModel')
const Cart=require("../model/cartModel");

const loadCheckout=async(req,res)=>{
    try{
        const userId=req.session.user;
        const user=await User.findById(userId);
        const cart=await Cart.findOne({userId:userId}).populate("product.productId");
        const coupon=await Coupon.find({status:"active"})
        
        let cartCount=0;
        if(cart){
           cartCount=cart.product.length;
        }
        res.render("checkout",{user,cart,cartCount,coupon})

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

const applyCoupon=async(req,res)=>{
    try{

        const {couponId,subTotal}=req.query;
        const coupon=await Coupon.findById(couponId);

        if(!coupon){
            return res.status(404).json({success:false,message:"Coupon not found"})
        }

        if(coupon.status!=="active"){
            return res.status(400).json({success:false,message:"Coupon is inactive"});
        }

        const currentDate= new Date();

        if (currentDate < coupon.startDate) {
            return res.status(400).json({ success: false, message: 'Coupon is not yet valid.' });
        }


        if(currentDate>coupon.endDate){
            return res.status(400).json({success:false,message:"Coupon has expired"})
        }

        if(parseFloat(subTotal) < coupon.minimumamount){
           
            return res.status(400).json({ success: false, message: `Minimum order amount should be ${coupon.minimumamount}` });
        }

        const discountAmount = (parseInt(subTotal) * coupon.discountamount/100).toFixed(2);
        const differenceAmount=(parseInt(subTotal)- discountAmount)

        return res.status(200).json({
            success:true,
            differenceAmount,
            discountAmount,
            coupon
        })
        


    }catch(error){
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


module.exports={
    loadCheckout,
    confirmQuantity,
    applyCoupon
}