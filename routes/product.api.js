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
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdmin,
  productController.updateProduct
);

module.exports = router;
