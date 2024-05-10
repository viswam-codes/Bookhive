const express=require("express");
const user_route=express();
const auth=require("../middlewares/userAuth");





user_route.set("view engine","ejs");
user_route.set("views","./views/user")

const userController=require("../controller/userController")
const checkoutController=require("../controller/checkoutController");
const orderController=require("../controller/orderControler");

user_route.get('/',userController.loadLandingPage);
user_route.get('/login',auth.isLogOut,userController.loadLogin);
user_route.get('/forgotPassword',auth.isLogOut,userController.loadForgotPassword);
user_route.post('/login',userController.verifyLogin);
user_route.get('/register',auth.isLogOut,userController.loadRegister);
user_route.post('/register',userController.insertUser);
user_route.get('/otpVerify',auth.isLogOut,userController.loadOTP);
user_route.post('/otpVerify',userController.verifyOTP);
user_route.post('/resendOTP',userController.resendOTP);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get("/shop_page",userController.loadShopPage);
user_route.get("/product_page",auth.isLogin,userController.loadProductPage);
user_route.post("/otpToForgot",userController.otpSendForgot)
user_route.get("/verify_otp_forgot",auth.isLogOut,userController.loadForgotOtpPage);
user_route.post("/otpVerify_forgot",userController.otpVerifyForgot);
user_route.post("/resetForgot_Password",userController.resetForgotPassword);
user_route.post("/removeProduct",userController.removeFromCart);

//-----User Profile 
user_route.get("/account",auth.isLogin,userController.loadProfile);
user_route.post("/edit_details",userController.editDetails);
user_route.post("/reset_password",userController.resetPassword);
user_route.post("/add_address",userController.addAddress);
user_route.post("/edit_address",userController.editAddress);
user_route.post("/delete_address",userController.deleteAddress);

//----cart Mangement
user_route.get("/cart",auth.isLogin,userController.loadCart);
user_route.post("/addToCart",userController.addToCart);
user_route.post("/updateQuantity/:id",userController.updateQuantity);
user_route.post("/checkQuantity",auth.isLogin,userController.checkQuantity);



//---checkout Management
user_route.get("/checkout",auth.isLogin,checkoutController.loadCheckout);
user_route.post("/confirmQuantity",auth.isLogin,checkoutController.confirmQuantity);


//---order Management
user_route.post("/placeOrder",auth.isLogin,orderController.placeOrder);
user_route.get("/orderView",auth.isLogin,orderController.loadOrderView);
user_route.post("/cancelOrder",auth.isLogin,orderController.cancelOrder);


module.exports=user_route;
