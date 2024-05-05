const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");
const session = require("express-session");
const app = express();
const { ensureAuthenticated } = require("../config/auth");

router.use(methodOverride("_method"));

router.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  })
);
// Passport
router.use(passport.initialize());
router.use(passport.session());

// Middleware to set common variables for rendering pages
router.use((req, res, next) => {
  if (req.user && req.user.name === "admin") {
    res.locals.layout = "layouts/admin-layout"; // Set admin layout if user is admin
  } else {
    res.locals.layout = "layouts/main-layout"; // Set customer layout by default
  }
  next();
});

const User = require("../models/User");
const Product = require("../models/Product");
const Request = require("../models/userRequest");
const Order = require("../models/Order");

// home page
router.get("/", (req, res) =>
  res.render("./user-page/home", {
    activePage: "home",
  })
);

// shop page
router.get("/shop", async (req, res) => {
  const products = await Product.find();
  res.render("./user-page/shop", {
    activePage: "shop",
    products,
    user: req.user,
  });
});

// product details
router.get("/shop/:_id", async (req, res) => {
  const product = await Product.findOne({ _id: req.params._id });
  const products = await Product.find();
  const currentProductName = product.name;

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  shuffleArray(products);

  res.render("./user-page/detail", {
    activePage: "shop",
    // layout: "layouts/main-layout",
    product,
    products,
    currentProductName,
  });
});

router.get("/profile", (req, res) => {
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./user-page/profile-page", {
    activePage: "profile",
    layout,
    user: req.user,
  });
});

// managing database page
router.get("/product", ensureAuthenticated, async (req, res) => {
  const products = await Product.find();
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./admin-page/manage-product", {
    activePage: "data",
    layout,
    products,
  });
});

// add new product apge
router.get("/product/add", ensureAuthenticated, (req, res) => {
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./admin-page/add-product", {
    activePage: "data",
    layout,
  });
});

const isStringNumeric = (value) => {
  // Check if the value is a string
  if (typeof value !== "string") {
    return false;
  }

  // Check if the string contains at least one digit
  return /\d/.test(value);
};

// handling new product post
router.post(
  "/product",
  [
    body("name").custom(async (value, { req }) => {
      const duplciate = await Product.findOne({ name: value });
      if (value !== req.body.oldName && duplciate) {
        throw new Error("Product exists already!");
      }
      return true;
    }),
    body("price")
      .custom(isStringNumeric)
      .withMessage("Price must be a string representation of a number"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (req.user && req.user.name === "admin") {
      layout = "layouts/admin-login"; // Set admin layout if user is admin
    } else {
      layout = "layouts/login-layout"; // Set customer layout by default
    }
    if (!errors.isEmpty()) {
      res.render("./admin-page/add-product", {
        activePage: "data",
        layout,
        errors: errors.array(),
      });
    } else {
      Product.insertMany(req.body)
        .then((result) => {
          req.flash("success_msg", "Product added!");
          res.redirect("/product/add");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
);

// delete product
router.delete("/product", (req, res) => {
  Product.deleteOne({ name: req.body.name }).then((result) => {
    req.flash("success_msg", "Successfuly Deleted Product!");
    res.redirect("/product");
  });
});

// edit product
router.get("/product/edit/:name", ensureAuthenticated, async (req, res) => {
  const product = await Product.findOne({ name: req.params.name });
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./admin-page/edit-product", {
    activePage: "data",
    layout,
    product,
  });
});

// handling product update
router.put(
  "/product",
  [
    body("name").custom(async (value, { req }) => {
      const duplciate = await Product.findOne({ name: value });
      if (value !== req.body.oldName && duplciate) {
        throw new Error("Product exists already!");
      }
      return true;
    }),
    body("price")
      .custom(isStringNumeric)
      .withMessage("Price must be a string representation of a number"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (req.user && req.user.name === "admin") {
      layout = "layouts/admin-login"; // Set admin layout if user is admin
    } else {
      layout = "layouts/login-layout"; // Set customer layout by default
    }
    if (!errors.isEmpty()) {
      res.render("./admin-page/edit-product", {
        activePage: "data",
        layout,
        errors: errors.array(),
        product: req.body,
      });
    } else {
      Product.updateOne(
        { _id: req.body._id },
        {
          $set: {
            brand: req.body.brand,
            name: req.body.name,
            price: req.body.price,
            image: req.body.image,
            cpu: req.body.cpu,
            gpu: req.body.gpu,
            memory: req.body.memory,
            storage: req.body.storage,
            display: req.body.display,
            quantity: req.body.quantity,
          },
        }
      ).then((result) => {
        req.flash("success_msg", "Successfully Updated Product!");
        res.redirect("/product");
      });
    }
  }
);

// detail product for admin
router.get("/product/:name", ensureAuthenticated, async (req, res) => {
  const product = await Product.findOne({ name: req.params.name });
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./admin-page/p-detail", {
    activePage: "data",
    layout,
    product,
  });
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./admin-page/dashboard", {
    activePage: "dashboard",
    layout,
  });
});

