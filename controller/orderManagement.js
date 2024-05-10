const Order = require("../model/orderModel");
const User=require("../model/userModel");


const loadOrderList=async(req,res)=>{
    try{
        
        const order= await Order.find({});
        res.render("order",{order});
        

    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    loadOrderList
}