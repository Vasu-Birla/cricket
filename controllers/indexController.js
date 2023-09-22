
import { sendTokenAdmin, sendTokenUser } from '../utils/jwtToken.js';
import connection from '../config.js';

const con = await connection();
import * as path from 'path';
import upload from '../middleware/upload.js';



import {hashPassword, comparePassword, responsetoQuery, sendNotification} from '../middleware/helper.js'
import { Console } from 'console';


//--------------------Render Home / Login / Register Page ------------------------------ 


const homePage = async(req,res,next)=>{    

    const con = await connection(); 

    const [users] = await con.query('SELECT * FROM tbl_user');
    const [products] = await con.query('SELECT * FROM tbl_product');
    const [openQ] = await con.query('SELECT * FROM tbl_queries WHERE status IN (?)', ['opened']);
    const [closedQ] = await con.query('SELECT * FROM tbl_queries WHERE status IN (?)', [ 'closed']);
    var totalQ = openQ.length+closedQ.length
    var totalP = products.length;
    var i=0;
    var j=0;
        for(const row of users){
          
           if( row.status == 'active'){
             i++
           }else{
           j++
           }
        }
        var Ausers = i
        var Dusers = j
         i=0;
         j=0;
        for(const row of products){
          
            if( row.stock == 'Instock'){
              i++
            }else{
            j++
            }
         }
         var Iproducts = i
         var Oproducts = j


    res.render('index',{"output":"","users":users,"openQ":openQ,"closedQ":closedQ,"totalQ":totalQ, "Ausers":Ausers,"Dusers":Dusers,"totalP":totalP,"Iproducts":Iproducts,"Oproducts":Oproducts})

    // if (req.headers['user-agent'].includes('Mozilla')) {

    //     res.render('index',{"output":"","users":users})
        
    // }else {
    //     // App request
    //     res.status(200).json({ message: 'webpage loaded successfully.' });
    //   }

    
}


const Kil= async(req,res,next)=>{    

    res.render('kil')
}



//------------------------- Login / Logout Admin Start ------------------- 

const Login= async(req,res,next)=>{     

    if(!req.admin) {
        console.log("session expired")
        res.render('log-in',{'output':''}) 
    }
    else{
        console.log("session ON")
        res.redirect('/')
    }

}

const loginAdmin = async (req,res,next)=>{    
    const con = await connection(); 

    const {username,password} = req.body; 
    //if user don't enter email password
    if(!username || !password){

      
        // res.json("Please Enter Email and Password")
         res.render('log-in',{'output':'Please Enter Email and Password'})
        
    }
    else 
    {

        const [results] = await con.query('SELECT * FROM tbl_admin WHERE username = ?', [username]);                 
        const admin = results[0];    

         if(!admin){                
           //res.json("Invalid Email & Password")  
          res.render('log-in',{'output':'Invalid Username'})         
            }
             else if (admin.password != password) {
                          
             res.render('log-in',{'output':'Incorrect Password'})   
            }
            else {             
             sendTokenAdmin(admin,200,res)
             }  
     
   
    }    
}


const Logout= async(req,res,next)=>{     

    res.cookie("token",null,{
        expires : new Date(Date.now()),
        httpOnly:true
    })

    res.render('log-in',{'output':'Lodded Out !!'}) 

}


//-------------------- Login Admin End ------------------




//--------------------------Add User Start ---------------------

const addUser= async(req,res,next)=>{ 
    res.render('addUser',{'output':''})
   // res.json({"message":"data feched succesfully"})
}

const addUserPost = async(req,res,next)=>{

    const con = await connection(); 


    if (!req.file) {
        return res.status(400).render('addUser', { 'output': 'failed to upload Image' });
      }
    var date = Date.now();
    var status = "active";
    var imagePath =  `http://${process.env.Host}/uploads/${req.file.filename}`; 


    req.body.password = hashPassword(req.body.password);

    const sql = 'INSERT INTO `tbl_user` ( email, firstname, lastname, password, image, imagePath, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    const values = [ req.body.email, req.body.firstname, req.body.lastname, req.body.password, req.file.filename, imagePath, status, date];
    

    const [results] = await con.query(sql, values);

    if(results){
        res.render('addUser',{'output':'User Added Successfully !!'})
    }
    else{
        res.render('addUser',{'output':'Failed to Add User !! '})

    }
   
    
    // con.query(sql, values, (err, result) => {
    //   if (err) {
    //     res.render('addUser',{'output':'Failed to Add User !! '})
    //   } else {
    //     res.render('addUser',{'output':'User Added Successfully !!'})
    //   }
    // });

   // res.json({"message":"data feched succesfully"})
}



