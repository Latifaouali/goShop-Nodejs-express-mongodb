const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Wishlist, validateJoi } = require("../models/wishlist");
const { Product } = require("../models/products");
const { User } = require("../models/user");
const mongoose=require('mongoose');

router.get("/", async (req, res) => {
  const wishlists = await Wishlist.find().sort({ _id: -1 });
  res.send(wishlists);
});

router.get("/:userID", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      userID: req.params.userID,
    }).populate({
      path: "items.productID",
      options: { strictPopulate: false },
    });
    res.json(wishlist);   
  } catch (error) {
    console.error("Error retrieving wishlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { error } = validateJoi(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = await User.findById(req.body.userID);
    if (!user) return res.status(404).json({ error: "user not found" });

    const product = await Product.findById(req.body.productID);
    if (!product) return res.status(404).json({ error: "product not found" });

    const whishlist = await Wishlist.findOneAndUpdate(
      { userID: req.body.userID },
      { userID: req.body.userID },
      { upsert: true, new: true }
    );

    whishlist.items.push({ productID: req.body.productID });
    await whishlist.save();

    res.json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:userID/:productID", auth ,async (req, res) => {
  const { userID, productID } = req.params;
  try {
    const productObjectId = new mongoose.Types.ObjectId(productID);

    const result = await Wishlist.findOneAndUpdate(
      { userID: userID },
      { $pull: { items: { productID: productObjectId } } },
      { new: true }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
