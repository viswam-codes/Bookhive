const express=require("express");
const admin_route=express();
const adminController=require("../controller/adminController");
const userManagement=require("../controller/userManagement");
const categoryManagement=require('../controller/categoryManagement');


admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin");

admin_route.get("/",adminController.loadLogin)
admin_route.post("/",adminController.verifyLogin)
admin_route.get("/home",adminController.loadHome);
admin_route.get("/user_management",userManagement.loadUserList);
admin_route.post("/user_management/:userId",userManagement.blockUnblockUser);
admin_route.get("/category_management",categoryManagement.listCategory);
admin_route.post("/category_management",categoryManagement.addCategory);

module.exports=admin_route

