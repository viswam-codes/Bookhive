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

  const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'image/jpg'
    ) {
        cb(null, true);
    } else {
        console.log('Invalid file type. Only PNG, JPEG, and WebP files are allowed.');
    }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).array("image", 10);



const loadProduct=async(req,res)=>{
    try{
      const product=await Product.find({isDeleted:false});
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
        .resize(400,440)
        .toBuffer();
        //Write the processed image to the path specified
        fs.writeFile(imagePath, imageBuffer, async function (writeErr) {
          if (writeErr) {
              console.log(`Error occurred while writing the processed image: ${writeErr}`);
              res.status(500).send("Error processing the image");
              return;
          } 
    });
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

const loadEditProduct=async(req,res)=>{
  try{
    let id=req.query.id;
    const category=await Category.find({isListed:"Active"})
    const product= await Product.findById(id);
    req.session.productId=id;
    res.render("editProduct",{pro:product,cat:category});

  }catch(error){
    console.log(error.message)
  }
}




const updateProduct = async (req, res) => {
  try {
    let id=req.query.id;
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.log(`Multer error: ${err}`);
        res.status(500).send("Error Uploading the images");
        return;
      } else if (err) {
        console.log(`Unknown Error:${err}`);
        res.status(500).send("Unknown Error Occured. The Error", err);
        return;
      }

      try {
        const processedImages = [];

        // Check if files exist before processing
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            const filename = `${file.originalname} - cropped`;
            const imagePath = path.join(
              __dirname,
              "..",
              "public",
              "uploads",
              filename
            );
            try {
              //image processing using sharp
              const imageBuffer = await sharp(file.path)
                .resize(400, 440)
                .toBuffer();
              //Write the processed image to the path specified
              fs.writeFileSync(imagePath, imageBuffer);
              processedImages.push({ filename });
            } catch (err) {
              console.log(`Error occured While processing the image:${err}`);
              res.status(500).send("Error processing the image");
              return;
            }
          }
        }

        const {
          title,
          author,
          description,
          price,
          stock,
          category,
          images,
        } = req.body;
        const processedImageFilenames = processedImages.map(image => image.filename);

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
          console.log("Product not found");
          res.status(404).send("Product not found");
          return;
        }

        // Combine existing images with the new ones
        const updatedImages = existingProduct.image.concat(processedImageFilenames);

        const updatedProduct = await Product.findByIdAndUpdate(
         id,{
            title: title,
            author: author,
            description: description,
            price: price,
            stock: stock,
            category: category,
            $set:{image:updatedImages},
          },
          { new: true }
        );
        if(!updatedProduct){
          console.log("product not found");
        }
        await updatedProduct.save();
        res.redirect("/admin/product_management");
      } catch (err) {
        console.log(`Error occured while processing the image using Sharp ${err}`);
        res.status(500).send(`Error processing images using Sharp: ${err}`);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error editing product.");
  }
};

const deleteImage=async(req,res)=>{
  try{
    const {productId,imageIndex}=req.body;
    console.log(productId);

    const product= await Product.findById(productId);

    if(!product){
      return res.status(404).json({error:"Product not found"});
    }

    //Image removal
    if(imageIndex<product.image.length){
      product.image.splice(imageIndex,1);
    }else{
      return res.status(400).json({success:false,error:"Invalid image index"});
    }

    await product.save();

    return res.status(200).json({ success:true, message: 'Image deleted successfully' });

  }catch(error){
    console.log(error.message);
  }
}

const deleteProduct=async(req,res)=>{
  const productId=req.params.id;

  try{
    const updatedProduct=await Product.findByIdAndUpdate(productId,{isDeleted:true});
    if(updatedProduct){
      res.json({sucess:true,message:"Product soft deleted succesfully"})
    }else{
      res.status(404).json({sucess:false,message:'Product not found'})
    }

  }catch(error){
    console.log(error.message);
  }
}
    

module.exports={
    loadProduct,
    loadAddProduct,
    addProduct,
    loadEditProduct,
    updateProduct,
    deleteImage,
    deleteProduct
    
} 