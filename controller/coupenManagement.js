const Coupon = require("../model/coupenModel");



const loadCoupenList = async(req,res)=>{
    try{
        const coupons=await Coupon.find({}).sort({createdAt:-1})
        res.render("coupen",{coupons});

    }catch(error){
        console.log(error.message)
    }
}

const addCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, discountAmount, startDate, endDate, status, minimumAmount } = req.body;
    
        // Check if a coupon with the same coupon code already exists
        const existingCouponCode = await Coupon.findOne({ couponcode:couponCode });
        if (existingCouponCode) {
            
            return res.json({success:false, message: "Existing coupon" });
        }

        // Check if a coupon with the same coupon name and discount amount already exists
        const existingCouponNameAndAmount = await Coupon.findOne({ discountamount: discountAmount });
        if (existingCouponNameAndAmount) {
            
            return res.json({ success:false, message: "Existing Discount" });
        }

        // Create a new coupon
        const newCoupon = new Coupon({
            couponname:couponName,
            couponcode:couponCode,
            discountamount:discountAmount,
            startDate,
            endDate,
            status,
            minimumamount:minimumAmount
        });

        // Save the coupon to the database
        await newCoupon.save();

        // Respond with success message
        res.status(201).json({ success:true, message: "Coupon created successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error" });
    }
}

const couponStatusChange=async(req,res) =>{
    try{
     const {couponId}=req.query;

     const coupon=await Coupon.findById(couponId);
     coupon.status = coupon.status === 'active' ? 'inactive' : 'active'; 
     await coupon.save();
     res.status(200).json({success:true,message:"status changed succesfully"})
    }catch(error){
        console.log(error.message)
        res.status(500).send('Server Error');
    }
}

const deleteCoupon=async(req,res)=>{
    try{

        const {couponId} = req.query;

        await Coupon.findByIdAndDelete(couponId);
        res.status(200).send('Coupon deleted');
        
    }catch(error){
        console.log(error.message);
        res.status(500).send('Server Error');

    }
}
module.exports={
    loadCoupenList,
    addCoupon,
    couponStatusChange,
    deleteCoupon
}