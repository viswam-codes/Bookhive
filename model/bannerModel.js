const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    discountInfo: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

bannerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;