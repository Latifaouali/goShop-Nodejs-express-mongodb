const Joi=require('joi');
Joi.objectId=require('joi-objectid')(Joi);
const mongoose=require('mongoose');

const reviewSchema=new mongoose.Schema({
    userID:{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    },
    productID:{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'Product' 
    },
    comment:String,
    rating:Number,
    date:String
});

const Review=mongoose.model('review',reviewSchema);

function validateJoi(a){
    const schema=Joi.object({
        userID:Joi.objectId().required(),
        productID:Joi.objectId().required(), 
        comment:Joi.string().required(),
        rating:Joi.number().required()
    })
    return schema.validate(a);
} 

exports.Review=Review;
exports.validateJoi=validateJoi;


