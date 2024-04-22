const express=require("express");
const admin_route=express();
const adminController=require("../controller/adminController");
const userManagement=require("../controller/userManagement");
const categoryManagement=require('../controller/categoryManagement');
const productManagement=require('../controller/productManagement');


admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin");


admin_route.get("/",adminController.loadLogin);
admin_route.post("/",adminController.verifyLogin);
admin_route.get("/home",adminController.loadHome);

//----user Management
admin_route.get("/user_management",userManagement.loadUserList);
admin_route.post("/user_management/:userId",userManagement.blockUnblockUser);

//---category Management
admin_route.get("/category_management",categoryManagement.loadCategory);
admin_route.post("/category_management",categoryManagement.addCategory);
admin_route.post("/category_management/:id",categoryManagement.updateCategory);
admin_route.post("/delete_category/:id",categoryManagement.deleteCatgory);

//--product Management
admin_route.get("/product_management",productManagement.loadProduct);
admin_route.get("/add_product",productManagement.loadAddProduct);
admin_route.post("/add-product",productManagement.addProduct);
admin_route.get("/editProduct",productManagement.loadEditProduct);
admin_route.post("/editProduct",productManagement.updateProduct);


module.exports=admin_route

