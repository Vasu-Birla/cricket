
import { sendTokenAdmin, sendTokenUser } from '../utils/jwtToken.js';
import connection from '../config.js';

const con = await connection();
import * as path from 'path';
import upload from '../middleware/upload.js';
import paypal from 'paypal-rest-sdk';

paypal.configure({
    mode: 'sandbox', // Replace with 'live' for production
    client_id: 'AYOJoUhYl73jzhMUWhXw7mgmxewV9mLVZAMWa9yNnADGsvwheZ6ILHlENiZyaUoENqH0bFapZ-vQ08q5',
    client_secret: 'EBejIUXmiHwzhzd8BOFgxo1S9SSjdYpLDQlfaLXDikR29b_0soKr1nOjLPoMDSc8TRVBPlgFCNl-1xUo',
  });
  

import {hashPassword, comparePassword, sendMailOTP,  sendSMS } from '../middleware/helper.js'

//-------------------- Register API Start  ------------------------------ 

var otp;
function setValue()
      {
    otp =   Math.random();
      otp = otp * 1000000;
        otp = parseInt(otp);
          console.log(otp);
}


const register = async(req,res,next)=>{
    console.log(req.body)     
  
    var date = Date.now();
    var status = "active";

    req.body.password = hashPassword(req.body.password);

    var lastname=" ";
    var image = " ";
    var imagePath= " ";
    

    const sql = 'INSERT INTO `tbl_user` ( email,countryCode,mobile, firstname, lastname , password, image, imagePath, status, date) VALUES (?,?, ?,?, ?, ?, ?,?,?,?)';

    const values = [ req.body.email,req.body.countryCode,req.body.mobile, req.body.name,lastname, req.body.password,image ,imagePath,status, date];

    const con = await connection(); 

       // Check if the user already exists with the provided email
       const checkUserSql = 'SELECT COUNT(*) as count FROM `tbl_user` WHERE email = ?';
       const checkUserValues = [req.body.email];
       
       const [userResult] = await con.query(checkUserSql, checkUserValues);
       
       if (userResult[0].count > 0) {
           return  res.status(200).json( {result:'Email already exists' });
       }else {
        const [results] = await con.query(sql, values);
        if(results){           
    
                const selectUserSql = 'SELECT * FROM `tbl_user` WHERE id = ?';
                var [[userDetails]] = await con.query(selectUserSql, [results.insertId]);

                 userDetails={...userDetails,"result":"success"}  ; 

                res.json(userDetails);

           // res.status(200).json({ msg: 'SignUP Successfully..!!' });
        }
        else{
            res.json({ result: 'Failed to SignUP ..!' });
    
        }
       }
       
 
   
}
//----------------  Register API End --------------------------

const Login= async(req,res,next)=>{

    const con = await connection(); 

    const {mobile,password} = req.body; 
    //if user don't enter email password
    if(!mobile || !password){
        res.json({ result: "Please Enter Email and Password"});         
        
    }
    else 
    {        

       
        const [results] = await con.query('SELECT * FROM tbl_user WHERE mobile = ?', [mobile]);                 
        const user = results[0];   


         if(!user){           

            return res.json({ result: "Account does not exists !!" });   
          
            }
    
        let isValid = comparePassword( password, user.password );
       if (!isValid) {
            res.json({ result: "Incorrect Password"});             
        
            }
        else { 
                if(user.status == "active") {
                    sendTokenUser(user,200,res)
                } 
                else{
                    res.json({ result: "You Account Has Been Deactivated .!"});   
                }          
               
                
             }  
   
   
    }  

   
}

const Logout = async(req,res,next)=>{     

    res.cookie("token",null,{
        expires : new Date(Date.now()),
        httpOnly:true
    })

    res.json({ result: "logout success" });

}

//---------------------- Login /Logout API end -------------------------------


//---------------------- Forgot Password start  -------------------------------



const ForgotPassword = async(req,res,next)=>{  

    var otp;
function setValue()
      {
    otp =   Math.random();
      otp = otp * 1000000;
        otp = parseInt(otp);
          console.log(otp);
}
    const con = await connection(); 
   

    const {mobile}=req.body;

    setValue();
console.log(otp)

    const body = 'Your CricketPrediction APP Reset Password OTP is -> '+otp;
    

    if(!mobile){
        res.json({ result: "Mobile Required "});         
        
    }else{

        const [[user]] = await con.query('SELECT * FROM tbl_user WHERE mobile = ?', [mobile]); 
        if(!user){           
            
            res.json({ result: "Invalid Mobile" });
          
         } 
        else{
          
            sendSMS(user.countryCode+mobile, body);
           
            res.json({ result: "success","user_id":user.id,otp:otp}); 

        }             
        
    }
    
     

}




