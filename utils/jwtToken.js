
import jwt from 'jsonwebtoken';
import connection from '../config.js';

const con = await connection();



const sendTokenAdmin = (admin, statusCode, res)=>{

    const token =  getJWTToken(admin.id); 


    //options for tokens  
        const options = {
            expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000
            ), 
            httpOnly:true
        }                 
    res.status(statusCode).cookie('token',token,options).redirect('/') 

    //    if (req.headers['user-agent'].includes('Mozilla')) {
    //     res.status(statusCode).cookie('token',token,options).redirect('/') 
        
    // }else {     

    //     res.status(statusCode).cookie('token',token,options).json({message: 'API loaded successfully with token'})
    //   }
    
       
}





// Creating Token and saving in Cookie for user 
const sendTokenUser = (user, statusCode, res)=>{

    
    const token =  getJWTToken(user.id); 

    //options for tokens  
        const options = {
            expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000
            ), 
            httpOnly:true
        }                 
        //res.redirect('/user/home/')
      
       res.status(statusCode).cookie('token',token,options).json({ result: "success","user_id":user.id,"JWT":token});   
    
       
}

function getJWTToken(id){ 
   
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    })
}



export {sendTokenUser , sendTokenAdmin  }