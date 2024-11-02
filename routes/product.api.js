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
router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdmin,
  productController.deleteProduct
);

router.get("/:id", productController.getProductDetail);

module.exports = router;
