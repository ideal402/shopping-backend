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
    let query = Product.find(cond).sort({ createdAt: -1 });
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
      { new: true }
    );
    if (!product) {
      throw new Error("can not find product");
    }
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const response = await Product.findByIdAndDelete(productId);
    if (!response) {
      throw new Error("상품을 삭제하지 못했습니다.");
    }
    res.status(200).json({ status: "success", response });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("상품을 가져오지 못했습니다.");
    }
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.checkStock = async (item) => {
  const product = await Product.findById(item.productId);
  
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size} 재고가 부족합니다.`,
    };
  }

  return { isVerify: true, product };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];
  const productToUpdate = [];

  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }else{
        productToUpdate.push({
          product: stockCheck.product,
          size: item.size,
          qty: item.qty,
        });
      }
    })
  );

  if (insufficientStockItems.length > 0) {
    return insufficientStockItems;
  }

  await Promise.all(
    productToUpdate.map(async ({ product, size, qty }) => {
      const newStock = { ...product.stock };
      console.log("🚀 ~ productToUpdate.map ~ newStock:", newStock)
      newStock[size] -= qty;
      product.stock = newStock;
      await product.save();
    })
  );

  return insufficientStockItems;
};

module.exports = productController;