//-------------------------------------- Add User End -----------------------------

const loginUserPost= async(req,res,next)=>{ 

    const con = await connection(); 


    const {email,password} = req.body; 
    //if user don't enter email password
    if(!email || !password){

    res.json("Please Enter Email and Password")
         
        
    }
    else 
    {

        

        const [results] = await con.query('SELECT * FROM tbl_user WHERE email = ?', [email]);                 
        const user = results[0];    

        let isValid = comparePassword( password, user.password );

        console.log(isValid)

         if(!user){                
            res.json("Account does not exists !!")  
          
            }
        else if (!isValid) {
                          
            res.json("Incorrect Password")  
            }
        else {             
                sendTokenUser(user,200,res)
             }  
     
   
    }  





}




//--------------------- Add User End --------------------------------------



//--------------------View User Start --------------------------



const viewUser= async(req,res,next)=>{     
    const con = await connection(); 

    const [rows] = await con.query('SELECT * FROM tbl_user ORDER BY date DESC');
    var users = rows;
    for(let i=0; i<users.length; i++){
        const timestamp = parseInt(users[i].date, 10)
        const date = new Date(timestamp);
        users[i].date = date.toLocaleString();   

    } 

    if (rows.length > 0) {
        res.render('viewUser',{'users':users,'output':''})
      } else {
        res.render('viewUser',{'users':"",'output':' No User Found !!'})
      }

}


const viewUserPost= async(req,res,next)=>{    

    res.render('viewUser')
}




//--------------------View User End   --------------------------

//------------------------Update User Status ------------------------ 

const updateS= async(req,res,next)=>{ 

    const con = await connection(); 

       var userID= req.body._id;

    if(req.body.status =='active')
    {
        var newStatus = "inactive"
    }
    else {
        var newStatus = "active"
    }  

    const [results] = await con.query('UPDATE tbl_user SET status = ? WHERE id = ?', [newStatus, userID]);
        if(results){
            res.json({ msg: 'success update status'})
        }

}


//---------------- update status end ----





//-------------------------- view single User Profile and Edit ---------------------------------------


const userProfile= async(req,res,next)=>{    
    const con = await connection(); 


  const userID = req.params.id;
  const [[user]] = await con.query('SELECT * FROM tbl_user WHERE id = ?', [userID ]);   

  console.log(user)

  res.render('userprofile',{"output":"","user":user})
 
}

const userProfilePost= async(req,res,next)=>{    

    res.render('userprofile',{"output":"","user":""})
}



//--------------view/edit user end -------------------------------------------------------


const Register= async(req,res,next)=>{    

    res.render('register')
}



//--------------------  Admin Profile Edit Start ---------------------

const Profile= async(req,res,next)=>{    
    
    var user = req.admin;

    
    // res.status(200).json({
    //     success:true,
    //     user
    // })

    res.render('profile',{'user':user,"output":""})
}



const updateAdmin= async(req,res,next)=>{ 

    const con = await connection(); 

    var image =  req.admin.image
    var imagePath=  req.admin.imagePath 
   if (req.file) {
     image =  req.file.filename ;
     imagePath=  req.file.path ;   
  }
    
    var uDetails = req.body; 
var userdata = {"firstname":uDetails.firstname,"lastname":uDetails.lastname,"email":uDetails.email,"username":uDetails.username,"contact":uDetails.contact, "image":image ,"imagePath":imagePath};
var cData = {"email":uDetails.email}


// await con.query('UPDATE tbl_admin SET ? WHERE email = ?', [userdata, uDetails.email], (error, results) => {   
           
//     console.log(results.affectedRows + ' row(s) updated'); 

//    var user = req.body
//     res.render('profile',{'user':user,"output":" Profile Updated Successfully !!"})
    
    
// }) 


const [results] = await con.query('UPDATE tbl_admin SET ? WHERE email = ?', [userdata, uDetails.email]);

if(results){
    console.log(results.affectedRows + ' row(s) updated'); 

    const [results1] = await con.query('SELECT * FROM tbl_admin WHERE id = ?', [req.admin.id]);

    var user = results1[0];   

    res.render('profile',{'user':user,"output":" Profile Updated Successfully !!"})
}


}

