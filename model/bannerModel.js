const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    discountInfo: { type: String },
    ctaText: { type: String },
    isListed:{type:Boolean,default:true}
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner