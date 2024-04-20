const isLogOut=async(req,res,next)=>{
    try{
        if(req.session.user){
            res.redirect("/");
        }
        else{
            next();
            
        }

    }catch(error){
        console.log(error.message);
    }

}


const isLogin=async(req,res,next)=>{
    try{

    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    isLogOut,
    isLogin
}