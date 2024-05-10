const express=require("express");
const admin_route=express();
const adminController=require("../controller/adminController");
const userManagement=require("../controller/userManagement");
const categoryManagement=require('../controller/categoryManagement');
const productManagement=require('../controller/productManagement');
const orderManagement=require('../controller/orderManagement');
const auth=require("../middlewares/adminAuth")


admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin");


admin_route.get("/",auth.isLogOut,adminController.loadLogin);
admin_route.post("/",adminController.verifyLogin);
admin_route.get("/home",auth.isLogin,adminController.loadHome);

//----user Management
admin_route.get("/user_management",auth.isLogin,userManagement.loadUserList);
admin_route.post("/user_management/:userId",userManagement.blockUnblockUser);

//---category Management
admin_route.get("/category_management",auth.isLogin,categoryManagement.loadCategory);
admin_route.post("/category_management",categoryManagement.addCategory);
admin_route.post("/category_management/:id",categoryManagement.updateCategory);
admin_route.post("/delete_category/:id",categoryManagement.deleteCatgory);

//--product Management
admin_route.get("/product_management",auth.isLogin,productManagement.loadProduct);
admin_route.get("/add_product",auth.isLogin,productManagement.loadAddProduct);
admin_route.post("/add_product",productManagement.addProduct);
admin_route.get("/editProduct",auth.isLogin,productManagement.loadEditProduct);
admin_route.post("/editProduct",productManagement.updateProduct);
admin_route.post("/deleteImage",productManagement.deleteImage);
admin_route.post("/deleteProduct/:id",productManagement.deleteProduct)


//--order management

admin_route.get("/order_management",auth.isLogin,orderManagement.loadOrderList)


module.exports=admin_route

