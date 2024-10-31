const Product = require("../model/Product");

const productController = {};
const PAGE_SIZE = 5;
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

productController.getProduct = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(cond);
    let response = { status: "success" };
    if (page) {
      query.skip(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE);
      const totalItemNumber = await Product.find(cond).countDocuments();
      const totalPageNum = Math.ceil(totalItemNumber / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
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
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        sku,
        name,
        image,
        category,
        description,
        price,
        stock,
        status,
        isDelete,
      },
      {new:true}
    );
    if(!product){
      throw new Error("can not find product");
    }
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
