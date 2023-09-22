
import jwt from 'jsonwebtoken'
import connection from '../config.js';

const con = await connection();


//authenticate Valid User to access perticualr service & resorce 
const isAuthenticatedUser = async(req,res,next)=>{
    const con = await connection();

    const {token }= req.cookies ;

        if(!token){
           return res.json("Please Login to use this Service")
          // res.render('login1',{'output':'Incorrect Password'})  
        }

        const decodedData = jwt.verify(token,process.env.JWT_SECRET); 
    
    const [results] = await con.query('SELECT * FROM tbl_user WHERE id = ?', [decodedData.id]);

    console.log(results)

        req.user = results[0];
        next();
     
      
}


//Authenticate Admin 

const authorizeRoles = (...roles) =>{
        
    return (req,res,next)=>{
       
        if(!roles.includes(req.user.role) ){
               // res.json("User not allowed to do this ")
                res.render('login1',{'output':'Your Role is not permitted to Login here !'})  
        }
        else
        {
            next()
        }
    }

}


export {isAuthenticatedUser}