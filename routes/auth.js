const express=require('express');
const joi=require('joi');
const bcrypt=require('bcrypt');
const _=require('lodash')
const {User}=require('../models/user')
const router=express.Router();
router.use(express.json());

router.post('/',async (req,res)=>{
    const {error}=validate_log(req.body);
    if(error) return res.status(400).json({error:error.details[0].message});

    let user= await User.findOne({email:req.body.email});
    if(!user) return res.status(400).json({error:'invalid email or password'})

    const validatPassword= await bcrypt.compare(req.body.password,user.password);
    if(!validatPassword) return res.status(400).json({error:'invalid email or password'})

    const token=user.generateAuthToken();
    //res.header('x-auth-token',token).send(_.pick(user,['userName','email']));
    res.header('x-auth-token',token).json({token,user});
});

function validate_log(user){
    const Schema=joi.object({
        email:joi.string().required().email(),
        password:joi.string().required()
})
    return Schema.validate(user);
}
module.exports=router;


