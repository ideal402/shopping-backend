const mongoose = require("mongoose");
const orderController = {};
const Order = require("../model/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const { populate } = require("dotenv");
const PAGE_SIZE = 3;

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

    const totalItemNumber = await Order.countDocuments({ userId });

    const totalPageNum = Math.ceil(totalItemNumber / PAGE_SIZE);

    res.status(200).json({ status: "success", data: order, totalPageNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page, orderNum } = req.query;

    const cond = orderNum
      ? { orderNum: { $regex: orderNum, $options: "i" } }
      : {};
    let query = Order.find(cond)
      .populate("userId")
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
        },
      })
      .sort({ createdAt: -1 });

    let response = { status: "success" };
    if (page) {
      query.skip(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE);
      const totalItemNumber = await Order.find(cond).countDocuments();
      const totalPageNum = Math.ceil(totalItemNumber / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const orderList = await query.exec();
    response.data = orderList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const orderId= req.params._id
    const {status} = req.body
    
    const order = await Order.findById(orderId);
    if(!order) throw new Error("주문을 찾을 수 없습니다.");

    order.status = status

    await order.save()

    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
}
module.exports = orderController;
