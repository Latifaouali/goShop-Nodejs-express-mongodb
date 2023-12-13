const mongoose=require('mongoose');
const Joi=require('joi')

const contactSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    }
});

const Contact=mongoose.model('contact',contactSchema);

function validateJoi(a){
    const schema=Joi.object({
        email:Joi.string().required().email(),
        subject:Joi.string().required(), 
        message:Joi.string().required(), 
    })
    return schema.validate(a);
} 

exports.Contact=Contact;
exports.validateJoi=validateJoi;