// ******USER REQUEST****** //

router.get("/request-form", (req, res) => {
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  let input = {};
  // Check if the user is logged in
  if (!req.user) {
    req.flash("error_msg", "You need to log in to sell a product.");
    return res.redirect("/login");
  }

  res.render("./user-page/request-form", {
    activePage: "",
    layout,
  });
});

router.get("/user-requests", ensureAuthenticated, async (req, res) => {
  const requests = await Request.find();
  res.render("./admin-page/manage-request", {
    activePage: "dashboard",
    layout: "layouts/admin-login",
    requests,
  });
});

router.post(
  "/request",
  [
    body("email").custom(async (value, { req }) => {
      if (value !== req.user.email) {
        throw new Error("You can only sell products with your own email.");
      }
      return true;
    }),
    body("price")
      .isNumeric()
      .withMessage("Price must be a numeric value")
      .custom((value) => {
        if (parseFloat(value) <= 0) {
          throw new Error("Price must be greater than 0");
        }
        return true;
      }),
  ],
  async (req, res) => {
    const {
      email,
      name,
      price,
      image,
      cpu,
      gpu,
      memory,
      storage,
      display,
      quantity,
    } = req.body;
    const errors = validationResult(req);
    // Check if the email provided matches the currently logged-in user's email
    // if (req.user.email !== email) {
    //   req.flash("error_msg", "You can only sell products with your own email.");
    //   return res.redirect("/request-form");
    // }

    if (!errors.isEmpty()) {
      res.render("./user-page/request-form", {
        activePage: "",
        layout: "layouts/login-layout",
        errors: errors.array(),
        input: req.body,
      });
    } else {
      try {
        // Check if the product already exists in the request database
        const existingRequest = await Request.findOne({ email, name });
        if (existingRequest) {
          // If the product exists, update the quantity
          existingRequest.quantity += quantity;
          await existingRequest.save();
          req.flash("success_msg", "Product quantity updated successfully.");
        } else {
          // If the product does not exist, create a new request
          const request = new Request({
            email,
            name,
            price,
            image,
            cpu,
            gpu,
            memory,
            storage,
            display,
            quantity,
          });
          await request.save();
          req.flash(
            "success_msg",
            "Your product request has been submitted successfully."
          );
        }
        res.redirect("/request-form");
      } catch (err) {
        console.error(err);
        req.flash("error_msg", "Something went wrong. Please try again later.");
        res.redirect("/request-form");
      }
    }
  }
);