//---------------------- Forgot Password End  -------------------------------


//============== Reset Password with the OTP sent from previous post Method  ------------



const resetpassword = async(req,res,next)=>{     
    const con = await connection(); 
    
    var userID= req.body.user_id;   

    var newPassword  = hashPassword(req.body.confirmPass);

    console.log(newPassword);

    //const [results] = await con.query('UPDATE tbl_user SET password = ? WHERE id = ?', [newPassword, userID]);

      const [results] = await con.query('UPDATE tbl_user SET password= ? WHERE id = ?', [newPassword , userID]);
   
    console.log(results)

        if(results){
            res.json({ result: "success" });
        }else{
            res.json({ result: "failed" });
        }
   
}


//-------------------- Product details ------------ 

const getProducts = async(req,res,next)=>{    
    const con = await connection(); 

    const [products] = await con.query('SELECT * FROM tbl_product');
    var userID = req.body.user_id

   
    for (const product of products) {
      
        const productId = product.product_id;    


        var [[result]] =  await con.query('SELECT * FROM tbl_fvt where user_id =? AND product_id = ? AND status = ?',[  userID ,productId, 'like']);
        
        if(result != undefined){
           product.status = 'like';
        }      

}
  
   

    for(let i=0; i<products.length; i++){
        const timestamp = parseInt(products[i].date, 10)
        const date = new Date(timestamp);
        products[i].date = date.toLocaleString();   

    }    
    
    if(products){
       // console.log(products)
        res.json(products)
    }else{
        res.json({"result":"No Product found"})
    }
 
    
}





const prodcutDetails = async(req,res,next)=>{ 
     
    var productID = req.body.id;
    var userID = req.body.user_id
    const con = await connection(); 

    const [[product]] = await con.query('SELECT * FROM tbl_product where product_id =?',[req.body.id]);

    const [[fvt]] = await con.query('SELECT * FROM tbl_fvt WHERE user_id = ? AND product_id = ?', [userID, productID]);
 
    const [sameCollection] = await con.query('SELECT * from tbl_col where product_id = ? ',[productID]); 

    if(fvt){
        product.status = 'like';
    }

    const timestamp = parseInt(product.date, 10)
    const date = new Date(timestamp);
    product.date = date.toLocaleString(); // Format: MM/DD/YYYY, HH:MM:SS AM/PM

    var similarSellers = []; 
    if(sameCollection){

        for (const row of sameCollection) {
      
            const userId = row.user_id;  
            var [[sellers]] = await con.query('SELECT * from tbl_user where id = ? ',[userId]); 

            sellers = {"By_Seller":row.user_id,...sellers,"modname":product.modname}
            similarSellers.push(sellers)
        }  
              
        const indexToRemove = similarSellers.findIndex(user => user.id === parseInt(userID));
        if (indexToRemove !== -1) {
            // Use splice to remove the object from the array
            similarSellers.splice(indexToRemove, 1);
          }        
      
     }
    

   var kilProdut = {...product,"Data":similarSellers}

    if(product){
        res.json(kilProdut); 
    }else{
        res.json({"result":"Failed to fetch Product "})
    }

     
    
}
//------------------Product details end ------------

//--------------------------------------Fvt  Products Section Start -------------------------


const addtoFVT = async(req,res,next)=>{ 

    const con = await connection(); 


    var newStatus ="like"
    var userID = req.body.user_id
    var productID = req.body.product_id
    const [[fvt]] = await con.query('SELECT * FROM tbl_fvt WHERE user_id = ? AND product_id = ?', [userID, productID]);

        if(fvt){

            const [result] = await con.query('DELETE FROM tbl_fvt WHERE user_id = ? AND product_id = ?', [userID, productID]);

            if(result){
                res.json({"result":"success"})
            }
            else { res.json({"result":"failed"})  }

            // if(fvt.status == 'like'){
            //      newStatus ="dislike"
            // }
            // else{
            //     newStatus ="like"
            // }
            // const [result] =  await con.query('UPDATE tbl_fvt SET status = ? WHERE user_id = ? AND product_id = ?', [newStatus, userID, productID]);
            // if(result){
            //     res.json({"result":"success"})
            // }
            // else { res.json({"result":"failed"})  }
        }
        else{

            const [result1] =  await con.query('INSERT INTO tbl_fvt (user_id, product_id, status) VALUES (?, ?, ?)', [userID, productID, newStatus]);  

            if(result1){
                res.json({"result":"success"})
            }
            else { res.json({"result":"failed"})  }
        
        }


      
  }
  

