const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category=require('../model/categoryModel');
const Cart=require("../model/cartModel");

const loadCheckout=async(req,res)=>{
    try{
        const userId=req.session.user;
        const user=await User.findById(userId);
        const cart= await Cart.findOne({userId});
        res.render("checkout",{user,cart})

    }catch(error){
        console.log(error.message);
    }
}

const checkQuantity = async (req, res) => {
    try {
        const userId = req.session.user;
        const cart = await Cart.findOne({ userId });
        // Check if the cart exists and is not empty
        if (!cart || cart.product.length === 0) {
            return res.json({ success: false, message: 'Cart is empty' });
        }

        // Iterate through each product in the cart
        for (const item of cart.product) {
            const product = await Product.findById(item.productId);

            // Check if the product exists
            if (!product) {
                return res.json({ success: false, message: 'Product not found' });
            }

            // Check if the quantity is greater than zero and less than or equal to the stock
            if (item.quantity <= 0 || item.quantity > product.stock) {
                return res.json({ success: false, message: 'Quantity is invalid or out of stock' });
            }
        }

        // If all checks pass, return success
        return res.json({ success: true, message: 'Updated to checkout' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports={
    loadCheckout,
    checkQuantity
}