router.post("/to-product", async (req, res) => {
  // const requestId = req.body._id;

  try {
    // Find the request by ID
    const request = await Request.findById(req.body._id);

    // Check if the request exists
    // if (!request) {
    //   req.flash("error_msg", "Request not found.");
    //   return res.redirect("/"); // Redirect to the homepage or appropriate page
    // }

    // Check if the product already exists in the product database
    const existingProduct = await Product.findOne({ name: request.name });

    if (existingProduct) {
      // If the product exists, update the quantity and other fields as per the conditions
      existingProduct.quantity += request.quantity;
      // Update other fields if necessary (e.g., price)
      // For example, if the price in the request and product is different, use the price from the product database
      // In this case, let's assume we're updating the price by increasing it by 10%
      // existingProduct.price = existingProduct.price * 1.1; // Increase price by 10%
      await existingProduct.save();
      req.flash("success_msg", "Product approved and added to the database.");
    } else {
      // If the product does not exist, create a new product in the product database
      const newProduct = new Product({
        name: request.name,
        price: Math.round(request.price * 1.1), // Increase price by 10%
        // Copy other fields from the request
        image: request.image,
        cpu: request.cpu,
        gpu: request.gpu,
        memory: request.memory,
        storage: request.storage,
        display: request.display,
        quantity: request.quantity,
      });
      await newProduct.save();
      req.flash("success_msg", "Product added to database.");
    }

    // Once the product is added to the product database, delete the request
    await Request.findByIdAndDelete(req.body._id);

    res.redirect("/product"); // Redirect to the appropriate page
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong. Please try again later.");
    res.redirect("/"); // Redirect to the appropriate page
  }
});

router.delete("/request", (req, res) => {
  Request.deleteOne({ _id: req.body._id }).then((result) => {
    req.flash("success_msg", "Succesfully reject product sell request!");
    res.redirect("/user-requests");
  });
});

// ******USER REQUEST****** //

// ******CART****** //

router.get("/cart", (req, res) => {
  let items = [];
  if (typeof req.user !== "undefined") {
    items = req.user.cart;
  }
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./user-page/cart", {
    activePage: "cart",
    layout,
    items,
  });
});

router.post("/cart", async (req, res) => {
  const { id, productName, image, quantity, totalPrice } = req.body;
  let errors = [];
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  // Check if user is logged in
  if (typeof req.user === "undefined") {
    errors.push({
      msg: "You need to log in first before adding items to the cart!",
    });
    return res.render("./user-page/profile-page", {
      activePage: "profile",
      layout,
      errors,
      user: req.user,
    });
  }

  try {
    let updatedCart = req.user.cart;
    let itemExists = false;

    // Check if item already exists in the cart
    updatedCart.forEach((item) => {
      if (item.id === id) {
        // Update quantity of existing item
        item.quantity += parseInt(quantity);
        itemExists = true;
      }
    });

    // If item doesn't exist, add it to the cart
    if (!itemExists) {
      updatedCart.push(req.body);
    }

    // Update user's cart
    await User.updateOne(
      { _id: req.user._id },
      { $set: { cart: updatedCart } }
    );

    req.flash("success_msg", "Item(s) successfully added to cart!");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding item to cart:", error);
    errors.push({
      msg: "An error occurred while adding item(s) to the cart. Please try again later.",
    });
    if (req.user && req.user.name === "admin") {
      layout = "layouts/admin-login"; // Set admin layout if user is admin
    } else {
      layout = "layouts/login-layout"; // Set customer layout by default
    }
    res.render("./user-page/profile-page", {
      activePage: "profile",
      layout,
      errors,
      user: req.user,
    });
  }
});

router.delete("/cart/clear", async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      if (user.cart.length === 0) {
        req.flash("error_msg", "Cart is already empty");
        return res.redirect("/cart"); // Redirect back to the cart page
      }

      user.cart = [];
      await user.save();
      req.flash("success_msg", "Cart cleared successfully");
      res.redirect("/cart");
    } else {
      req.flash("error_msg", "Cart is already empty");
      return res.redirect("/cart"); // Redirect back to the cart page
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    req.flash("error_msg", "An error occurred while clearing the cart");
    res.redirect("/cart");
  }
});