const fvtList = async(req,res,next)=>{ 

    const con = await connection(); 


  var userID = req.body.user_id
  var status = 'like';
  const [fvts] = await con.query(
    'SELECT p.*, f.user_id AS fvt_user_id ' +
    'FROM tbl_product p ' +
    'LEFT JOIN tbl_fvt f ON p.product_id = f.product_id ' +
    'WHERE f.user_id = ? AND f.status = ?',
    [userID, status]
  );

  const products = fvts.map((fvt) => {
    // Determine the status for each product
    const productStatus = fvt.fvt_user_id == userID ? 'like' : 'unlike';
    return { ...fvt, status: productStatus };
  });
  
//     const [fvts] = await con.query('SELECT * FROM tbl_fvt where user_id =? AND status = ?',[userID,status]);
//     var products = [];
//     for(let i=0; i<fvts.length; i++){
       
//         var pIDS  = fvts[i].product_id; 
//         var [[fvt]] = await con.query('SELECT * FROM tbl_product where product_id =?',[pIDS]);
//         products.push(fvt)   


//     } 

//     for (const product of products) {
      
//         const productId = product.product_id;    


//         var [[result]] =  await con.query('SELECT * FROM tbl_fvt where user_id =? AND product_id = ? AND status = ?',[  userID ,productId, 'like']);
        
//         if(result != undefined){
//            product.status = 'like';
//         }      

// }

    if(products.length > 0){
        res.json(products);
     
    }else{
        res.json({"result":"No fvt Product"})
        
    }
    
}

//--------------------------------------Fvt  Products Section end -------------------------



//------------------------------- add to collection / collecton List Start ----------------------- 


const addtocol = async(req,res,next)=>{ 
    const con = await connection(); 


    var newStatus ="added"
    var userID = req.body.user_id
    var productID = req.body.product_id
   
    const checkProductCol = 'SELECT COUNT(*) as count FROM `tbl_col` WHERE user_id = ? AND product_id = ?';

    const [colResult] = await con.query(checkProductCol, [userID, productID]);

    
     if (colResult[0].count > 0) {
        return  res.json( {result:'Already Added' });
    }
    else{

        const [result1] =  await con.query('INSERT INTO tbl_col (user_id, product_id,status) VALUES (?, ?,?)', [userID, productID,newStatus]);  

        if(result1){
            res.json({"result":"success"})
        }
        else { res.json({"result":"failed"})  }
    }

      
  }
  

const colList = async(req,res,next)=>{ 
    const con = await connection(); 


    var userID = req.body.user_id
    var status = 'added';
      const [collections] = await con.query('SELECT * FROM tbl_col where user_id =? AND status = ?',[userID,status]);
      var products = [];
      for(let i=0; i<collections.length; i++){
         
          var pIDS  = collections[i].product_id; 
          var [[col]] = await con.query('SELECT * FROM tbl_product where product_id =?',[pIDS]);
          products.push(col)   
  
  
      } 
  
      for (const product of products) {
        
          const productId = product.product_id;    
  
  
          var [[result]] =  await con.query('SELECT * FROM tbl_fvt where user_id =? AND product_id = ? AND status = ?',[  userID ,productId, 'like']);
          
          if(result != undefined){
             product.status = 'like';
          }      
  
  }
  
   
      if(products.length > 0){
          res.json(products);       
      }else{
          res.json(products)
      }
    
}


const removeFromCol = async(req,res,next)=>{ 

    const con = await connection(); 

    var userID = req.body.user_id
    var productID = req.body.product_id
   
    const [result] = await con.query('DELETE FROM tbl_col WHERE user_id = ? AND product_id = ?', [userID, productID]);

    if(result){
        res.json({"result":"removed"})
    }
    else { res.json({"result":"failed"})  }

      
  }



//----------------------------  collection end -----------------------------------------


//------------------------ Upload Product image by User ------------------


