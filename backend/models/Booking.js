const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        tourId: {
            type: Number,
            required: true
        },

        tourName: {
            type: String,
            required: true,
            trim: true
        },

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        customerEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        travelDate: {
            type: String,
            required: true
        },

        travellers: {
            type: Number,
            required: true,
            min: 1
        },

        pricePerPerson: {
            type: Number,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = bookingSchema;