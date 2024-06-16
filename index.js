const express=require("express");
const mongoose=require("mongoose");
const path=require("path");
const nocache=require('nocache');
require("dotenv").config()
const dburl=process.env.MONGO_URL;

mongoose
.connect(dburl)
.then(()=>{
    console.info("Connected to the DB")
})
.catch((e)=>{
    console.log("Error:",e);
})

const session=require("express-session");
const userRoute=require("./routes/userRoute");
const adminRoute=require("./routes/adminRoute");
const secretKey=process.env.SECRET_KEY;

const port=process.env.PORT ||3000;
const app= express();

app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended:true }))


app.use(session({
    secret:secretKey,
    resave:false,
    saveUninitialized:false
}))

app.use(express.static(path.join(__dirname,"public")))

//use route
app.use("/",userRoute);

//admin route
app.use("/admin",adminRoute)

app.listen(port,function(){
    console.log("Server is running...")
})