router.delete("/cart/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Assuming you have a User model with a cart field containing an array of items
    const user = await User.findById(req.user._id);

    // Filter out the item to be deleted from the cart array
    user.cart = user.cart.filter((item) => item.id !== itemId);

    // Save the updated user object
    await user.save();

    req.flash("success_msg", "Item(s) succesfully deleted from cart!");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cart/decrement/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Find the user by ID
    const user = await User.findById(req.user._id);

    // Find the item in the cart by its ID
    const item = user.cart.find((item) => item.id === itemId);

    // Decrement the quantity
    if (item.quantity > 1) {
      item.quantity--;
    }

    // Save the updated user object
    await user.save();

    res.redirect("/cart");
  } catch (error) {
    console.error("Error decrementing quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cart/increment/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Find the user by ID
    const user = await User.findById(req.user._id);

    // Find the item in the cart by its ID
    const item = user.cart.find((item) => item.id === itemId);

    // Increment the quantity
    item.quantity++;

    // Save the updated user object
    await user.save();

    res.redirect("/cart");
  } catch (error) {
    console.error("Error incrementing quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ******CART****** //

// ******ORDER****** //

router.get("/order", (req, res) => {
  let orders = [];
  if (typeof req.user !== "undefined") {
    orders = req.user.order;
  }
  res.render("./user-page/order", {
    activePage: "order",
    layout: "layouts/login-layout",
    orders,
  });
});

router.get("/orders", ensureAuthenticated, async (req, res) => {
  const orders = await Order.find();
  res.render("./admin-page/manage-order", {
    activePage: "order",
    layout: "layouts/admin-login",
    orders,
  });
});

router.post("/checkout", async (req, res) => {
  try {
    // Step 1: Retrieve user's cart items
    const cartItems = req.user.cart;

    // Step 2: Process each item in the cart
    for (const cartItem of cartItems) {
      // Retrieve product from the database
      const product = await Product.findById(cartItem.id);
      if (!product) {
        throw new Error(`Product with ID ${cartItem.id} not found.`);
      }

      // Check if the requested quantity exceeds available stock
      if (product.quantity < cartItem.quantity) {
        req.flash(
          "error_msg",
          `Requested quantity of ${cartItem.productName} exceeds available stock.`
        );
        res.redirect("/cart");
        return;
      }

      // Update product quantity in the database
      product.quantity -= cartItem.quantity;
      await product.save();

      // Map cartItem data to fit the OrderSchema in the user's document
      const orderItemData = {
        id: cartItem.id,
        productName: cartItem.productName,
        image: cartItem.image,
        quantity: cartItem.quantity,
        totalPrice: cartItem.totalPrice,
      };

      // Create an order object and save it to the order database
      const orderItem = new Order({
        email: req.user.email,
        cart: [orderItemData],
      });
      await orderItem.save();

      const userOrder = {
        items: orderItemData,
        orderStatus: "In progess",
      };

      // Save the order to the user's document in the user database
      req.user.order.push(userOrder); // Assuming req.user.order is the array of orders in the user document
    }

    // Step 3: Empty user's cart
    req.user.cart = [];
    await req.user.save();

    // Respond with a success message or redirect to a confirmation page
    req.flash("success_msg", "Order placed successfully.");
    res.redirect("/cart");
  } catch (error) {
    // Handle any errors
    console.error("Error during checkout:", error);
    req.flash("error_msg", "Failed to checkout. Please try again later.");
    res.redirect("/cart");
  }
});

router.delete("/ship", async (req, res) => {
  try {
    const orderId = req.body.id;
    const userEmail = req.body.email; // Assuming user email is available in req.user

    // Find the user by email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Find the order to update by its item ID
    const orderToUpdate = user.order.find(
      (order) =>
        order.items.some((item) => item.id === orderId) &&
        order.orderStatus === "In progess"
    );

    if (!orderToUpdate) {
      return res.status(404).send("Order not found");
    }

    // Update the order status
    orderToUpdate.orderStatus = "Shipped";

    // Save the updated user
    await user.save();

    // Delete the order from the order database
    await Order.deleteOne({ "cart.id": orderId });

    req.flash("success_msg", "Product shipped!");
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.put("/finish", async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have the user ID in req.user

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the order to update by its ID
    const orderToUpdate = user.order.find(
      (order) => order._id.toString() === req.body._id
    );

    if (!orderToUpdate) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order status
    orderToUpdate.orderStatus = "Finished"; // Assuming the status to set is "Finished"
    orderToUpdate.orderFinish = new Date().toLocaleString(); // Update the order finish time

    // Save the updated user
    await user.save();

    res.redirect("/order");
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      error: "Failed to update order status. Please try again later.",
    });
  }
});

router.delete("/order", async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have the user ID in req.user

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the order to delete
    const orderIndex = user.order.findIndex(
      (order) => order._id.toString() === req.body._id
    );

    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Remove the order from the user's order array
    user.order.splice(orderIndex, 1);

    // Save the updated user
    await user.save();

    res.redirect("/order");
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({ error: "Failed to delete order. Please try again later." });
  }
});

