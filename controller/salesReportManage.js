const { now } = require("mongoose");
const Order=require("../model/orderModel");


const loadSalesReport=async(req,res)=>{
    try{
        const deliveredOrders=await Order.find({ orderStatus:"Delivered"}).populate('user').populate('items.productId').populate('couponId');;

        res.render("salesReport",{order:deliveredOrders})

    }catch(error){
        console.log(error);
    }
}

const filterSalesReport=async(req,res)=>{
    try{
        console.log("reached here")
    const {filterType,startDate,endDate}=req.query;

    let filterCondition={orderStatus:"Delivered"};

    if(filterType ==="daily"){
        const today= new Date(now.setHours(0,0,0,0));
        filterCondition.orderDate={$gte:today};

    }else if (filterType==="weekly"){
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            filterCondition.orderDate = { $gte: startOfWeek };
    }else if(filterType==="yearly"){
        const startOfYear = new Date(now.getFullYear(), 0, 1);
            filterCondition.orderDate = { $gte: startOfYear };

    }else if(filterType==="monthly"){
        const startOfMonth = new Date(now.getFullYear(),now.getMonth(),1);
        filterCondition.orderDate = { $gte: startOfMonth };

    }else if(filterType ==="custom" && startDate && endDate){
        filterCondition={
            orderDate:{
                $gte:new Date(startDate),
                $lte:new Date(endDate)
            }
        };
    }


    const deliveredOrders= await Order.find(filterCondition)
    .populate('user')
    .populate('items.productId')
    .populate('couponId')

    console.log(deliveredOrders);

   const totalDiscount = deliveredOrders.reduce((acc, order) => acc + (order.couponAmount || 0), 0);
   const totalSalesAmount = deliveredOrders.reduce((acc, order) => acc + order.billTotal, 0);
   const salesCount = deliveredOrders.length;

   res.json({ orders: deliveredOrders, totalDiscount, totalSalesAmount, salesCount });
   
    }catch(error){
        console.log(error.message);
    }
}



module.exports={
    loadSalesReport,
    filterSalesReport
}