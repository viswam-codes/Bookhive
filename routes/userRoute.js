const express=require("express");
const user_route=express();
const auth=require("../middlewares/userAuth");





user_route.set("view engine","ejs");
user_route.set("views","./views/user")

const userController=require("../controller/userController")

user_route.get('/',userController.loadLandingPage);
user_route.get('/login',auth.isLogOut,userController.loadLogin);
user_route.post('/login',userController.verifyLogin);
user_route.get('/register',auth.isLogOut,userController.loadRegister);
user_route.post('/register',userController.insertUser);
user_route.get('/otpVerify',auth.isLogOut,userController.loadOTP);
user_route.post('/otpVerify',userController.verifyOTP);
user_route.post('/resendOTP',userController.resendOTP);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get("/shop_page",userController.loadShopPage);
user_route.get("/product_page",userController.loadProductPage);
user_route.get("/account",userController.loadProfile);
user_route.post("/edit_details",userController.editDetails);
user_route.post("/reset_password",userController.resetPassword);
user_route.post("/add_address",userController.addAddress);
user_route.post("/edit_address",userController.editAddress);
user_route.post("/delete_address",userController.deleteAddress);


module.exports=user_route;
