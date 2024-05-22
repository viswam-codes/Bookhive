const Category=require('../model/categoryModel');
const Product=require('../model/productModel');

const loadCategory=async(req,res)=>{
    try{
        const categoryData= await Category.find({deleted:false}).sort({createdOn:-1});
        // console.log(categoryData);
        res.render("category",{message:"",cat:categoryData});

    }catch(error){
        console.log(error.message)
    }
}
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(req.body,"In body");
       
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        const categoryData= await Category.find({deleted:false}).sort({createdOn:-1});
        console.log(existingCategory,"existingcat");
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
        const id=req.params.id;
        const {name,isListed,discount}=req.body;
        console.log(discount);
        const existingCategory = await Category.findOne({ name });
        if (existingCategory && existingCategory._id != id) {
            // If a category with the same name already exists and it's not the same category being updated
            return res.status(400).json({ success: false, error: 'category_exists', message: 'Category already exists' });
        }

        const updateCategory= await Category.findByIdAndUpdate(id,{name,isListed,discount},{new:true});
        if(discount){
            const category= await Category.findById(id);
            const categoryName=category.name;
            const products= await Product.find({category:categoryName});
            console.log(products)
            for (const product of products) {
                const discountPrice = product.price - (product.price * (discount / 100));
                await Product.findByIdAndUpdate(product._id, { discountPrice });
            }

        }

        if(!updateCategory){
            return res.status(404).json({sucess:false,message:"Category not found"});
        }
        
        res.status(200).json({sucess:true,category:updateCategory});

    }catch(error){
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const deleteCatgory= async(req,res)=>{
    console.log("working");
    const categoryId=req.params.id;
    console.log(categoryId);
    try{
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { deleted: true });
        if(updatedCategory){
            res.json({ success: true, message: 'Category soft deleted successfully' });
        }else{
            res.status(404).json({ success: false, message: 'Category not found' });
        }
        
    }catch(error){
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports={
    loadCategory,
    addCategory,
    updateCategory,
    deleteCatgory
}