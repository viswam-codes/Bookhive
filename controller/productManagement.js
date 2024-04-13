const Product=require('../model/productModel')
const Category=require('../model/categoryModel')
const multer=require('multer');
const sharp=require("sharp");
const fs=require('fs');
const path=require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname); // Unique filename
    }
  });

  const upload = multer({
    storage: storage
  }).array("image",3);


const loadProduct=async(req,res)=>{
    try{
      const product=await Product.find()
        res.render("product",{pro:product})

    }catch(error){
        console.log(error.message);
    }
}

const loadAddProduct=async(req,res)=>{
    const category=await Category.find({isListed:"Active"})
    ;
   try{
    res.render("addProduct",{cat:category});

   }catch(error){
    console.log(error.message)
   }
}

const addProduct=async(req,res)=>{
   upload(req,res,async function(err){
    if(err instanceof multer.MulterError){
      console.log(`Multer error: ${err}`);
      res.status(500).send("Error Uploading the images");
      return;
    }else if(err){
      console.log(`Unknown Error:${err}`);
      res.status(500).send("Unknown Error Occured. The Error",err);
      return;
    }
    if(!req.files || req.files.length===0){
      res.status(400).send("No images to Upload");
      return;
    }

    try{
      const processedImages=[];
      for(const file of req.files){
        const filename=`${file.originalname} - cropped`;
        const imagePath= path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          filename
        );
      
      
      try{
        //image processing using sharp
        const imageBuffer= await sharp(file.path)
        .resize(440,440)
        .toBuffer();
        //Write the processed image to the path specified
        fs.writeFileSync(imagePath,imageBuffer);

        //remove original file after processingg
        fs.unlinkSync(file.path);

        processedImages.push(filename);

      }catch(err){
        console.log(`Error occured While processing the image:${err}`);
        res.status(500).send("Error processing the image");
        return;   

      }
    }
    
    const {title,author,description,price,stock,category,image}=req.body;
    const newProduct=new Product({
      title,
      author,
      description,
      price,
      stock,
      category,
      image:processedImages
    });

    await newProduct.save();
    res.redirect("/admin/product_management");
    }catch(err){

      console.log(`Error occured while processing the image using Sharp ${err}`);
      res.status(500).send(`Error processing images using Sharp: ${err}`)

    }
  
   });
  };


module.exports={
    loadProduct,
    loadAddProduct,
    addProduct,
}