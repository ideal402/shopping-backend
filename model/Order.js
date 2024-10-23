const mongoose = require("mongoose");
const Product = require("./Product");
const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required:true},
    status: { type: String, default:"preparing"},
    shipTo:{ type: String, required: true },
    contact:{ type: String, required: true },
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

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
