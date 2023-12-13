const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
// const {Product}=require('./products');
const orderSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: String,
  paymentStatus: String,
  deliveryStatus: String,
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  }
});

// orderSchema.post('update', async function (result, next) {
//   try {
//       const doc = await this.model.findOne(this.getQuery());
//       if (doc.paymentStatus === 'unpaid' && result.paymentStatus === 'paid') {
//           const incrementValue = doc.quantity || 1;
//           await Product.findByIdAndUpdate(doc.productID, { $inc: { salesCount: incrementValue } });
//       }
//       next();
//   } catch (error) {
//       next(error);
//   }
// });
const Order = mongoose.model("order", orderSchema);

function validateJoi(a) {
  const schema = Joi.object({
    userID: Joi.objectId().required(),
    paymentStatus: Joi.string().required(),
    deliveryStatus: Joi.string().required(),
    productID: Joi.objectId().required(),
    quantity: Joi.number().required(),
  });
  return schema.validate(a);
}


exports.validateJoi = validateJoi;
exports.Order = Order;

