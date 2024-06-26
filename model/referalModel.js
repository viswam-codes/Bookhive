const mongoose= require("mongoose");

const referralSchema = new mongoose.Schema({
    newUserAmount: {
      type: Number,
      default: 1000
    },
    userAmount: {
      type: Number,
      default: 1000
    }
  });
  

module.exports = mongoose.model('Referral',referralSchema);