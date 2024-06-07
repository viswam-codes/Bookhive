const Banner =require("../model/bannerModel");

const loadBannerList=async(req,res)=>{
    try{

        res.render("banner");

    }catch(error){
        console.log(error.message)
    }
}


module.exports={
    loadBannerList
}