const express=require('express');
const moment = require("moment");
const router=express.Router();
const {Order,validateJoi} =require('../models/orders');
const { User} = require("../models/user");
const {Product}=require('../models/products');
router.get('/',async(req,res)=>{
    const orders=await Order.find().sort({_id:-1});
    res.send(orders);
})

router.get('/:userID', async (req, res) => {
    try{
        const order= await Order.find({
            userID:req.params.userID
        }).populate({
            path:'productID',
            options: { strictPopulate: false },
        });
        res.json(order);
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: 'Internal server error'})
    }
});

router.get('/seller/:sellerId', async (req, res) => {
    const sellerId = req.params.sellerId;
  
    try {
      const sellerProducts = await Product.find({ sellerID: sellerId }).select('_id');
      const orders = await Order.find({ productID: { $in: sellerProducts } })
        .populate('productID') 
        .populate('userID')    
        .exec();
      res.json(orders);
    } catch (error) {
      console.error('Error getting orders for seller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/order/:orderID',async(req,res)=>{
    try{
        const order=await Order.findById(req.params.orderID).populate('productID') 
        .populate('userID')    
        .exec();
        if(!order) return res.status(404).json({error:'no order found'});
        res.json(order);
    }catch(error){
        res.status(500).json({error:'Internal Server error'});
        console.error(error)
    }
})

router.post('/',async(req,res)=>{
    try{
        const {error} = validateJoi(req.body)
        if(error) return res.status(400).json({error: error.details[0].message})
        
        const user= await User.findById(req.body.userID);
        if(!user)  return res.status(404).json({error:'no user found'});

        const order=new Order({
            userID:req.body.userID,
            date: moment().format("MMMM DD, YYYY"),
            paymentStatus:req.body.paymentStatus,
            deliveryStatus:req.body.deliveryStatus,
            productID: req.body.productID,
            quantity: req.body.quantity,
        });
        await order.save();

        res.status(200).json("order is added successfuly");
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.put('/order/:orderID',async(req,res)=>{
    try{
    // const {error} = validateJoi(req.body);
    // if(error) return res.status(400).json({error: error.dtails[0].message});

    const order=await Order.findById(req.params.orderID)
                           .populate('userID')
                           .populate('productID')
                           .exec();
    if(!order) return res.status(404).json({error:'order not found'});

    if(req.body.paymentStatus === 'paid'){
        const incrementValue = order.quantity || 1;
        await Product.findByIdAndUpdate(order.productID, { $inc: { salesCount: incrementValue } });
    }

    if(req.body.paymentStatus) order.paymentStatus=req.body.paymentStatus;
    if(req.body.deliveryStatus) order.deliveryStatus=req.body.deliveryStatus;

    await order.save();
    res.send(order);}
    catch(error){
        res.status(500).json({error: 'Internal Server error'});
        console.error(error);
    }
})

module.exports=router;