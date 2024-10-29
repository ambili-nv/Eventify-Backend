// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contactDetails: {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  images: {
    type: [String], // Array of image URLs
    required: true,
  },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
