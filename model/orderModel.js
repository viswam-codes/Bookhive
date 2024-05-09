const { ObjectId } = require('mongodb');
const { Schema, model } = require('mongoose');
const objectID = Schema.Types.ObjectId;

const orderSchema = Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending',
    },
    items: [{
        productId: {
            type: objectID,
            ref: 'Product'
        },
        title: {
            type: String,
            required: true
        },
        image: [{
            type: String,
            required: true
        }],
        productPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity can not be less than one.'],
            default: 1
        },
        price: {
            type: Number,
        },
        status:{
            type: String,
            enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
            default: 'Pending',
        },
        cancellationReason : {
            type: String,
        },
        cancellationDate : {
            type: Date,
        },
    }],
    billTotal: {
        type: Number,
        required: true
    },
    shippingAddress: {
        houseName:String,
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    orderNotes: {
        type: String,
        default: ''
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    reasonForReturn: {
        default: 'nil',
        type: String
    },
    couponAmount:{
        default: 0,
        type: Number
    },
    couponCode:{
        default: 'nil',
        type: String
    }
}, {
    timestamps: true,
});

module.exports = model('Order', orderSchema);