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
user_route.get("/product_page",userController.loadProductPage)


module.exports=user_route;
