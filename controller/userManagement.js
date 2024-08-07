const User=require("../model/userModel");
const Refferal=require("../model/referalModel");

const loadUserList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
        const perPage = 10; // Number of users per page

        // Fetch total number of users
        const totalUsersCount = await User.countDocuments({ is_admin: 0 });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsersCount / perPage);

        // Calculate the number of documents to skip based on the page number
        const skip = (page - 1) * perPage;

        // Fetch users with pagination
        const users = await User.find({ is_admin: 0 }).skip(skip).limit(perPage);

        res.render("customer", { users, currentPage: page, totalPages });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("An error occurred while loading user list.");
    }
};

const blockUnblockUser=async(req,res)=>{
    const userId=req.params.userId;
    console.log(userId,"jilll")
   try{
   const user= await User.findById(userId);
   if(!user){
    return res.status(404).json({sucess:false,error:"User not found"})
   }
   
   user.is_verified=!user.is_verified;
  
   await user.save();
   res.status(200).json({success:true,message:"User blocked succesfully",user,is_verified:user.is_verified});

   

   }catch(error){
    res.status(500).json({ success: false, error: 'Error blocking user' });
   }
}


const setReferralAmounts=async(req,res)=>{
    try{
        const {newUserAmount,userAmount}=req.body;
        console.log(newUserAmount,"new User Amount");
        console.log(userAmount,'User Amount');
        if (!newUserAmount || !userAmount || newUserAmount <= 0 || userAmount <= 0) {
            return res.status(400).json({ message: 'Both amounts are required and should be greater than 0.' });
        }

        let referral = await Refferal.findOne();

        if (referral) {
            // Update the existing referral document
            referral.newUserAmount = newUserAmount;
            referral.userAmount = userAmount;
            await referral.save();
            res.json({ message: 'Referral amounts updated successfully!' });
        } else {
            // Create a new referral document
            referral = new Refferal({
                newUserAmount,
                userAmount
            });
            await referral.save();
            res.json({ message: 'Referral amounts set successfully!' });
        }



    }catch(error){
        console.log(error.message);
    }
}




module.exports={
    loadUserList,
    blockUnblockUser,
    setReferralAmounts
}