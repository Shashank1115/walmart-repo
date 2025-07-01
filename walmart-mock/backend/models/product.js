// backend/models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  barcode: String  
});


module.exports = mongoose.model('Product', productSchema, 'products');
