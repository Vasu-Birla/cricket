
import jwt from 'jsonwebtoken'
import connection from '../config.js';

const con = await connection();

//authenticate Valid User to access perticualr service & resorce 
const isAuthenticatedAdmin = async(req,res,next)=>{

    const {token }= req.cookies ;

        if(!token){
           return next(res.redirect('/login'));
          // res.render('login1',{'output':'Incorrect Password'})  
        }

        const decodedData = jwt.verify(token,process.env.JWT_SECRET); 

    //    await con.query('SELECT * FROM tbl_admin WHERE id = ?', [decodedData.id], (error, results) => {   
           
    //     req.admin = results[0];
    //     next()
    // }) 
    
    const [results] = await con.query('SELECT * FROM tbl_admin WHERE id = ?', [decodedData.id]);

        req.admin = results[0];
        next();


       
      
}


//Authenticate Admin 

const authorizeRoles = (...roles) =>{
        
    return (req,res,next)=>{
       
        if(!roles.includes(req.admin.role) ){
               // res.json("User not allowed to do this ")
                res.render('login1',{'output':'Your Role is not permitted to Login here !'})  
        }
        else
        {
            next()
        }
    }

}


export {isAuthenticatedAdmin }