const updloadBYUser   = async(req,res,next)=>{   

    const con = await connection(); 


    var productID = req.body.product_id;
    var userID = req.body.user_id

     req.file.path = `http://${process.env.Host}/uploads/${req.file.filename}`;

     var imageName =  req.file.filename ;
     var imagePath=  req.file.path ;

     const [[product]] = await con.query('SELECT * FROM tbl_product where product_id =?',[productID]);
    

     const [result] =  await con.query('INSERT INTO tbl_images (imageName,image_path, product_id,product_name, user_id) VALUES (?,?,?,?,?)', [imageName,imagePath, productID,product.modname, userID]);  
     if(result){
        res.json({"result":"Image Request Sent to Admin"})
    }
    else { res.json({"result":"failed"})  }
     

}


//------------------------- upload end ---------------------


//------------------------ veiw/edit Single User Start  -------------------------

const profile = async(req,res,next)=>{    
    const con = await connection(); 


    const userID = req.body.user_id;
    const [[user]] = await con.query('SELECT * FROM tbl_user WHERE id = ?', [userID ]);

    if(user.status=="active"){
        res.json(user);
    }else{
        res.json({ result: "Deactivated User's Profile can not be Open"});   
    }
      
   
  }


  
const profilePost = async(req,res,next)=>{    
    const con = await connection(); 


    const userID = req.body.user_id;
    const [[user]] = await con.query('SELECT * FROM tbl_user WHERE id = ?', [userID ]);
    var uDetails = req.body; 
 
    var image =  user.image
    var imagePath=  user.imagePath 
   if (req.file) {
     image =  req.file.filename ;
     imagePath=   req.file.path = `http://${process.env.Host}/uploads/${req.file.filename}`; 
  }

 

  if(user.password != uDetails.password ){
    uDetails.password = hashPassword(uDetails.password);
  }
     
   
var userdata = {"email":user.email,"firstname":uDetails.name,"lastname":"","password":uDetails.password, "image":image ,"imagePath":imagePath,"status":user.status,"date":user.date};

const [results] = await con.query('UPDATE tbl_user SET ? WHERE email = ?', [userdata, uDetails.email]);

if(results){
    console.log(results.affectedRows + ' row(s) updated'); 

    res.json({ result: "success"});   
}else{
    res.json({ result: "failed"}); 
}

    
   
   
  }


//------------------------ veiw/edit Single User End -------------------------




//----------------- Similar collection suggestion --------------------- 

const similarColl = async (req,res,next)=>{ 
    const con = await connection(); 


    var productID = req.body.id;
    var userID = req.body.user_id


    const [[product]] = await con.query('SELECT * FROM tbl_product where product_id =?',[req.body.id]);

    const [[fvt]] = await con.query('SELECT * FROM tbl_fvt WHERE user_id = ? AND product_id = ?', [userID, productID]);
 
    const [sameCollection] = await con.query('SELECT * from tbl_col where product_id = ? ',[productID]); 

    if(fvt){
        product.status = 'like';
    }

    const timestamp = parseInt(product.date, 10)
    const date = new Date(timestamp);
    product.date = date.toLocaleString(); // Format: MM/DD/YYYY, HH:MM:SS AM/PM

    var similarSellers = []; 
    if(sameCollection){

        for (const row of sameCollection) {
      
            const userId = row.user_id;  
            var [[sellers]] = await con.query('SELECT * from tbl_user where id = ? ',[userId]); 

            sellers = {"By_Seller":row.user_id,...sellers,"modname":product.modname}
            similarSellers.push(sellers)
        }  
              
        const indexToRemove = similarSellers.findIndex(user => user.id === parseInt(userID));
        if (indexToRemove !== -1) {
            // Use splice to remove the object from the array
            similarSellers.splice(indexToRemove, 1);
          }        
      
     }
    

   var kilProdut = {...product,"Data":similarSellers}

    if(product){
        res.json(kilProdut); 
    }else{
        res.json({"result":"Failed to fetch Product "})
    }



 

    
}

// -------------- similar collection End ---------------------


//----------------- About Us API start -------------------------- 

const aboutUs= async(req,res,next)=>{ 
    const con = await connection(); 

    const [[about]] = await con.query('SELECT * FROM tbl_about');
   // res.send(about.aboutus)
    //res.send(" http://62.72.5.222:3005/rules/aboutus.html")
    res.json({"result":about.aboutus})
}

const aboutUs1= async(req,res,next)=>{ 
    const con = await connection(); 


    const [[about]] = await con.query('SELECT * FROM tbl_about');
   // res.send(about.aboutus)
    // res.send(" http://62.72.5.222:3005/rules/aboutus.htm")
    res.json({"result":about.aboutus})
}

