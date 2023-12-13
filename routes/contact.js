const express=require('express');
const router=express.Router();
const {Contact,validateJoi }=require('../models/contact');
const _=require('lodash');
router.use(express.json());

router.get('/',async(req,res)=>{
    const contacts=await Contact.find().sort({ _id: -1 });
    res.json(contacts)
});

router.post('/',async(req,res)=>{
    try{
        const {error} =validateJoi(req.body);
        if(error) return res.status(400).json({error:error.details[0].message});

        const contact =new Contact(_.pick(req.body,['email','subject','message']));
        contact.save();
        res.status(200).json(contact);
    }
    catch(error){
        res.status(500).json({error: 'Internal Server error'});
        console.error(error)
    }
})


module.exports=router