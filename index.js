const express=require('express');
const config=require('config')
const app=express();
const cors=require('cors');
const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(cors());

if(!config.get('VARjwtPrivateKey')) {
    console.error('FATAL ERROR: VARjwtPrivateKey is not defined');
    process.exit(1);
}

const mongoose=require('mongoose');
    //connection
mongoose.connect('mongodb://127.0.0.1:27017/goShop')
        .then(()=>{console.log('contected ...')})
        .catch(err=>{console.error('err.message')})


const products=require('./routes/products');
const users=require('./routes/user');
const allUsers=require('./routes/users')
const auth=require('./routes/auth');
const reviews=require('./routes/review');
const whishlists=require('./routes/wishlist');
const carts=require('./routes/cart');
const orders=require('./routes/orders');
const contacts=require('./routes/contact');

app.use('/api/products',products);
app.use('/api/users',users);
app.use('/api/allUsers',allUsers)
app.use('/api/auth',auth)
app.use('/api/reviews',reviews)
app.use('/api/whishlist',whishlists)
app.use('/api/carts',carts);
app.use('/api/orders',orders);
app.use('/api/contacts',contacts);

const port=process.env.PORT||8081;
app.listen(port,()=>console.log(`Server started on port ${port}`));