const mongoose= require("mongoose");

const referralSchema=mongoose.Schema({
    offerAmount:{
        type:Number,
        default:1000
    }
})

module.exports = mongoose.model('Referral',referralSchema);