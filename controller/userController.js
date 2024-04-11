const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "jithviswa24@gmail.com",
    pass: "ttpgohljycbziuuk",
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
    return res.render("home", { user: req.session.user });
  } catch (err) {
    console.log(err.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("register", { user: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const exitstingUser = await User.findOne({ email: req.body.email });
    if (exitstingUser) {
      return res.render("register", { message: "User already exists" });
    } else {
      const otp = generateOtp();
      console.log(otp);
      const details = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        otp: otp,
        otpExpiration: Date.now() + 6000,
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
    return res.render("otp");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTP = async (req, res) => {
  try {
    console.log(req.body.otp);
    console.log(req.session.details.otp);

    if (req.session.details.otp == req.body.otp) {
      console.log("OTP is correct");
      if (Date.now() < req.session.details.otpExpiration) {
        console.log("OTP expired, resend OTP");
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
        res.redirect("/login");
      }
    } else {
      console.log("OTP is incorrect");
    }
  } catch (error) {
    console.log(error.message);
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
          return res.render("login", { user:req.session.userData, message:"User blocked" });
        } else {
          req.session.user = userData;
          console.log(userData);
          res.redirect("/");
        }
      } else {
        return res.render("login", {
          message: "Email and password is incorrect",
        });
      }
    } else {
      return res.render("login", {
        message: "Email and password is incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login", { user: req.session.user, message: "" });
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

module.exports = {
  loadLandingPage,
  loadLogin,
  loadRegister,
  loadOTP,
  insertUser,
  verifyOTP,
  verifyLogin,
  userLogout,
};
