const auth = require("../middleware/auth");
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { Product, validateJoi } = require("../models/products");
const { User } = require("../models/user");
const { Order } = require("../models/orders");
const {Review} =require('../models/review');
router.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/");
  },
  filename: (req, file, cb) => {
    const originalFileName = file.originalname;
    const uniqueFileName = Date.now() + path.extname(originalFileName);
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ _id: -1 });
  res.send(products);
});

router.get('/popularProducts',async(req,res)=>{
  const highestRatedProducts =await Review.aggregate([
    {
      $group: {
        _id: "$productID",
        averageRating: { $avg: { $ifNull: ["$rating", 0] } },
      },
    },
    {
      $sort: { averageRating: -1 },
    },
    {
      $limit: 10, 
    }
  ]);

  const popularProduct=await Product.populate(highestRatedProducts, { path: "_id" });
  res.json(popularProduct);
})

router.get('/sales-summary', async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          paymentStatus: 'paid', 
        },
      },
      {
        $lookup: {
          from: 'products', 
          localField: 'productID',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$quantity' },
          totalMoney: { $sum: { $multiply: ['$quantity', '$product.price'] } },
        },
      },
    ];
    const result = await Order.aggregate(pipeline);
    const totalSales = result[0]?.totalSales || 0;
    const totalMoney = result[0]?.totalMoney || 0;
    res.json({ totalSales, totalMoney });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if(!product) return res.status(404).send({error:'no product found'});
  res.json(product);
});

router.post("/", auth, upload.single("picture"), async (req, res) => {
  try {
    const { error } = validateJoi(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let user = await User.findById(req.body.sellerID);
    if (!user) return res.status(404).json({ error: "user not found" });
    const product = new Product({
      name: req.body.name,
      sellerID: req.body.sellerID,
      picture: req.file.filename,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      salesCount:req.body.salesCount
    });

    await product.save();

    res.status(200).json("product is added successfuly");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.put('/:id', upload.single('newValue') ,async (req, res) => {
  try {

    const productId = req.params.id;
    const labelToUpdate = req.body.labelToUpdate;
    let newValue='';

    const updateQuery = {};
    if (labelToUpdate === 'picture') {
      newValue=req.file.filename
    } else {
       newValue = req.body.newValue;
    }

    updateQuery[labelToUpdate] = newValue;

    const product = await Product.findByIdAndUpdate(
      productId,
      updateQuery,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:productID',auth,async(req,res)=>{
  try{
  const product=await Product.findByIdAndRemove(req.params.productID);
  if(!product) return res.status(400).json({error:'no product found'});
  res.json({message:'product deleted successfully'});
  }
  catch(error){
    res.status(500).json({error:'Internal server error'});
    console.error(error);
  }
})

module.exports = router;
