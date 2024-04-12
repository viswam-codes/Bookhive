const Category=require('../model/categoryModel');

const loadCategory=async(req,res)=>{
    try{
        const categoryData= await Category.find().sort({createdOn:-1});
        // console.log(categoryData);
        res.render("category",{message:"",cat:categoryData});

    }catch(error){
        console.log(error.message)
    }
}
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(name)
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        console.log(existingCategory);
        const categoryData= await Category.find().sort({createdOn:-1});

        if (existingCategory) {
            
            return res.render("category", {cat:categoryData, message: "Category already exists" });
            
        }

        const newCategory = new Category({
            name: name,
            createdOn: Date.now(),
        });

        await newCategory.save();
        res.redirect("/admin/category_management")

    } catch (error) {
        console.log(error.message);
        // Handle the error accordingly
        res.status(500).send("Server Error");
    }
};

const updateCategory= async(req,res)=>{
    try{
        const id=req.params;
        const {name,isListed}=req.body;

        const updateCategory= await Category.findByIAndUpdate(categoryId,{name,isListed},{new:true});

        if(!updateCategory){
            return res.status(404).json({sucess:false,message:"Category not found"});
        }
        
        res.status(200).json({sucess:true,category:updatedCategory});

    }catch(error){
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports={
    loadCategory,
    addCategory,
    updateCategory
}