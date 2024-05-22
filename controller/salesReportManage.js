const Order=require("../model/orderModel");


const loadSalesReport=async(req,res)=>{
    try{
        const order=await Order.find({ orderStatus:"Delivered"});

        res.render("salesReport",{order})

    }catch(error){
        console.log(error);
    }
}



module.exports={
    loadSalesReport
}