const mongoose = require("mongoose");
const orderController = {};
const Order = require("../model/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const { populate } = require("dotenv");

orderController.createOrder = async (req, res) => {
  try {
    const userId = req.userId;

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
      productId: item.productId,
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
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const order = await Order.find({ userId: userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!order) throw new Error("주문을 찾을 수 없습니다.");

    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
