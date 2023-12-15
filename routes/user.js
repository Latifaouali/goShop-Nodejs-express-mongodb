const express=require('express');
const Joi =require('joi');
const auth=require('../middleware/auth')
const _=require('lodash')
const multer = require("multer");
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const {User,validateJoi} =require('../models/user');
const router=express.Router();
router.use(express.json());
const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: 'drw21nboe', 
  api_key: '884996169136445', 
  api_secret: 'lJ1wspCMAQaTO4V50CKrRYkh2ZI' 
});
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

function validateJoiUpdate(user){
  const Schema=Joi.object({
    userName: Joi.string().min(5).max(30),
    picture: Joi.string(),
    address: Joi.string().min(10).max(255),
    phone: Joi.string().min(10).max(10).pattern(/^\d{10}$/)
    });
    return Schema.validate(user)
}


router.get('/me',auth,async (req,res)=>{
    const user= await User.findById(req.user._id).select('-password');
    res.json(user);
});

router.get('/:id',async(req,res)=>{
  const user=await User.findById(req.params.id).select('-password');
  res.json(user)
})
//create new user
router.post('/', async (req, res) => {
    try {
      const {error}=validateJoi(req.body);
      if(error) return res.status(400).json({error:error.details[0].message})
      let user = await User.findOne({$or:[{ email: req.body.email },{ userName: req.body.userName }]});
      if (user) {
        return res.status(400).json({error:'email or userName already existed.'});
      } 
  
      user = new User(_.pick(req.body, ['userName', 'picture', 'email','adress','phone', 'password', 'isSeller']));
      const salt=await bcrypt.genSalt(10);
      user.password=await bcrypt.hash(user.password,salt)
 
      await user.save();
  
      res.status(200).json(_.pick(user, ['userName', 'email']));
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error'); }
});

router.put('/user/:userID',auth, upload.single("picture"),async (req,res)=>{
  try{
  const {error}=validateJoiUpdate(req.body);
  if(error) return res.status(400).json({error:error.details[0].message})
  const user=await User.findById(req.params.userID);
  if(!user) return res.status(404).json({error:'no user found'});

  if (req.body.userName) user.userName = req.body.userName;
  if(req.file){
    user.picture = req.file.filename;}
  if (req.body.address) user.address = req.body.address;
  if (req.body.phone) user.phone = req.body.phone;

  await user.save();
  res.send(user);
 }catch(error){
  console.error(error);
  res.status(500).send('Internal Server Error');
 }
})
 
  
router.put('/:userID', auth, upload.single("picture"), async (req, res) => {
  try {
    const { error } = validateJoiUpdate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findById(req.params.userID);
    if (!user) return res.status(404).json({ error: 'No user found' });

    if (req.body.userName) user.userName = req.body.userName;
    if (req.body.address) user.address = req.body.address;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.file) {
      cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async(error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading file to Cloudinary' });
        }
        user.picture = result.secure_url;
        await user.save();
        res.send(user);
      }).end(req.file.buffer);
    } else {
      await user.save();
      res.send(user);
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports=router;
