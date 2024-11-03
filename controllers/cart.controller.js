const cartController = {};
const { populate } = require("dotenv");
const Cart = require("../model/Cart");

cartController.addItemToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, size, qty } = req.body;

    let cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }

    const existItem = cart.items.find(
      (item) => item.productId._id.equals(productId) && item.size === size
    );
    if (existItem) {
      throw new Error("이미 담겨진 아이템입니다.");
    }

    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();

    res
      .status(200)
      .json({ status: "success", data: cart, cartItemsQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId: userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    if (!cart) throw new Error("카트를 찾을 수 없습니다.");

    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.deleteItem = async (req, res) => {
  try {
    const userId = req.userId;
    const cartId = req.params.id;

    const cart = await Cart.findOne({ userId: userId });
    if (!cart) throw new Error("카트를 찾을 수 없습니다.");

    cart.items = cart.items.filter((item) => !item._id.equals(cartId));

    await cart.save();

    res.status(200).json({
      status: "success",
      cartItemsQty: cart.items.length,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.updateQty = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const qty = req.body.value;

    const cart = await Cart.findOne({ userId: userId });
    if (!cart) throw new Error("카트를 찾을 수 없습니다.");

    const index = cart.items.findIndex((item) => item._id.equals(id));
    if (index === -1) throw new Error("선택한 항목을 찾을 수 없습니다.");


    cart.items[index].qty = qty
    

    await cart.save();
    
    res.status(200).json({ status: 200, data: cart.items });
    
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
}

cartController.getCartQty = async (req,res) => {
  try {
    const userId = req.userId
    const cart = await Cart.findOne({userId:userId});
    if (!cart) throw new Error("카트를 찾을 수 없습니다.");
    
    res.status(200).json({ status: 200, data: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
    
  }
}

module.exports = cartController;
