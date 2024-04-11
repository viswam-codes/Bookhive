const User=require("../model/userModel");
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

const loadHome=async(req,res)=>{
    try{
        res.render("home");

    }catch(error){
        console.log(error.message)
    }
}

module.exports={
    loadLogin,
    verifyLogin,
    loadHome
}