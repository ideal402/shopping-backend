const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authController = require("../controllers/auth.controller");

router.post(
  "/",
  authController.authenticate,
  authController.checkAdmin,
  productController.createProduct
);
router.get("/", productController.getProduct);

module.exports = router;
