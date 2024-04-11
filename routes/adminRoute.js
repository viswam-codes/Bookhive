const express=require("express");
const admin_route=express();
const adminController=require("../controller/adminController");
const userManagement=require("../controller/userManagement")


admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin");

admin_route.get("/",adminController.loadLogin)
admin_route.post("/",adminController.verifyLogin)
admin_route.get("/home",adminController.loadHome);
admin_route.get("/user_management",userManagement.loadUserList);
admin_route.post("/user_management/:userId",userManagement.blockUnblockUser);

module.exports=admin_route

