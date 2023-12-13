const mongoose=require('mongoose');
const Joi =require('joi');
const jwt=require('jsonwebtoken');
const config=require('config');

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        minlength:5,
        maxlength:30
    },
    picture:String,
    email:{
        type:String,
        minlength:5,
        maxlength:255,
        unique:true,
    },
    address:{
        type:String,
        minlength:10,
        maxlength:255,
    },
    phone:{
        type: String,
        minLength: [10, "Phone number should have a minimum of 10 digits"],
        maxLength: [10, "Phone number should have a maximum of 10 digits"],
        match: [/^\d{10}$/, "Phone number should only have 10 digits"]
    },
    password:{
        type:String,
        required:true,
        minlength:5,
        maxlength:1024
    },
    isSeller:Boolean
});

userSchema.methods.generateAuthToken=function(){
    const token=jwt.sign({_id:this._id,isSeller:this.isSeller},config.get('VARjwtPrivateKey')); 
    return token; 
}

const User=mongoose.model('user',userSchema);

function validateJoi(user){
    const Schema=Joi.object({
        userName:Joi.string().min(5).max(30).required(),
        picture:Joi.string(),
        email:Joi.string().min(5).max(255).required().email(),
        address:Joi.string().min(10).max(255).allow(null),
        phone: Joi.string().min(10).max(10).pattern(/^\d{10}$/)
        .allow(null)
        .messages({
          'string.min': 'Phone number should have a minimum of 10 digits',
          'string.max': 'Phone number should have a maximum of 10 digits',
          'string.pattern.base': 'Phone number should only have 10 digits',
        }),
        password:Joi.string().min(5).max(1024).required(),
        isSeller:Joi.boolean()
    });
    return Schema.validate(user)
}

exports.User=User;
exports.validateJoi=validateJoi;
exports.userSchema=userSchema;