//--------------------  Admin Profile Edit End ---------------------



//------------------------------------------ Add Product Start -----------------------

const addProduct= async(req,res,next)=>{    

    res.render('addProduct',{"output":""})
}

const addProductPost= async(req,res,next)=>{  

    const con = await connection(); 


    var date = Date.now();
    var stock = "Instock";
    var Status = "dislike";   

    req.file.path = "http://62.72.5.222:3005/uploads/"+req.file.filename

    console.log(req.file.path)

  

    const sql = 'INSERT INTO `tbl_product` ( toy, colnum, modname, sname, snum, image, imagePath, stock, status, date ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)';

    const values = [ req.body.toy, req.body.colnum, req.body.modname, req.body.sname, req.body.snum, req.file.filename, req.file.path, stock, Status, date];
    

    const [results] = await con.query(sql, values);
    if(results){
        res.render('addProduct',{'output':'Product Added Successfully !!'})
    }
    else{
        res.render('addProduct',{'output':'Failed to Product !! '})

    }
}



const viewProducts = async(req,res,next)=>{    
    const con = await connection(); 
 
    const [products] = await con.query('SELECT * FROM tbl_product');


    if (products.length > 0) {
        res.render('viewProduct',{'products':products,'output':''})
      } else {
        res.render('viewProduct',{'products':"",'output':' No product Found !!'})
      }

}


//----------------------------Add Product End .....................

//-------------------------  Update Stock ------------------------------------ 



const updateStock = async(req,res,next)=>{ 
    const con = await connection(); 

    var productID = req.body._id;

    console.log(productID)

 if(req.body.stock =='Instock')
 {
     var newStock = "Out_of_Stock"
 }
 else {
     var newStock = "Instock"
 }  


 const [results] =  await con.query('UPDATE tbl_product SET stock = ? WHERE product_id = ?', [newStock, productID]);         
 console.log(results)
     if(results){
         res.json({ msg: 'success update status'})
     }

}





//---------------------------- update stock end 



//---------------------------------------------- view and Edit Product ------


const fetchProduct = async(req,res,next)=>{   
    var productID = req.query.productId; 

    var [[product]] = await con.query('SELECT * FROM tbl_product WHERE product_id = ?', [productID ]);       

    product = {...product,"productID":productID}

    res.render('vieweditProduct',{'product':product,"output":""})
}


const editProduct = async(req,res,next)=>{  

    
    const con = await connection();     
    var productID = req.body.productID
    const [[product]] = await con.query('SELECT * FROM tbl_product WHERE product_id = ?', [productID ]);  



    var image =  product.image
    var imagePath=  product.imagePath 

   if (req.file) {
     image =  req.file.filename ;
     imagePath=  req.file.path ;   
  }
    
    var pDetails = req.body; 
    
    var date = Date.now();
    var stock = "Instock";
    var status = "dislike";  

    var productData = {"toy":pDetails.toy,"colnum":pDetails.colnum,"modname":pDetails.modname,"sname":pDetails.sname,"snum":pDetails.snum, "image":image ,"imagePath":imagePath,"stock":stock,"status":status,"date":date};

    const [result] = await con.query('UPDATE tbl_product SET ? WHERE product_id = ?', [productData, productID]);

    if(result){
        var [[product1]] = await con.query('SELECT * FROM tbl_product WHERE product_id = ?', [productID]); 

        product1 = {...product1,"productID":productID}
        res.render('vieweditProduct',{'product':product1,"output":"Product Updated Successfully !!"}) 

    }

}

//---------------------- view edit product End ------------------






const ongoingBooking = async(req,res,next)=>{    

    res.render('ongoingBooking')
}


const bookHistory = async(req,res,next)=>{    

    res.render('bookHistory')
}



