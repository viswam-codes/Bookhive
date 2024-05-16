const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");
const { RAZOR_PAY_KEY, RAZOR_PAY_SECRET } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZOR_PAY_KEY,
  key_secret: RAZOR_PAY_SECRET,
});

const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const cart = await Cart.findOne({ userId }).populate("product.productId"); // Populate the products

    if (!cart || !cart.product.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderId = uuidv4();

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Calculate billTotal
    let billTotal = 0;
    for (const item of cart.product) {
      billTotal += item.productId.price * item.quantity;
    }

    // Fetch shipping address using addressIndex from req.body
    const { addressIndex, paymentMethod, totalAmount } = req.body;
    const selectedAddress = user.address[addressIndex];

    if (paymentMethod == "razorpay") {
      console.log("online payment");
      var options = {
        amount: parseFloat(totalAmount) * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: `reciept_${cart._id}`,
      };
      razorpayInstance.orders.create(options, function (err, order) {
        console.log("order", order);
        console.log("options", options);
        if (!err) {
          res.status(200).json({
            success: true,
            msg: "Order Created",
            order_id: order.id,
            amount: totalAmount * 100,
            key_id: process.env.RAZOR_PAY_KEY,
            product_name: "product",
            description: "req.body.description",
            contact: "8567345632",
            name: "Sandeep Sharma",
            email: "sandeep@gmail.com",
          });
        }else{
            console.log('error --->',err);
        
        }
      });
    }else if(paymentMethod=="Cash On Delivery"){

        const newOrder = new Order({
            orderId,
            user: userId,
            items: cart.product.map((item) => ({
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
              houseName: selectedAddress.houseName,
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
      
          res
            .status(201)
            .json({ success: true, message: "Order placed successfully" });
        
    }

    // Create order object
   
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const loadOrderView = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findById(userId);
    const { id } = req.query;
    const order = await Order.findById(id);
    const cart = await Cart.findOne({ userId });
    let cartCount = 0;
    if (cart) {
      cartCount = cart.product.length;
    }
    res.render("orderView", { user, order, cartCount });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId, itemId, cancellationReason } = req.body;
    // Find the order by orderId
    const order = await Order.findById(orderId);

    // If order is not found
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the item within the order by itemId
    const item = order.items.find((item) => item._id == itemId);

    // If item is not found
    if (!item) {
      return res.status(404).json({ message: "Item not found in the order" });
    }

    // Update the status of the item to 'Cancelled'
    item.status = "Cancelled";

    item.cancellationReason = cancellationReason;

    // Decrease the item price from the billTotal
    order.billTotal -= item.productPrice * item.quantity;

    // Check if all items in the order are cancelled
    const allItemsCancelled = order.items.every(
      (item) => item.status === "Cancelled"
    );

    // If all items are cancelled, update the order status to 'Cancelled'
    if (allItemsCancelled) {
      order.orderStatus = "Cancelled";
    }

    // Save the updated order
    await order.save();

    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product with id ${item.productId} not found`);
    }
    product.stock += item.quantity;
    await product.save();

    res
      .status(200)
      .json({ message: "Order item cancelled successfully", order });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while cancelling the order item" });
  }
};
module.exports = {
  placeOrder,
  loadOrderView,
  cancelOrder,
};
