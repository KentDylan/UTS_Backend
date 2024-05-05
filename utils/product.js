const fs = require("fs");

const loadProducts = () => {
  const fileBuffer = fs.readFileSync("data/products.json", "utf-8");
  const products = JSON.parse(fileBuffer);
  return products;
};

module.exports = {loadProducts}