const jwt=require('jsonwebtoken');
const config=require('config');

module.exports = function (req,res,next){
    const token=req.header('x-auth-token');
    if(!token) return res.status(401).json({error:'you should logging first'});
    
    try{
    const decoded=jwt.verify(token,config.get('VARjwtPrivateKey'));
    req.user=decoded;
    next();
    }
    catch(ex){
        res.status(400).json({error:'invalid Token'})
    }
}