//----------------------------------------------- Notification Section Start ------------------------------- 
const Notify = async(req,res,next)=>{   
    const con = await connection(); 

    
    const [users] = await con.query('SELECT * FROM tbl_user ORDER BY date DESC');

    res.render('notifications',{'output':'','users':users});

    
}

// const NotifyPost = async (req,res,next)=>{     
        

//     const recipientEmails = Array.isArray(req.body.recipientEmail) ? req.body.recipientEmail : [req.body.recipientEmail]; // Ensure it's an array
//     //res.json(recipientEmails)
//     const subject =req.body.emailSubject
//     const message =req.body.emailMessage

//     const sentEmails = [];

//     for (const email of recipientEmails) {
//         const isSent = await sendNotification(email, message, subject);

     
//         if (isSent) {
//             console.log("true")
//           sentEmails.push(email);
//         }
//       }


//     //sendNotification(email,message,subject)   

//     const [users] = await con.query('SELECT * FROM tbl_user ORDER BY date DESC');

    
//  if(sentEmails.length > 0){  

//      res.render('notifications',{"output":"Email Sent to " + sentEmails.join(", ") + " Successfully","users":users})
   
//  }
//  else{
//     res.render('notifications',{"output":"Failed to send Email ","users":users})

//  }
     
        
// }

const NotifyPost = async (req, res, next) => {
    const con = await connection(); 

    const recipientEmails = Array.isArray(req.body.recipientEmail)
      ? req.body.recipientEmail
      : [req.body.recipientEmail];
  
    const subject = req.body.emailSubject;
    const message = req.body.emailMessage;
  
    const isSent = await sendNotification(recipientEmails, message, subject);
  
    const [users] = await con.query('SELECT * FROM tbl_user ORDER BY date DESC');
  
    if (isSent) {
      res.render('notifications', {
        "output": "Email Sent to " + recipientEmails.join(", ") + " Successfully",
        "users": users
      });
    } else {
      res.render('notifications', {
        "output": "Failed to send Email",
        "queries": Queries
      });
    }
  };
  

//---------------------------- Notification  End ------------------------------------


//------------------- add Support start ---------------- 

const Support = async(req,res,next)=>{   
    const con = await connection(); 
 
    const [[support]] = await con.query('SELECT * FROM tbl_support');

    
    res.render('Support',{'output':'','support':support});
}


const SupportPost = async(req,res,next)=>{    
    const con = await connection(); 


    const [support1] = await con.query('SELECT * FROM tbl_support WHERE id = ?', [1]);

    if(support1.length == 0){  

        var [results] =   await con.query('INSERT INTO tbl_support (support_email, support_contact) VALUES (?, ?)', [req.body.support_email, req.body.support_contact]);

        console.log(results)
    }else{

        console.log(" update ----")

         [results] =  await con.query('UPDATE tbl_support SET support_email = ?, support_contact = ? WHERE id = ?', [req.body.support_email, req.body.support_contact, support1[0].id]);         

    }   
      
  

    const [[support]] = await con.query('SELECT * FROM tbl_support WHERE id = ?', [1]);

    if(results){
        
        res.render('Support',{'output':'Support Details Added Successfully !!','support':support})
    }
    else{
        res.render('Support',{'output':'Failed to Add Support !! ','support':support})

    }


}


//------------------- add Support End -----------------------------






//----------  FAQ  section start ------------------------------------------

const Faq_User = async(req,res,next)=>{    
    const con = await connection(); 

    const [faqs] = await con.query('SELECT * FROM tbl_userfaq');
    
    
    res.render('Faq_user',{'output':'','faqs':faqs})
}


