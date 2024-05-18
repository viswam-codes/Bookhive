const coupen = require("../model/coupenModel");



const loadCoupenList = async(req,res)=>{
    try{

        res.render("coupen");

    }catch(error){
        console.log(error.message)
    }
}

const addCoupen = async(req,res)=>{
    try{

    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    loadCoupenList,
    addCoupen
}