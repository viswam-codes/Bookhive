const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category=require('../model/categoryModel')
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

const securePassword = async (password) => {
  try {
    const passwrodHash = await bcrypt.hash(password, 10);
    return passwrodHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLandingPage = async (req, res) => {
  try {
    const user=await User.findById(req.session.user);
    const product = await Product.find().limit(8);
    return res.render("home", { user, pro: product });
  } catch (err) {
    console.log(err.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    const user=await User.findById(req.session.user);
    res.render("register", { user});
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const user=await User.findById(req.session.user);
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
   

    if (req.session.details.otp == req.body.otp) {
      console.log("OTP is correct");
      if ( req.session.details.otpExpiration < (Date.now()) ) {
        console.log("expired");
        return res.json({ expired: true });
      } else {
        console.log("OTP is valid and has not expired");
        const spassword = await securePassword(req.session.details.password);
        const user = new User({
          name: req.session.details.name,
          email: req.session.details.email,
          password: spassword,
          is_admin: 0,
          is_verified: true,
        });

        await user.save();
        res.json({ redirect: "/login" });
      }
    } else {
      console.log("Wrong OTP");
      const message= "Invalid OTP";
      return res.json( { message });
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
          console.log(userData);
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
    res.render("login", { user, message: "" });
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
    const product = await Product.find({isListed:"Active"})
    const category=await Category.find({isListed:"Active"})
    const user=await User.findById(req.session.user)
   res.render("shop",{user,pro:product,cat:category});
  }catch(error){
    console.log(error.message);
  }
}

const loadProductPage=async(req,res)=>{
  try{
    let id=req.query.id;
    const product= await Product.findById(id);
    const user = await User.findById(req.session.user);
    const relatedProducts = await Product.find({
      $or: [
        { category: product.category },
        { author: product.author }
      ],
      _id: { $ne: id } // Exclude the current product
    });

    res.render("prodView",{user,pro:product,relProduct:relatedProducts});

  }catch(error){
    console.log(error.message);
  }
}

const loadProfile=async(req,res)=>{
  try{  

    const user = await User.findById(req.session.user)
    res.render("userProfile",{user});

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
   console.log(id);
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
  editAddress
};