const Faq_UserPost = async(req,res,next)=>{   
    const con = await connection(); 


    const faqContent = decodeURIComponent(req.body.faq);
    const faqID = decodeURIComponent(req.body.faqID); 
    

    if(faqID>0){
        const [results] = await con.query('UPDATE tbl_userfaq SET faq = ? WHERE id = ?', [faqContent, faqID]);

        const [faqs] = await con.query('SELECT * FROM tbl_userfaq');
        
        if(results){
            
            res.render('Faq_user',{'output':'Updated User FAQ Successfully !!','faqs':faqs})
        }
        else{
            res.render('Faq_user',{'output':'Failed to Update User FAQ ','faqs':faqs})
    
        }  
    }
    else{

        const sql = 'INSERT INTO `tbl_userfaq` ( faq ) VALUES (?)';
        const values = [ faqContent];   
            const [results] = await con.query(sql, values);
        
        const [faqs] = await con.query('SELECT * FROM tbl_userfaq');
        
        if(results){
            
            res.render('Faq_user',{'output':'User FAQ Added Successfully !!','faqs':faqs})
        }
        else{
            res.render('Faq_user',{'output':'Failed to User FAQ ','faqs':faqs})
    
        }  
    }

   
  

    

   
}


const Faq_Driver = async(req,res,next)=>{    

    res.render('Faq_driver')
}





//----------  FAQ  section End  ------------------------------------------

//-------------------- T & C start ---------------------------------
const TC_User = async(req,res,next)=>{    
    const con = await connection(); 



    const [TandC] = await con.query('SELECT * FROM tbl_tandc'); 
    res.render('TC_User',{'output':'','TandC':TandC[0]})
    // if(TandC.length>0){
    //     res.render('TC_User',{'output':'','TandC':TandC[0]})
    // }else{
    //     res.render('TC_User',{'output':'','TandC':"TandC[0]"})
    // }
    
    
}

const TC_UserPost = async(req,res,next)=>{ 
    const con = await connection(); 
  

    const termsContent = decodeURIComponent(req.body.faq);
    const faqID = decodeURIComponent(req.body.faqID); 
    

    const [result] = await con.query('SELECT * FROM tbl_tandc where id =?',[1]);

    if(result.length > 0){

        const [results] = await con.query('UPDATE tbl_tandc SET terms = ? WHERE id = ?', [termsContent, 1]);

        const [[TandC]] = await con.query('SELECT * FROM tbl_tandc');
      
        if(results){
            
            res.render('TC_User',{'output':'Terms&Condition Updated Successfully !!','TandC':TandC})
        }
        else{
            res.render('TC_User',{'output':'Failed to update Terms&Condition ','TandC':TandC})
    
        } 
       
    }else{
        const sql = 'INSERT INTO `tbl_tandc` ( terms ) VALUES (?)';
        const values = [ termsContent];   
            const [results] = await con.query(sql, values);
            const [[TandC]] = await con.query('SELECT * FROM tbl_tandc');
            console.log(TandC)
           

            if(results){
            
                res.render('TC_User',{'output':'Terms&Condition Added Successfully !!','TandC':TandC})
            }
            else{
                res.render('TC_User',{'output':'Failed to add Terms&Condition ','TandC':TandC})
        
            } 


    }


  

   
}


//-------------------------------------  Terms and condition end -------------------





const TC_Driver = async(req,res,next)=>{    

    res.render('TC_Driver')
}


//-------------------------------------- User Privacy  start ------------------- 
const userPrivacy = async(req,res,next)=>{    
    const con = await connection(); 


    const [[privacy]] = await con.query('SELECT * FROM tbl_pandp');

    res.render('userPrivacy',{'output':'','privacy':privacy})
}


const userPrivacyPost = async(req,res,next)=>{   

    const con = await connection(); 


    const privacyContent = decodeURIComponent(req.body.faq);
    const faqID = decodeURIComponent(req.body.faqID); 
    

    const [result] = await con.query('SELECT * FROM tbl_pandp where id =?',[1]);

    if(result.length > 0){

        const [results] = await con.query('UPDATE tbl_pandp SET privacy = ? WHERE id = ?', [privacyContent, 1]);

        const [[privacy]] = await con.query('SELECT * FROM tbl_pandp');
      
        if(results){
            
            res.render('userPrivacy',{'output':'userPrivacy Updated Successfully !!','privacy':privacy})
        }
        else{
            res.render('userPrivacy',{'output':'Failed to update userPrivacy ','privacy':privacy})
    
        } 
       
    }else{
        const sql = 'INSERT INTO `tbl_pandp` ( privacy ) VALUES (?)';
        const values = [ privacyContent];   
            const [results] = await con.query(sql, values);
            const [[privacy]] = await con.query('SELECT * FROM tbl_pandp');
                    

            if(results){
            
                res.render('userPrivacy',{'output':'userPrivacyn Added Successfully !!','privacy':privacy})
            }
            else{
                res.render('userPrivacy',{'output':'Failed to add userPrivacy ','privacy':privacy})
        
            } 


    }

 

   
}


