const mongoose=require('mongoose');
const Joi=require('joi');
Joi.objectId=require('joi-objectid')(Joi);
const cartSchema=new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    items:[{
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
          }
    }]
});

const Cart=mongoose.model('cart',cartSchema);

function validateJoi(a){
    const schema=Joi.object({
        userID:Joi.objectId().required(),
        productID:Joi.objectId().required(), 
        quantity:Joi.number().required(), 
    })
    return schema.validate(a);
} 
exports.validateJoi = validateJoi
exports.Cart = Cart;
