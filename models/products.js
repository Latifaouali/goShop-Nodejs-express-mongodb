const Joi=require('Joi');
Joi.objectId=require('joi-objectid')(Joi);
const mongoose=require('mongoose');

//products Schema
const productSchema=new mongoose.Schema({
    sellerID:{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'user' 
    },
    name:{
        type:String,
        required:true
    },
    picture:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    salesCount: {
        type: Number,
        default: 0,
    },
});

const Product=mongoose.model('product',productSchema);

//validation function

function validateJoi(a){
    const schema=Joi.object({
        name:Joi.string().required(),
        sellerID:Joi.objectId().required(),
        picture:Joi.any(),
        price:Joi.number().required(),
        description:Joi.string().required(),
        category:Joi.string().required(),
        salesCount:Joi.number().required(),
    })
    return schema.validate(a);
}

exports.Product=Product;
exports.validateJoi=validateJoi;