// ******ORDER****** //

// ******USER****** //

router.get("/account", ensureAuthenticated, async (req, res) => {
  const users = await User.find();
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./admin-page/manage-account", {
    activePage: "profile",
    layout,
    users,
  });
});

router.get("/account/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./admin-page/edit-account", {
    activePage: "account",
    layout,
    user,
  });
});

router.put(
  "/account",
  [
    body("name").notEmpty().withMessage("Please enter your name"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
    body("email").custom(async (value, { req }) => {
      const duplciate = await User.findOne({ email: value });
      if (value !== req.body.oldEmail && duplciate) {
        throw new Error("Email registered already!");
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (req.user && req.user.name === "admin") {
      layout = "layouts/admin-login"; // Set admin layout if user is admin
    } else {
      layout = "layouts/login-layout"; // Set customer layout by default
    }
    if (!errors.isEmpty()) {
      res.render("./admin-page/edit-account", {
        activePage: "account",
        layout,
        errors: errors.array(),
        user: req.body,
      });
    } else {
      let { name, email, password, password2 } = req.body;
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          password = hash;
          User.updateOne(
            { _id: req.body._id },
            {
              $set: {
                name,
                email,
                password,
              },
            }
          ).then((result) => {
            req.flash("success_msg", "Successfully Updated Account!");
            if (req.user.name === "admin") {
              res.redirect("/account");
            } else {
              res.redirect("/profile");
            }
          });
        });
      });
    }
  }
);

router.delete("/account", (req, res) => {
  User.deleteOne({ email: req.body.email }).then((result) => {
    req.flash("success_msg", "Successfuly Deleted Account!");
    if (req.user.name === "admin") {
      res.redirect("/account");
    } else {
      res.redirect("/profile");
    }
  });
  // console.log(req.body.email)
});

// ******USER****** //

// login page
router.get("/login", (req, res) => {
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./user-page/login", {
    activePage: "login",
    layout,
  });
});

// register page
router.get("/register", (req, res) => {
  if (req.user && req.user.name === "admin") {
    layout = "layouts/admin-login"; // Set admin layout if user is admin
  } else {
    layout = "layouts/login-layout"; // Set customer layout by default
  }
  res.render("./user-page/register", {
    activePage: "login",
    layout,
  });
});

// register handle
router.post("/register", (req, res) => {
  const { name, email, password, password2, phone } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    if (req.user && req.user.name === "admin") {
      layout = "layouts/admin-login"; // Set admin layout if user is admin
    } else {
      layout = "layouts/login-layout"; // Set customer layout by default
    }
    res.render("register", {
      activePage: "login",
      layout,
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    if (req.user && req.user.name === "admin") {
      layout = "layouts/admin-login"; // Set admin layout if user is admin
    } else {
      layout = "layouts/login-layout"; // Set customer layout by default
    }
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          activePage: "login",
          layout,
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hash
            newUser.password = hash;
            // Save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out.");
    res.redirect("/profile");
  });
});

module.exports = router;
