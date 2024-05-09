const User = require("../model/userModel");
// const Product = require("../model/productModel");
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
        console.log("new order",newOrder);

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
        const {id}=req.query.id;
        const order= await Order.findById(id);
        res.render("orderView",{user,order})
        

    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    placeOrder,
    loadOrderView
}