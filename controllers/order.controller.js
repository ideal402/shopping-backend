const mongoose = require("mongoose");
const orderController = {};
const Order = require("../model/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

orderController.createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("🚀 ~ orderController.createOrder= ~ req.body:", req.body);

    const { shipTo, contact, totalPrice, orderList } = req.body;

    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems
        .map((item) => item.message)
        .join(" ");
      throw new Error(errorMessage);
    }

    const items = orderList.map((item) => ({
      ProductId: item.productId,
      size: item.size,
      qty: item.qty,
      price: item.price,
    }));

    const newOrder = new Order({
      userId,
      shipTo,
      contact,
      totalPrice,
      items: items,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();

    res.status(200).json({ status: "success", data: newOrder.orderNum });
  } catch (error) {
    console.log("🚀 ~ orderController.createOrder= ~ error:", error);
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
