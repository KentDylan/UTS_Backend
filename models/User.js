const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const OrderSchema = mongoose.Schema({
  items: [cartSchema],
  orderStatus: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderFinish: {
    type: Date,
  },
});

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  cart: [cartSchema],
  order: [OrderSchema]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