//------------------ About Us End -----------------------------

//----------------- Terms & C  API start -------------------------- 

const TC_User = async(req,res,next)=>{ 
    const con = await connection(); 


    const [TandC] = await con.query('SELECT * FROM tbl_tandc');

    if(TandC.length>0){
        
        res.json({"result":TandC[0].terms})
    }else{
        
        res.json({"result":TandC})
    }

  //  res.send(" http://62.72.5.222:3005/rules/tandc.html")

   // res.send(TandC.terms)
    
    
}

//------------------ Terms & C Us End -----------------------------


//----------------- UserPrivacy  API start -------------------------- 

const UserPrivacy  = async(req,res,next)=>{ 
    const con = await connection(); 


    const [[privacy]] = await con.query('SELECT * FROM tbl_pandp');

    //res.send(" http://62.72.5.222:3005/rules/userprivacy.html")
    //res.send(privacy.privacy)
    res.json({"result":privacy.privacy})
}

//------------------ UserPrivacy  End -----------------------------


//---------------------- Contact US Start ------------------------ 

const contactUS  = async(req,res,next)=>{ 
    const con = await connection(); 

    var status = "opened"
    var userID =req.body.user_id

    const [result] =  await con.query('INSERT INTO tbl_queries (user_id, subject, email, message, status) VALUES (?, ?, ?,?,?)', [userID, req.body.subject, req.body.email,req.body.message, status]);  

    if(result){
        res.json({"result":"success"})
    }
    else {         
        res.json({"result":"failed"}) 
        }

   
}


//---------------------- contact us End ---------------------------


//---------------- Paypal Payment Start ---------------------




const createPayment = async(req,res,next)=>{  console.log(req.body)
    const con = await connection(); 


    const { amount, currency } = req.body;
    var userID = req.body.user_id;  

    var productID = req.body.product_id;

   // const returnUrl = `http://${process.env.Host}/api/success?userId=${userId}&token=${token}`;

    //const returnUrl = `http://62.72.5.222:3005/api/success`;

    var [result] =  await con.query('SELECT * FROM tbl_payment where user_id =? AND product_id = ?',[ userID , productID]);

    if(result.length >0){
        res.json({"result":"success"})

    }else{
        //res.json({"result":result})
        const createPaymentJson = {
            intent: 'sale',
            payer: {
              payment_method: 'paypal',
            },
            transactions: [
              {
                amount: {
                  total: amount,
                  currency: currency,
                },
              },
            ],
            redirect_urls: {
                return_url: `http://62.72.5.222:3005/api/success?userID=${userID}&productID=${productID}`,
                cancel_url: 'http://62.72.5.222:3005/api/cancel', // Replace with your cancel URL
            },
        };
         
          
    
          paypal.payment.create(createPaymentJson, (error, payment) => {  console.log(" Main hited")
    
            if (error) {
              res.status(500).json({ error: 'Failed to create payment' });
            } else {
              const approvalUrl = payment.links.find((link) => link.rel === 'approval_url').href;
              //token = approvalUrl.match(/(EC-[0-9a-zA-Z]+)/)[0];
             // res.json({ approvalUrl });
             res.json({"result":approvalUrl})
    
             // res.redirect(returnUrl)
             // res.redirect(approvalUrl);
            }
          });

    }   

      

   

      
}


const successPayment = async(req,res,next)=>{   console.log(req.query.userID)
    const con = await connection(); 


    const paymentId = req.query.paymentId

    const PayerID = req.query.PayerID

    const userID = req.query.userID

    const productID = req.query.productID

    const timestamp = Date.now(); 

    const status = 'done';

   


    const executePaymentJson = {
      payer_id: PayerID,
    };
  
     paypal.payment.execute(paymentId, executePaymentJson,  (error) => {
      if (error) { 
        //res.json({"result":"success"})
        res.redirect('/api/cancel'); // Redirect to cancel page on payment failure
      } else {    

        console.log("success payment")
        kil(userID,productID)
        // Payment successful, update the user's account status here
        // Grant access to the chat service and render a success page
        res.json({"result":"success"})
      }
    });

    async function kil(userID, productID){
        console.log("  insert payment in DB ")

      const [result] =  await con.query('INSERT INTO tbl_payment (product_id ,user_id, timestamp, status) VALUES (?, ?, ?, ?)', [productID,userID, timestamp ,status]);

            if(result){
                console.log("Payment Done and Inserted in DB")
            }else{
                console.log("Payment Done BUT Not inserted in DB ")
            }
    }



}


