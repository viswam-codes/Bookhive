const User=require("../model/userModel");

const loadUserList=async(req,res)=>{
    try{
        const userData=await User.find({is_admin:0})
        res.render("customer",{users:userData});

    }catch(error){
        console.log(error.message)
    }
}

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




module.exports={
    loadUserList,
    blockUnblockUser
}