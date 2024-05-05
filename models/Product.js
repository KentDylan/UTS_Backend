const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  cpu: {
    type: String, 
    required: true,
  },
  gpu: {
    type: String, 
    required: true,
  },
  memory: {
    type: String, 
    required: true,
  },
  storage: {
    type: String, 
    required: true,
  },
  display: {
    type: String, 
    required: true,
  },
  quantity: {
    type: Number, 
    required: true,
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;