//------------------------ User Privacy end --------------------------
const driverPrivacy = async(req,res,next)=>{    

    res.render('driverPrivacy')
}


//-----------------------------------------------------


//-------------------  Image by User pending aprrove reject ---------------- 

const ImgReq = async(req,res,next)=>{

    const con = await connection(); 

    
    

    const [images] = await con.query('SELECT * FROM tbl_images WHERE status IN (?, ?)', ['approved', 'pending']);

    
    if(images){

        res.render('imgreview',{"output":"","products":images})
      
    }
    else{
        res.render('imgreview',{"output":"No Image found","products":""})
  
    }
    
    
}


const ImgReqPost = async(req,res,next)=>{

    const con = await connection(); 

    
    
    var imageID= req.body._id;

    const [[kil]] = await con.query('SELECT * FROM tbl_images where image_id =?',[imageID]);

    var imageName =  kil.imageName
     var imagePath=  kil.image_path ;



    if(req.body.status =='approve')
    {
        var newStatus = "approved"
        const [updated] =  await con.query('UPDATE tbl_product SET image = ?, imagePath = ? WHERE product_id = ?', [imageName, imagePath, kil.product_id]);   

    } else {
        var newStatus = "rejected"
    }
 

    const [results] = await con.query('UPDATE tbl_images SET status = ? WHERE image_id = ?', [newStatus, imageID]);
        if(results){
            
            res.json({ msg: 'Action Taken on Image Request'})
        }
     
    
}



//------------------- about us section --------------------

const aboutUs= async(req,res,next)=>{ 
    const con = await connection(); 


    const [[about]] = await con.query('SELECT * FROM tbl_about');
    res.render('aboutus',{'output':'','about':about})
  // res.json({"message":"data feched succesfully"})
}

const aboutUsPost= async(req,res,next)=>{ 

    const aboutContent = decodeURIComponent(req.body.faq);
    const faqID = decodeURIComponent(req.body.faqID); 
    

    const [result] = await con.query('SELECT * FROM tbl_about where id =?',[1]);

    if(result.length > 0){

        const [results] = await con.query('UPDATE tbl_about SET aboutus = ? WHERE id = ?', [aboutContent, 1]);

        const [[about]] = await con.query('SELECT * FROM tbl_about');
   

        if(results){
            
            res.render('aboutus',{'output':'About Updated Successfully !!','about':about})
        }
        else{
            res.render('aboutus',{'output':'Failed to add AboutContent ','about':about})
    
        } 
       
    }else{
        const sql = 'INSERT INTO `tbl_about` ( aboutus ) VALUES (?)';
        const values = [ aboutContent];   
            const [results] = await con.query(sql, values);
            const [[about]] = await con.query('SELECT * FROM tbl_about');
           

            if(results){
            
                res.render('aboutus',{'output':'About Added Successfully !!','about':about})
            }
            else{
                res.render('aboutus',{'output':'Failed to add AboutContent ','about':about})
        
            } 


    }

    

}

//----------------------------------- About US end ----------------- 

//-----------------  Queries Start --------------------- 


const Queries = async(req,res,next)=>{

    const con = await connection(); 

    
    
    const [Queries] = await con.query('SELECT * FROM tbl_queries WHERE status IN (?, ?)', ['opened', 'closed']);

    
    if(Queries){

        res.render('queries',{"output":"","queries":Queries})
      
    }
    else{
        res.render('queries',{"output":"No Image found","queries":""})
  
    }
    
    
}


const QueriesPost = async(req,res,next)=>{

    const con = await connection(); 

    
    
    var queryID = req.body.id;

        if(req.body.status =='opened')
        {
            var newStatus = "closed"
        }
        else {
            var newStatus = "opened"
        }  
    
        const [results] = await con.query('UPDATE tbl_queries SET status = ? WHERE id = ?', [newStatus, queryID]);
            if(results){
                res.json({ msg: 'Action Taken on Query'})
         }
     
    
}


