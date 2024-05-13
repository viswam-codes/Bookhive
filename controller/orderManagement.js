const Order = require("../model/orderModel");
const User=require("../model/userModel");
const Product=require("../model/productModel");


const loadOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage=10;

        const totalOrderCount= await Order.countDocuments({});
        const totalPages = Math.ceil(totalOrderCount / perPage);

        const skip = (page - 1) * perPage;
        
        const orders = await Order.find({}).populate('user').skip(skip).limit(perPage);
        res.render("order", { orders,currentPage: page, totalPages   });
    } catch (error) {
        console.log(error.message);
    }
}

const changeOrderStatus = async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body;
       console.log(orderStatus);
        // Find the order by orderId
        const order = await Order.findById(orderId);

        // If order is not found
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order status
        order.orderStatus = orderStatus;

      
        if (orderStatus === "Shipped") {
            order.items.forEach(item => {
                item.status = "Shipped";
            });
        }

        if (orderStatus === "Delivered") {
            order.items.forEach(item => {
                item.status = "Delivered";
            });
        }

        // Save the updated order
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating order status' });
    }
};

const loadOrderDetails=async(req,res)=>{
    try{
        const orderId=req.query.id;
        const order= await Order.findById(orderId);
        res.render("orderDetails",{order})

    }catch(error){
        console.log(error.message)
    }
}


module.exports={
    loadOrderList,
    changeOrderStatus,
    loadOrderDetails
}