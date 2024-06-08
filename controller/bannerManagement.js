const Banner =require("../model/bannerModel");
const path=require('path');
const multer=require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname); // Unique filename
    }
  });

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('imageUrl');

const loadBannerList=async(req,res)=>{
    try{
       const banners=await Banner.find({isListed:true});
        res.render("banner",{banners});

    }catch(error){
        console.log(error.message)
    }
}

const loadAddBanner=async(req,res)=>{
    try{

        res.render("addBanner");

    }catch(error){
        console.log(error.message)
    }
}

const addBanner = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ error: err });
        }
        if (!req.file) {
            return res.status(400).send({ error: 'Image is required' });
        }
        
        const { title, subtitle, description, discountInfo, ctaText } = req.body;
      

        if (!title || !subtitle || !description || !discountInfo || !ctaText) {
            return res.status(400).send({ error: 'All fields are required' });
        }

        try {
            const newBanner = new Banner({
                imageUrl: `/uploads/${req.file.filename}`,
                title,
                subtitle,
                description,
                discountInfo,
                ctaText
            });

            await newBanner.save();
            res.redirect("/admin/banner")
        } catch (error) {
            console.log(error.message);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    });
};


const deleteBanner = async (req,res)=>{
    try{
        console.log("dddd")
        const {id}=req.query;
        const deletedBanner = await Banner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).send({ error: 'Banner not found' });
          }

          res.status(200).send({ message: 'Banner deleted successfully' });

    }catch(error){
        console.log(error.message)
        res.status(500).send({ error: 'Internal Server Error' });
    }
}


module.exports={
    loadBannerList,
    loadAddBanner,
    addBanner,
    deleteBanner
}