//----------------- Queries End ------------------- 



//------------------ Response Mail to Query start ------------------ 

const sendMailtoUser = async(req,res,next)=>{     

    const con = await connection(); 



    const email =req.body.recipientEmail
    const subject =req.body.emailSubject
    const message =req.body.emailMessage

 responsetoQuery(email,message,subject)   

 const [Queries] = await con.query('SELECT * FROM tbl_queries WHERE status IN (?, ?)', ['opened', 'closed']);

    
 if(Queries){

     res.render('queries',{"output":"Email Sent to "+email +" Successfully ","queries":Queries})
   
 }
 else{
    res.render('queries',{"output":"Failed to send Email ","queries":Queries})

 }
     
        
}




const Schema = async(req,res,next)=>{
    const con = await connection(); 


    var userId = 18;
    var unreadCount;

    const [results] = await con.query('SELECT COUNT(*) as unreadMsgCount FROM messages WHERE user_to = ? AND readStaus = false', [userId] );


    if (results.length > 0) {
      // Extract the unread message count from the query results
       unreadCount  = results[0].unreadMsgCount;
     
  } else {
      // No unread messages found for the user
      unreadCount= 0;
  }

  console.log("Unread Messages",unreadCount)


    // try {

    //     const [tables] = await con.query('SHOW TABLES');
  
    //     // Fetch column information for each table
    //     const tableData = [];
    //     for (const table of tables) {
    //         const tableName = table[`Tables_in_${'myhw'}`]; // Replace with your database name
    //         const [columns] = await con.query(`DESCRIBE ${tableName}`);
    //         tableData.push({ tableName, columns });
    //     }
   
    //     res.json(tableData);
    // }catch (error) {
    //     console.error('Error fetching schema:', error);
    //     res.status(500).json({ error: 'Internal server error' });
    // }
 
    
}

const Schema1 = async(req,res,next)=>{
    
res.render('kilvish')
   
}

const addCoupon  = async(req,res,next)=>{ console.log(req.body)
    const con = await connection(); 


    console.log("add cpn  request")
  var coupan = req.body.coupan;

  console.log("coupan is ---->>>>>>>> ",coupan)
  var timestamp = Date.now(); 

    const date = new Date(timestamp);
    timestamp = date.toLocaleString();

    console.log("time is ---->>>>>>>> ",timestamp)
    
  
    const [result] =  await con.query('INSERT INTO tbl_cpn (coupon, timestamp) VALUES (?,?)', [coupan, timestamp]);  
    
                if(result){
                    res.json({"result":" Coupan Code Addded Successfully !! "})

                }else{
                    res.json({"result":"Failed to add Coupan Code "})
                }
}





    const verifycpn = async(req,res,next)=>{
        const con = await connection(); 

        console.log("verify cpn  request")
    
        var coupan = req.body.coupan
        const checkUserSql = 'SELECT * FROM `tbl_cpn` WHERE coupon = ?';
        const checkUserValues = [coupan];
        
        const [userResult] = await con.query(checkUserSql, checkUserValues);        
       
        if(userResult.length > 0){ 
            res.json({"result":" Verified Coupan ","added AT":userResult[0].timestamp})

        }else{
            res.json({"result":"Invalid Coupan "})
        }
          
        
        
          
    
      }

    
    




//---------------- 
export {homePage, Kil, Login, addUser,loginUserPost, viewUser,
     Register, Profile, ongoingBooking, 
     bookHistory, Notify, NotifyPost, Support, Faq_User,
      Faq_Driver, TC_User, TC_Driver,
       userPrivacy,userPrivacyPost, driverPrivacy , 
       loginAdmin, Logout , updateAdmin, 
       addUserPost, viewUserPost, 
       updateS,SupportPost, Faq_UserPost, addProductPost, 
       addProduct, viewProducts, updateStock, ImgReq,
        ImgReqPost, userProfile, 
        userProfilePost, aboutUs, aboutUsPost, 
        TC_UserPost , Queries , QueriesPost, sendMailtoUser,Schema, Schema1, addCoupon, verifycpn, editProduct, fetchProduct}


         
