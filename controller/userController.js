const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category=require('../model/categoryModel')
const Cart=require("../model/cartModel");
const Order=require("../model/orderModel")
const Wallet=require("../model/walletModel")
const WishList=require("../model/wishListModel");
const Referral=require("../model/referalModel");
const Banner=require("../model/bannerModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "jithviswa24@gmail.com",
    pass: "zuki zpba euue yhxe",
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const generateReferralCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referralCode = '';
  for (let i = 0; i < 5; i++) {
    referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return referralCode;
};

const securePassword = async (password) => {
  try {
    const passwrodHash = await bcrypt.hash(password, 10);
    return passwrodHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadForgotPassword= async(req,res)=>{
  try{
    const user=await User.findById(req.session.user);
    const userId=req.session.user;
    const cartCount=await Cart.findOne({userId}).countDocuments()
    res.render("forgotPassword",{user,message:"",cartCount});

  }catch(error){
    console.log(error.message);
  }
}

const otpSendForgot=async(req,res)=>{
  try{

    const {email} = req.body;
    const user= await User.findOne({email:email});
    
    if(!user){
      res.render("forgotPassword",{message:"User Not found",user});
    }
  else{
    const otp =generateOtp();
    const otpExpiry=Date.now() + 60*1000;
    console.log(otp);
   const mailoptions = {
    from: "jithviswa24@gmail.com",
    to: email,
    subject: "OTP verification",
    text: `Your OTP for verification is :${otp}`,
  };
  transport.sendMail(mailoptions, function (error, info) {
    if (error) {
      console.log("Error occured:", error);
    } else {
      console.log("Email sent", info.response);
    }
  });
  req.session.forgotOtp=otp;
  req.session.otpExpiry=otpExpiry;
  req.session.email=email;
 res.redirect("/verify_otp_forgot");

  }
   
  }catch(error){
    console.log(error.message);

  }
}

const loadForgotOtpPage=async(req,res)=>{
  try{
    res.render("verifyForgotOtp",{message:""});

  }catch(error){
    console.log(error.message);
  }
}

const otpVerifyForgot=async(req,res)=>{
  try{
     if(req.session.forgotOtp == req.body.otp){
      console.log("OTP entered is correct");
      if(req.session.otpExpiration < Date.now()){
        console.log("otp Expired");
        return res.json({expired:true});
      }else{
        console.log("Otp is valid and not expired");
        
      }
    res.json({success:true,message:"Otp verified successfully"})
     }else{
      console.log("Wrong Otp");
      res.json({success:false,message:"Invalid OTP"});
     }
  }catch(error){
    console.log(error.message)
  }
}

const resetForgotPassword=async(req,res)=>{
  try{

    const user=await User.findOne({email:req.session.email});
    const {newPassword}=req.body;

    const spassword= await securePassword(newPassword);

    user.password=spassword;
    await user.save();

    res.json({success:true,message:"Password updated succesfully"})




    
  }catch(error){
    console.log(error.message);
    
  }
}


const loadLandingPage = async (req, res) => {
  try {
    const userId=req.session.user;
    const user=await User.findById(req.session.user);
    
    
    if (!user || !user.is_verified) {
      // If the user is blocked or not found, destroy the session and redirect to the login page
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    const product = await Product.find({isDeleted:false}).sort({createdAt:-1}).limit(8);
   
    const cart=await Cart.findOne({userId});
    let cartCount=0;
    if(cart){
       cartCount=cart.product.length;
    }

    const banner=await Banner.find({isListed:true});
    
    
    return res.render("home", { user, pro: product,cartCount,banner });
  } catch (err) {
    console.log(err.message);
  }
};

const loadRegister = async (req, res) => {
  try {

    const userId=req.session.user;
    const user=await User.findById(userId);
    
    const cartCount=await Cart.findOne({userId}).countDocuments()
    res.render("register", { user,cartCount});
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const user=await User.findById(req.session.user);
    const {referralCode}=req.body;
   
    const exitstingUser = await User.findOne({ email: req.body.email });
    if (exitstingUser) {
      return res.render("register", {user, message: "User already exists" });
    } else {
      const otp = generateOtp();
      console.log(otp);
      const details = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        otp: otp,
        otpExpiration: Date.now() + 60*1000,
        referalCode: referralCode || null
      };

      req.session.details = details;
      req.session.save();
      res.redirect("/otpVerify");
      console.log(req.session.details.otp);
      const mailoptions = {
        from: "jithviswa24@gmail.com",
        to: req.body.email,
        subject: "OTP verification",
        text: `Your OTP for verification is :${otp}`,
      };
      transport.sendMail(mailoptions, function (error, info) {
        if (error) {
          console.log("Error occured:", error);
        } else {
          console.log("Email sent", info.response);
        }
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOTP = async (req, res) => {
  try {
    return res.render("otp", { message: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTP = async (req, res) => {
  try {
    console.log(req.body.otp);
    console.log(req.session.details.referalCode);

    if (req.session.details.otp == req.body.otp) {
      console.log("OTP is correct");
      if (req.session.details.otpExpiration < Date.now()) {
        console.log("expired");
        return res.json({ expired: true });
      } else {
        console.log("OTP is valid and has not expired");
        const spassword = await securePassword(req.session.details.password);
        const referralCode = generateReferralCode();
        const user = new User({
          name: req.session.details.name,
          email: req.session.details.email,
          password: spassword,
          is_admin: 0,
          is_verified: true,
          referalCode: referralCode
        });

        await user.save();

        const wallet = new Wallet({
          user: user._id
        });

        await wallet.save();

        // Create a wishlist for the user
        const wishlist = new WishList({
          userId: user._id,
        });

        await wishlist.save();

        if (req.session.details.referalCode) {
          const referringUser = await User.findOne({ referalCode: req.session.details.referalCode });
          console.log("referred by", referringUser);
          if (referringUser) {
            const referringUserWallet = await Wallet.findOne({ user: referringUser._id });
            console.log("referrer Wallet:", referringUserWallet);

            if (referringUserWallet) {
              const referralAmount = await Referral.findOne().select('offerAmount').lean();
              console.log("amount", referralAmount);
              if (!referralAmount) {
                return res.status(500).json({ message: "Referral amount not found" });
              }
              const creditAmount = referralAmount.offerAmount;

              // Credit referring user's wallet
              referringUserWallet.walletBalance += creditAmount;
              referringUserWallet.transactions.push({
                amount: creditAmount,
                description: 'Referral bonus for referring a new user',
                type: 'credit'
              });
              await referringUserWallet.save();

              // Credit new user's wallet
              wallet.walletBalance += creditAmount;
              wallet.transactions.push({
                amount: creditAmount,
                description: 'Referral bonus for using a referral code',
                type: 'credit'
              });
              await wallet.save();
            } else {
              console.log("Referring user's wallet not found");
              return res.status(404).json({ message: "Referring user's wallet not found" });
            }
          } else {
            console.log("Referring user not found");
            return res.status(404).json({ message: "Referring user not found" });
          }
        }

        res.json({ redirect: "/login" });
      }
    } else {
      console.log("Wrong OTP");
      const message = "Invalid OTP";
      return res.json({ message });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const resendOTP = async (req, res) => {
  try {
    const newOTP = generateOtp();
    req.session.details.otp = newOTP;
    console.log(req.session.details.otp);
    req.session.details.otpExpiration = Date.now + 60000;
    req.session.save();
    const mailoptions = {
      from: "jithviswa24@gmail.com",
      to: req.session.details.email,
      subject: "OTP verification",
      text: `Your OTP for verification is :${newOTP}`,
    };
    transport.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log("Error occured:", error);
      } else {
        console.log("Email sent", info.response);
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_verified === false) {
          return res.render("login", {
            user: req.session.userData,
            message: "User blocked",
          });
        } else {
          req.session.user = userData._id;
          req.session.user==true;
          res.redirect("/");
        }
      } else {
        return res.render("login", {
          message: "Email and password are incorrect",
          user:req.session.user
        });
      }
    } else {
      return res.render("login", {
        user:req.session.user,
        message: "Email and password is incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    const user= User.findById(req.session.user);
    const userId=req.session.user;
    const cart=await Cart.findOne({userId});
    let cartCount=0;
    if(cart){
       cartCount=cart.product.length;
    }
    res.render("login", { user, message: "",cartCount });
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.user = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadShopPage=async(req,res)=>{
  try{
    const userId=req.session.user;
    const page=parseInt(req.query.page) || 1;
    const perPage=12;
    const totalProductCount= await Product.countDocuments({});
    const totalPages = Math.ceil(totalProductCount / perPage);
    const skip = (page - 1) * perPage;
    const product = await Product.find({isDeleted:false}).skip(skip).limit(perPage);
    const category=await Category.find({isListed:"Active"})
    const user=await User.findById(req.session.user)
    const cart=await Cart.findOne({userId});
    let cartCount=0;
    if(cart){
       cartCount=cart.product.length;
    }
   res.render("shop",{user,pro:product,cat:category,currentPage: page, totalPages,cartCount});
  }catch(error){
    console.log(error.message);
  }
}

const loadProductPage=async(req,res)=>{
  try{
    let id=req.query.id;
    const userId=req.session.user;
    const product= await Product.findById(id);
    const user = await User.findById(req.session.user);
    const relatedProducts = await Product.find({
      $or: [
        { category: product.category },
        { author: product.author }
      ],
      _id: { $ne: id } // Exclude the current product
    });
    const cart=await Cart.findOne({userId});
    let cartCount=0;
    if(cart){
       cartCount=cart.product.length;
    }

    res.render("prodView",{user,pro:product,relProduct:relatedProducts,cartCount});

  }catch(error){
    console.log(error.message);
  }
}

const loadProfile=async(req,res)=>{
  try{  
    const userId=req.session.user;
    const user = await User.findById(userId);
    const order = await Order.find({user:userId});

    const wallet= await Wallet.findOne({user:userId})
    
    const cart=await Cart.findOne({userId});
    let cartCount=0;
    if(cart){
       cartCount=cart.product.length;
    }
    res.render("userProfile", { user, order: order,cartCount,wallet});
    
  }catch(error){
    console.log(error.message);
  }
}

const editDetails=async(req,res)=>{
  try{
    const userId=req.session.user ;
    const {name,email}=req.body;
    const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true });
    if(!user){
      return res.status(404).send({success:false,error:"User not found"})
    }
    await user.save();
    res.status(200).json({success:true})
    // res.redirect("/account")
  }catch(error){
    console.log(error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

const resetPassword=async(req,res)=>{
  try{
    const user= await User.findById(req.session.user);
    const {currentPassword,newPassword}=req.body;
  
    const validPassword=await bcrypt.compare(currentPassword,user.password)
    if(!validPassword){
      return res.json({ notMatch:true, message: 'Current password is incorrect' });
    }
    
    const spassword=await securePassword(newPassword);
    user.password=spassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful' });



  }catch(error){
    console.log(error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const addAddress = async (req, res) => {
  try {
      const userId = req.session.user;
      const { houseName, street, city, state, country, postalCode, phoneNo, addressType } = req.body;

      // Create address object
      const address = {
          houseName: houseName,
          street: street,
          city: city,
          state: state,
          country: country,
          postalCode: postalCode,
          phoneNumber: phoneNo,
          type: addressType
      };

      // Find user by ID and update the address array
      const updatedUser = await User.findByIdAndUpdate(userId, {
          $push: { address: address }
      }, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({ success: true, message: 'Address added successfully', address: address });
  } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const editAddress= async(req,res)=>{
  try{
    const user= await User.findById(req.session.user);
    const {id, houseName, street, city, state, country, postalCode, phoneNumber, addressType } = req.body;
    const addressIndex = user.address.findIndex(addr => addr._id.toString() === id);

    if (addressIndex !== -1) {
      // Update address fields
      user.address[addressIndex].houseName = houseName;
      user.address[addressIndex].street = street;
      user.address[addressIndex].city = city;
      user.address[addressIndex].state = state;
      user.address[addressIndex].country = country;
      user.address[addressIndex].postalCode = postalCode;
      user.address[addressIndex].phoneNumber = phoneNumber;
      user.address[addressIndex].type = addressType;

      // Save the updated user document
      await user.save();

      res.json({ success: true, message: 'Address updated successfully' });
    } else {
      // Address not found
      res.status(404).json({ success: false, message: 'Address not found' });
  }
  }catch(error){
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

const deleteAddress= async(req,res)=>{
  try{ 
    const user= await User.findById(req.session.user);
    const id=req.query.id;

    const addressIndex = user.address.findIndex(addr => addr._id.toString() === id);

    if (addressIndex !== -1) {
      user.address.splice(addressIndex, 1); 
      await user.save(); 
      res.json({ success: true, message: 'Address deleted successfully' });
  } else {
      // Address not found
      res.status(404).json({ success: false, message: 'Address not found' });
  }
 

  }catch(error){
    console.log(error.message);
  }
}

const loadCart= async(req,res)=>{
  try{
    const userId=req.session.user;
     const user=await User.findById(userId);
     const cart=await Cart.findOne({userId:userId}).populate("product.productId");
     let cartCount="0";
        if(cart){
           cartCount=cart.product.length;
        }
     if (!cart || cart.product.length === 0) {
      return res.render("cart",{message: 'Cart is empty',user,cart,cartCount});
  } 
  
  
        
     res.render("cart",{user,cart,cartCount});
  }catch(error){
    console.log(error.message)
  }
}

const addToCart=async(req,res)=>{
  try{

    const{userId,productId}=req.query;
    const {quantity}=req.body;
    console.log(quantity);
    const user= await User.findById(req.session.user)
    const product= await Product.findById(productId);

  

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock == 0) {
      return res.json({ success:false, message: "Out of Stock" });
    }


    if(!userId || !productId){
      return res.status(400).json({message:"userId and ProductId are required"});
    }

    let cart=await Cart.findOne({userId});


    if(!cart){
      cart= new Cart({userId});
    }

    const productIndex=cart.product.findIndex(item=>item.productId.toString()===productId);

    

   

    if(productIndex !==-1){
      //if the product exists increase the quantitiy by one
      cart.product[productIndex].quantity +=quantity?quantity:1;
    }else{
      cart.product.push({productId, quantity:quantity?quantity:1});
    }

    await cart.save();
   res.json({success:true});

  }catch(error){
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateQuantity = async (req, res) => {
  try {
      const userId = req.session.user;
      const { quantity } = req.body;
      const productId = req.params.id; 

      // Check if quantity is valid
      if (quantity <= 0) {
          return res.status(400).json({ success: false, message: 'Invalid quantity',});
      }
      if(quantity > 10){
        console.log("max reached")
         return res.json({success:false,message:"Maximum quantity reached"});
    }


      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found',curr:product.stock });
      }

      // Check if quantity is greater than stock
      if (quantity > product.stock) {
          return res.status(400).json({ success: false, message: 'Out of stock' });
          
      }
      // Update quantity in the cart
      const cart = await Cart.findOne({ userId });
      const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);
      if (productIndex === -1) {
          return res.status(404).json({ success: false, message: 'Product not found in cart' });
      }

      cart.product[productIndex].quantity = quantity; // Set quantity to the provided value

      if (quantity === 0) {
          // Remove product from cart if quantity becomes zero
          cart.product.splice(productIndex, 1);
      }

      await cart.save();

      res.json({ success: true, message: 'Quantity updated successfully'});
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const checkQuantity = async (req, res) => {
  try {
      const userId = req.session.user;
      const cart = await Cart.findOne({ userId });
      // Check if the cart exists and is not empty
      if (!cart || cart.product.length === 0) {
          return res.json({ success: false, message: 'Cart is empty' });
      }

      // Iterate through each product in the cart
      for (const item of cart.product) {
          const product = await Product.findById(item.productId);

          // Check if the product exists
          if (!product) {
              return res.json({ success: false, message: 'Product not found' });
          }

          // Check if the quantity is greater than zero and less than or equal to the stock
          if (item.quantity <= 0 || item.quantity > product.stock) {
              return res.json({ success: false, message: 'Quantity is invalid or out of stock' });
          }
      }

      // If all checks pass, return success
      return res.json({ success: true, message: 'Updated to checkout' });
  } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const removeFromCart=async(req,res)=>{
  try{
    const {productId} = req.body;
    const userId=req.session.user;
    console.log(productId);
    

    const cart = await Cart.findOne({userId});

    const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }
    cart.product.splice(productIndex, 1);
    res.status(200).json({ success: true, message: 'Product removed from cart' });
    await cart.save();
  }catch(error){
    console.log(error.message);
  }
}

const filterProduct = async (req, res) => {
  try {
    const { search, sortOption, filterOption, prevSearchResults } = req.query;
    console.log(filterOption,"selected filterOption")
    const page = parseInt(req.query.page) || 1;  
    const perPage = 12;
    let query = { isDeleted: false, isListed: "Active" };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (filterOption && filterOption.trim().length > 0) {
      query.category = filterOption.trim();
    }

    let sort = {};
    if (sortOption === 'Price: High to Low') {
      sort.price = -1;
    } else if (sortOption === 'Price: Low to High') {
      sort.price = 1;
    } else if (sortOption === 'Release Date') {
      sort.createdAt = -1;
    }
    const skip = (page - 1) * perPage;
    const totalProductCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProductCount / perPage);
    const products = await Product.find(query).sort(sort).skip(skip).limit(perPage);
    res.json({ products, totalPages, currentPage: page });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const loadWishList = async (req, res) => {
  try {
      const userId = req.session.user;
      const user= await User.findById(userId);
      // Find the wishlist entries for the user and populate the products
      const wishlist = await WishList.findOne({ userId: userId }).populate('products.productId');

      if (!wishlist) {
          // If wishlist is empty, render the wishlist page with an empty array of products
          return res.render("wishList", { user,products: [] });
      }

      const products = wishlist.products.map(item => item.productId);
      const cart=await Cart.findOne({userId});
      let cartCount=0;
      if(cart){
         cartCount=cart.product.length;
      }
      res.render("wishList", { products,user,cartCount });
  } catch (error) {
      console.error(error);
      // Handle errors appropriately, e.g., render an error page
      // res.render("errorPage", { error: "Internal server error" });
  }
}

const addToWishList = async (req, res) => {
  try {
      const userId = req.session.user; // Assuming userId is stored in req.session.user
      const { productId } = req.query;

      // Find the wishlist for the user
      let wishlist = await WishList.findOne({ userId: userId });

      if (!wishlist) {
          // If wishlist does not exist for the user, create a new one
          wishlist = new WishList({
              userId: userId,
              products: [{ productId: productId }]
          });
      } else {
          // If wishlist already exists, check if the product is already in the wishlist
          const existingProduct = wishlist.products.find(product => String(product.productId) === productId);

          if (existingProduct) {
              return res.status(200).json({ success: false, message: 'Product already exists in wishlist' });
          }

          // Add the new product to the existing wishlist
          wishlist.products.push({ productId: productId });
      }

      // Save the wishlist
      await wishlist.save();

      res.status(200).json({ success: true, message: 'Product added to wishlist successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
}



const removeFromWishList = async (req, res) => {
    try {
        const { productId } = req.query;
        const userId = req.session.user;

        // Find the wishlist for the user
        const wishlist = await WishList.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        // Find the index of the product to remove from the wishlist
        const indexToRemove = wishlist.products.findIndex(product => String(product.productId) === productId);

        if (indexToRemove === -1) {
            return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
        }

        // Remove the product from the wishlist
        wishlist.products.splice(indexToRemove, 1);

        // Save the updated wishlist
        await wishlist.save();

        res.status(200).json({success: true, message: 'Product removed from wishlist successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}










module.exports = {
  loadLandingPage,
  loadLogin,
  loadRegister,
  loadOTP,
  insertUser,
  verifyOTP,
  verifyLogin,
  userLogout,
  resendOTP,
  loadShopPage,
  loadProductPage,
  loadProfile,
  editDetails,
  resetPassword,
  addAddress,
  editAddress,
  deleteAddress,
  loadCart,
  addToCart,
  updateQuantity,
  checkQuantity,
  loadForgotPassword,
  otpSendForgot,
  loadForgotOtpPage,
  otpVerifyForgot,
  resetForgotPassword,
  removeFromCart,
  filterProduct,
  loadWishList,
  addToWishList,
  removeFromWishList
};
