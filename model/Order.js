const mongoose = require("mongoose");
const Product = require("./Product");
const User = require("./User");
const Cart = require("./Cart");
const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required:true},
    status: { type: String, default:"preparing"},
    shipTo:{
      address:{ type: String, required: true },
      city:{ type: String, required: true },
      zip:{ type: String, required: true },
    },
    contact:{
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      contact: { type: String, required: true },
    },
    totalPrice:{ type: Number, required: true, default:0 },
    orderNum: {type: String},
    items: [
      {
        ProductId: { type: mongoose.ObjectId, ref: Product, required:true },
        size: { type: String, required: true },
        qty: { type: Number, required:true, default: 1 },
        price:{ type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;

  return obj;
};
orderSchema.post("save", async function () {
 const cart = await Cart.findOne({userId:this.userId})
 cart.items = [];
 await cart.save();
})
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
