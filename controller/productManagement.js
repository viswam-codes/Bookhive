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
      const page= parseInt(req.query.page) || 1;
      const perPage=10;

      const totalProductCount= await Product.countDocuments({ isDeleted: false });
      const totalPages = Math.ceil(totalProductCount / perPage);

      // Calculate the number of documents to skip based on the page number
      const skip = (page - 1) * perPage;


      const product=await Product.find({isDeleted:false}).skip(skip).limit(perPage).sort({createdAt:-1});
        res.render("product",{pro:product ,currentPage: page, totalPages })
 
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

const addProduct = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.log(`Multer error: ${err}`);
      res.status(500).send("Error uploading the images");
      return;
    } else if (err) {
      console.log(`Unknown error: ${err}`);
      res.status(500).send("Unknown error occurred. The error:", err);
      return;
    }
    if (!req.files || req.files.length === 0) {
      res.status(400).send("No images to upload");
      return;
    }

    try {
      const uploadedImages = [];
      for (const file of req.files) {
        const filename = file.originalname;
        const imagePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          filename
        );

        // Move the file to the desired directory
        fs.rename(file.path, imagePath, function (renameErr) {
          if (renameErr) {
            console.log(`Error occurred while moving the uploaded image: ${renameErr}`);
            res.status(500).send("Error moving the image");
            return;
          }
        });

        uploadedImages.push(filename);
      }

      const { title, author, description, price, stock, category } = req.body;
      const categories=await Category.findOne({name:category});
      let discountPrice=0;
      if(categories.discount){
        discountPrice=parseInt(price-(price*(categories.discount/100)))
      }
      const newProduct = new Product({
        title,
        author,
        description,
        price,
        stock,
        category,
        image: uploadedImages,
        discountPrice
      });

      await newProduct.save();
      res.redirect("/admin/product_management");
    } catch (err) {
      console.log(`Error occurred while saving the product: ${err}`);
      res.status(500).send(`Error saving the product: ${err}`);
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
                .resize(971, 1500)
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
          discount
        } = req.body;


        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
          console.log("Product not found");
          res.status(404).send("Product not found");
          return;
        }


        const categoryObj = await Category.findOne({ name: category });
        if (!categoryObj) {
          console.log("Category not found");
          res.status(404).send("Category not found");
          return;
        }
        let discountedPrice=0;
        if(discount && discount >0){
          discountedPrice = price -(price * discount /100);
          if (categoryObj.discount && discount < categoryObj.discount) {
            const product = await Product.findById(id);
            const categories = await Category.find(); // Fetch categories for the dropdown
            return res.render('editProduct', {
              pro: product,
              cat: categories,
              errorMessage: `Better category discount available`,
            });
          }
         

        } else if(discount<0 || discount >100){

          const product = await Product.findById(id);
          const categories = await Category.find(); // Fetch categories for the dropdown
          return res.render('editProduct', {
            pro: product,
            cat: categories,
            errorMessage: `Discount should be between 0 and 100`,
          });
          
        }else if (existingProduct.category !== category && categoryObj.discount) {
          discountedPrice = price - (price * categoryObj.discount / 100);
        }

        const processedImageFilenames = processedImages.map(image => image.filename);

       

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
            discountPrice:discountedPrice,
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