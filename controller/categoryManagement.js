const Category=require('../model/categoryModel');

const listCategory=async(req,res)=>{
    try{
        // const categoryData= await Category.find();
        // console.log(categoryData);
        res.render("category")

    }catch(error){
        console.log(error.message)
    }
}
const addCategory=async(req,res)=>{
    try{
        const {name}=req.body;
        console.log(name)
        const newCategory= new Category({
            name:name,
            createdOn:Date.now(),
            
        })
        await newCategory.save();
        res.redirect('/admin/category_management');

    }catch(error){
        console.log(error.message)
    }
}
module.exports={
    listCategory,
    addCategory
}