const donePayment = async(req,res,next)=>{ 

    res.json(req.query)

   // res.status(400).json({"result":"failed"})

}

const cancelPayment = async(req,res,next)=>{ 
    res.status(400).json({"result":"failed"})

}

const paymentStatus = async(req,res,next)=>{ 

    const con = await connection(); 


    const { amount, currency } = req.body;
    var userID = req.body.user_id;
    var targetID = req.body.target_id;

    var productID = req.body.product_id;

    console.log(userID)
    console.log(targetID)

    var [result] =  await con.query('SELECT * FROM tbl_payment where user_id =? AND product_id = ?',[ userID , productID]);
        console.log(result.length)
    if(result.length >0){

        res.json({"result":"success"})
    //     var l = result.length; 
    // console.log(result[l-1])
    // result = result[l-1]
    // function isWithinLast24Hours(timestamp) {
      
    //     const date = new Date(timestamp);
      
    //     // Get the current date and time
    //     const currentDate = new Date();
      
    //     // Calculate the time difference in milliseconds
    //     const timeDifference = currentDate - date;
      
    //     // Define the number of milliseconds in 24 hours
    //     const millisecondsIn24Hours = 24 * 60 * 60 * 1000;
      
    //     // Check if the time difference is less than or equal to 24 hours
    //     return timeDifference <= millisecondsIn24Hours;
    //   }
      //var isPaid = isWithinLast24Hours(result.timestamp);  

    }else{
        res.json({"result":result})

    }   
    
      

}


const obtainToken1 = async(req,res,next)=>{   

    const con = await connection(); 

    var userID = req.body.user_id;
    var device_token = req.body.device_token;
    var device_status = req.body.device_status;
    var created_at = Date.now();
    var updated_at = Date.now();
    
    const [result] =  await con.query('INSERT INTO fcm_tokens (user_id, device_token, device_status, created_at, updated_at ) VALUES (?, ?, ?, ?, ?)', [userID, device_token, device_status, created_at, updated_at]);  
 


    if(result){ 
        res.json({"result":"success"})
    }else{
        res.json({"result":"failed"})
    }
}


const obtainToken = async(req,res,next)=>{   

    const con = await connection(); 

    var userID = req.body.user_id;
    var device_token = req.body.device_token;
    var device_status = req.body.device_status;
    var created_at = Date.now();
    var updated_at = Date.now();

    // Check if a record already exists for this user and device token
 const [existingRecords] = await con.query('SELECT * FROM fcm_tokens WHERE user_id = ? AND device_token = ?', [userID, device_token]);

 
 const [[existingDeviceID]] = await con.query('SELECT * FROM fcm_tokens WHERE device_token = ?', [ device_token]);




      //&& existingDeviceID.user_id != userID  

 if (existingRecords.length > 0) {
        console.log("existing DeviceID")
    const [result] =  await con.query('UPDATE fcm_tokens SET device_status = ?, updated_at = ? WHERE user_id = ? AND device_token = ?', [device_status, updated_at, userID, device_token]);
            if(result){ 
                res.json({"result":"success"})
            }else{
                res.json({"result":"failed"})
            }

} else {
    console.log("New DeviceID")
    if(existingDeviceID){
        console.log("Duplicate Device Found & Set for Current User Successfully")
 
    await con.query('DELETE FROM fcm_tokens WHERE user_id = ? AND device_token = ?', [ existingDeviceID.user_id, device_token]);
}

    const [result] =  await con.query('INSERT INTO fcm_tokens (user_id, device_token, device_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [userID, device_token, device_status, created_at, updated_at]);

            if(result){ 
             
                res.json({"result":"success"})
            }else{
                res.json({"result":"failed"})
            }

    }
   // await con.query('INSERT INTO fcm_tokens (user_id, device_token, device_status, created_at, updated_at ) VALUES (?, ?, ?, ?, ?)', [userID, device_token, device_status, created_at, updated_at]);  
 


  
}
 

    











export {register,  Login, Logout, ForgotPassword , resetpassword,
    getProducts,prodcutDetails,fvtList, addtoFVT, addtocol, colList, 
    removeFromCol, updloadBYUser, profile, profilePost, similarColl,
     aboutUs, TC_User, UserPrivacy, contactUS, aboutUs1, createPayment, 
     successPayment, cancelPayment ,paymentStatus, obtainToken

}


         