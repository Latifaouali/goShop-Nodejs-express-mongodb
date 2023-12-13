const mongoose=require('mongoose');
const Joi=require('joi');
Joi.objectId=require('joi-objectid')(Joi);
const wishlistSchema=new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    items:[{
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            required: true
        }
    }]
});

const Wishlist=mongoose.model('wishlist',wishlistSchema);

function validateJoi(a){
    const schema=Joi.object({
        userID:Joi.objectId().required(),
        productID:Joi.objectId().required(), 
    })
    return schema.validate(a);
} 
exports.validateJoi = validateJoi
exports.Wishlist = Wishlist;
