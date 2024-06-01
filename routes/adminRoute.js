const express=require("express");
const admin_route=express();
const adminController=require("../controller/adminController");
const userManagement=require("../controller/userManagement");
const categoryManagement=require('../controller/categoryManagement');
const productManagement=require('../controller/productManagement');
const orderManagement=require('../controller/orderManagement');
const coupenManagement= require('../controller/coupenManagement')
const salesReport=require('../controller/salesReportManage');
const auth=require("../middlewares/adminAuth")


admin_route.set("view engine","ejs");
admin_route.set("views","./views/admin");


admin_route.get("/",auth.isLogOut,adminController.loadLogin);
admin_route.post("/",adminController.verifyLogin);
admin_route.get("/home",auth.isLogin,adminController.loadHome);
admin_route.get("/filter-graph",auth.isLogin,adminController.filterGraph);

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

admin_route.get("/order_management",auth.isLogin,orderManagement.loadOrderList);
admin_route.put("/changeStatus",auth.isLogin,orderManagement.changeOrderStatus);
admin_route.get("/orderDetails",auth.isLogin,orderManagement.loadOrderDetails);


//---coupen management

admin_route.get("/coupen_management",auth.isLogin,coupenManagement.loadCoupenList);
admin_route.post("/add_coupon",auth.isLogin,coupenManagement.addCoupon);
admin_route.put("/couponStatus",auth.isLogin,coupenManagement.couponStatusChange);
admin_route.delete("/coupon_delete",auth.isLogin,coupenManagement.deleteCoupon);



//---sales report
admin_route.get("/sales_report",auth.isLogin,salesReport.loadSalesReport);
admin_route.get("/filter_Report",auth.isLogin,salesReport.filterSalesReport);
admin_route.get("/download_pdf",auth.isLogin,salesReport.downloadPDF);

module.exports=admin_route

