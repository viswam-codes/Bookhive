const User=require("../model/userModel");
const Order=require("../model/orderModel");
const Product=require("../model/productModel");
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');

const bcrypt=require("bcrypt");

const securePassword= async(password)=>{
    try{
        const passwordHash= await bcrypt.hash(password,10);
        return passwordHash;

    }catch(error){
        console.log(error.message)
    }
}

const loadLogin=async(req,res)=>{
    try{
        res.render("login")

    }catch(error){
        console.log(error)
        res.status(500).send("Internet Server Error");
    }
}

const verifyLogin=async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const userData=await User.findOne({email:email});
        if(userData){
            const  passwordMatch= await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_admin===0){ 
                     return res.render("login",{message:"Email and password are incorrect"})

                }else{
                    req.session.user_id=userData._id;
                    res.redirect('/admin/home')
                }
            }else{
                res.render("login",{message:"Email and password are notcorrect"})
            }
        }else{
            res.render("login",{message:"Email and password are incorrect"})
        }

    }catch(error){
        console.log(error.message)
    }
}

const loadHome = async (req, res) => {
    try {
        // Calculate Revenue for Delivered Orders
        const totalRevenueResult = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: "$billTotal" } } },
            { $project: { _id: 0, totalRevenue: 1 } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

        // Calculate Orders
        const deliveredOrders = await Order.countDocuments({ orderStatus: "Delivered" });

        // Calculate Products
        const totalProducts = await Product.countDocuments({ isDeleted: false });

        // Calculate Total Categories
        const totalCategories = await Product.distinct('category', { isDeleted: false });

        // Calculate Monthly Earnings for Delivered Orders
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyEarningsResult = await Order.aggregate([
            { $match: { orderStatus: 'Delivered', orderDate: { $gte: startOfMonth } } },
            { $group: { _id: null, monthlyEarnings: { $sum: "$billTotal" } } },
            { $project: { _id: 0, monthlyEarnings: 1 } }
        ]);
        const monthlyEarnings = monthlyEarningsResult[0]?.monthlyEarnings || 0;

        // Find Top 10 Products
        const topProducts = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $unwind: "$items" },
            { $group: { _id: "$items.productId", totalOrders: { $sum: "$items.quantity" } } },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: "$product" },
            { $project: { _id: 1, product: 1, totalOrders: 1 } }
        ]);

        // Find Top Categories
        const topCategories = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } }, // Ensure status matching is case-sensitive
            { $unwind: "$items" }, // Split array of items into separate documents
            { 
                $lookup: { 
                    from: 'products', // Ensure this matches the actual collection name in your DB
                    localField: 'items.productId', 
                    foreignField: '_id', 
                    as: 'productInfo' 
                } 
            }, // Lookup product details
            { $unwind: "$productInfo" }, // Unwind the productInfo array
            { $group: { _id: "$productInfo.category", totalRevenue: { $sum: "$items.price" } } }, // Group by category and sum the revenue
            { $sort: { totalRevenue: -1 } }, // Sort by totalRevenue in descending order
            { $limit: 10 } // Limit to top 10 categories
        ]);

        console.log("totalRevenue",totalRevenue);
        console.log("deliveredOrders",deliveredOrders);
        console.log("totalProducts",totalProducts);
        console.log("monthlyEarnings",monthlyEarnings);
        console.log("topProducts",topProducts);
        console.log("topCategories".topCategories);

        res.render("home", {
            totalRevenue,
            deliveredOrders,
            totalProducts,
            totalCategories,
            monthlyEarnings,
            topProducts,
            topCategories
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

const filterGraph = async (req, res) => {
    try {
        const { filter, startDate, endDate } = req.query;
        console.log("filter",filter);
        let matchCriteria = { orderStatus: 'Delivered' }; // Filtering only delivered orders

        switch (filter) {
            case 'weekly':
                matchCriteria.orderDate = {
                    $gte: startOfWeek(new Date()),
                    $lte: endOfWeek(new Date())
                };
                break;
            case 'monthly':
                matchCriteria.orderDate = {
                    $gte: startOfMonth(new Date()),
                    $lte: endOfMonth(new Date())
                };
                break;
            case 'yearly':
                matchCriteria.orderDate = {
                    $gte: startOfYear(new Date()),
                    $lte: endOfYear(new Date())
                };
                break;
            case 'custom':
                if (startDate && endDate) {
                    matchCriteria.orderDate = {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    };
                } else {
                    return res.status(400).json({ error: 'Invalid date range' });
                }
                break;
            default:
                return res.status(400).json({ error: 'Invalid filter option' });
        }

        const orders = await Order.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: filter === 'yearly' ? "%Y" : filter === 'monthly' ? "%Y-%m" : "%Y-%m-%d",
                            date: "$orderDate"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const labels = orders.map(order => order._id);
        const data = orders.map(order => order.count);

        res.json({ labels, data });
    } catch (error) {
        console.log("Failed to filter graph", error.message);
        res.status(500).json({ error: "Failed to filter graph" });
    }
};


module.exports={
    loadLogin,
    verifyLogin,
    loadHome,
    filterGraph
}