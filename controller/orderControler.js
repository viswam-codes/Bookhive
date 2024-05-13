const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart=require("../model/cartModel");
const Order=require("../model/orderModel");
const { v4: uuidv4 } = require('uuid');

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const cart = await Cart.findOne({ userId }).populate('product.productId'); // Populate the products
        
       
        if (!cart || !cart.product.length) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const orderId = uuidv4();

        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Calculate billTotal
        let billTotal = 0;
        for (const item of cart.product) {
            billTotal += item.productId.price * item.quantity;
        }

        // Fetch shipping address using addressIndex from req.body
        const { addressIndex, paymentMethod } = req.body;
        const selectedAddress = user.address[addressIndex];
        

        // Create order object
        const newOrder = new Order({
            orderId,
            user: userId,
            items: cart.product.map(item => ({
                productId: item.productId._id,
                title: item.productId.title,
                image: item.productId.image,
                productPrice: item.productId.price,
                quantity: item.quantity,
                price: item.productId.price * item.quantity,
                // Or any default status you prefer
            })),
            billTotal,
            shippingAddress: {
                houseName:selectedAddress.houseName,
                street: selectedAddress.street,
                city: selectedAddress.city,
                state: selectedAddress.state,
                country: selectedAddress.country,
                postalCode: selectedAddress.postalCode,
            },
            paymentMethod,
        });

        // Save order to the database
        await newOrder.save();

        for (const item of newOrder.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
              throw new Error(`Product with id ${item.productId} not found`);
            }
            product.stock -= item.quantity;
            await product.save();
          }

        // Clear user's cart after successful order placement
        await Cart.findOneAndDelete({ userId });

        res.status(201).json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const loadOrderView=async(req,res)=>{
    try{
        const user= await User.findById(req.session.user);
        const {id}=req.query;
        const order= await Order.findById(id);
        console.log('ooo', order);
        res.render("orderView",{user,order})
        

    }catch(error){
        console.log(error.message);
    }
}

const  cancelOrder = async (req, res) => {
    try {
        const { orderId, itemId,cancellationReason } = req.body;
        // Find the order by orderId
        const order = await Order.findById(orderId);

        // If order is not found
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Find the item within the order by itemId
        const item = order.items.find(item => item._id == itemId);

        // If item is not found
        if (!item) {
            return res.status(404).json({ message: 'Item not found in the order' });
        }

        // Update the status of the item to 'Cancelled'
        item.status = 'Cancelled';

        item.cancellationReason=cancellationReason;

        // Decrease the item price from the billTotal
        order.billTotal -= item.productPrice * item.quantity;


         // Check if all items in the order are cancelled
         const allItemsCancelled = order.items.every(item => item.status === 'Cancelled');

         // If all items are cancelled, update the order status to 'Cancelled'
         if (allItemsCancelled) {
             order.orderStatus = 'Cancelled';
         }

        // Save the updated order
        await order.save();

        const product = await Product.findById(item.productId);
        if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }
          product.stock += item.quantity;
          await product.save();

        res.status(200).json({ message: 'Order item cancelled successfully', order });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'An error occurred while cancelling the order item' });
    }
}
module.exports={
    placeOrder,
    loadOrderView,
    cancelOrder
}