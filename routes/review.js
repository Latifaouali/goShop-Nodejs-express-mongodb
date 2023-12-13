const auth = require("../middleware/auth.js");
const express = require("express");
const moment = require("moment");
const { Review, validateJoi } = require("../models/review.js");
const { Product } = require("../models/products.js");
const router = express.Router();

router.get("/", async (req, res) => {
  const reviews = await Review.find().sort({ _id: -1 });
  res.send(reviews);
});

router.post("/", auth, async (req, res) => {
  try {
    const { error } = validateJoi(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let product = await Product.findById(req.body.productID);
    if (!product) return res.status(404).json({ error: "product not found" });

    const review = new Review({
      userID: req.body.userID,
      productID: req.body.productID,
      comment: req.body.comment,
      rating: req.body.rating,
      date: moment().format("MMMM DD, YYYY"),
    });
    await review.save();

    res.status(200).json("review is added successfuly");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:reviewID", auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndRemove(req.params.reviewID);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Iternal Server Error" });
  }
});

module.exports = router;
