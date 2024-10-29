const Product = require("../model/Product");

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    let {
      sku,
      name,
      image,
      category,
      description,
      price,
      stock,
      status,
      isDelete,
    } = req.body;

    const product = new Product({
      sku,
      name,
      image,
      category,
      description,
      price,
      stock,
      status,
      isDelete,
    });
    await product.save();

    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
