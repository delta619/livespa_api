const config = require('../config/config');


exports.checkAdmin =  async(req , res , next)=>{
    
    if(req.body.token == config.token_backend){
        next();
    }else{
        return res.json({
            status:"failed"
        })
    }
}