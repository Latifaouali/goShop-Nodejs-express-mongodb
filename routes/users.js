const express=require('express');
const {User} =require('../models/user');

const router=express.Router();
router.use(express.json());

router.get('/',async (req,res)=>{
    const users= await User.find().select('-password');
    res.json(users);
});

module.exports=router;