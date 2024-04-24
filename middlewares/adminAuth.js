const isLogOut=async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect("/admin/home")
        }else{
            next();
        }

    }catch(error){
        console.log(error.message)
    }
}

const isLogin=async(req,res,next)=>{
    try{
        if(req.session.user_id){
            next()
        }else{
            res.redirect("/admin")
        }

    }catch(error){
        console.log(error.message)
    }
}

module.exports={
    isLogOut,
    isLogin
}