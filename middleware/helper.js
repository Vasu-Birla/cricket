import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import connection from '../config.js';

import twilio from 'twilio';
const accountSid = 'AC0f74c0fd651962f97fb3cc44ba4fbdaa';
const authToken = '4ad41bb8f511d307bfaa1730bafa4541';
const client = new twilio(accountSid, authToken);



const con = await connection();

import admin from 'firebase-admin';
//import serviceAccount from '../assets/myhwfirebase.json';

import serviceAccount from '../public/assets/myhwfirebase.json' assert { type: 'json' };

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   databaseURL: 'https://myhwcollection-3ac70.firebaseio.com', // Replace with your Firebase project URL
 });
 


//------------------ hash password and comapare again  ------------------
const hashPassword = function (password) {    

    const salt = bcrypt.genSaltSync(); 
	return bcrypt.hashSync(password, salt); 
}

const comparePassword = function (raw,hash) {    

    return bcrypt.compareSync(raw, hash)
}
//------------------ Hash Password end ...............................


const sendMailOTP = function (email,otp,user) {
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
 
 var transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'vasubirla@gmail.com',
     pass: 'phjwptaxdnaunqol'
   }
 });
 
 var mailOptions = {
   from: 'vasubirla@gmail.com',
   to: email,
   subject: 'Verification Mail MyApp',
   html: "<h3>Your One Time Passord for requested Service is :</h1>"+"<h3>"+otp+"</h1>"
 
 }
 
 transporter.sendMail(mailOptions, function(error, info){  console.log("emailllll sent...............")
  
   if (error) {
    console.log("error in sending mail")
    //res.json({ result: "failed"});     
   } else {
    console.log("emailllll sent...............")
    //res.json({ result: "success","user_id":user.id,otp:otp}); 
   }
 }); 
 
 }
 


 //------------------- response to query ------------------ 

 
const responsetoQuery = function (email,message,subject) {
  //process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'


var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
   user: 'vasubirla@gmail.com',
   pass: 'phjwptaxdnaunqol'
 }
});

var mailOptions = {
 from: 'vasubirla@gmail.com',
 to: email,
 subject: subject,
 html: "<h3> Hello Sir/Madam , We Have Reviewed your Query :</h1>"+"<h3>"+message+"</h1>"

}

const isSent =transporter.sendMail(mailOptions, function(error, info){ 
 if (error) {
  console.log(error)
  return false;
 
  //res.json({ result: "failed"});     
 } else {
  console.log("emailllll sent...............")
  //res.json({ result: "success","user_id":user.id,otp:otp}); 
  return true;

 }
}); 



}

 //------------------- response to query ------------------ 

 
//  const sendNotification = function (email, message, subject) {
//   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//   return new Promise((resolve, reject) => {
//     var transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'vasubirla@gmail.com',
//         pass: 'phjwptaxdnaunqol'
//       }
//     });

//     const mailOptions = {
//       from: 'vasubirla@gmail.com',
//       to: email,
//       subject: subject,
//       html: "<h3>Notification From MYHW App :</h1>" + "<h3>" + message + "</h1>"
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//         reject(error); // Email sending failed, reject the Promise
//       } else {
//         console.log("Email sent successfully.");
//         resolve(email); // Email sent successfully, resolve the Promise
//       }
//     });
//   });
// };


const sendNotification = async function (recipients, message, subject) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vasubirla@gmail.com',
      pass: 'phjwptaxdnaunqol'
    }
  });

  const mailOptions = {
    from: 'vasubirla@gmail.com',
    to: recipients.join(', '), // Join all recipients with a comma
    subject: subject,
    html: "<h3>Notification From MYHW App :</h1>" + "<h3>" + message + "</h1>"
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
    return true; // Email sent successfully
  } catch (error) {
    console.error(error);
    return false; // Email sending failed
  }
};


//----------------------- Send Push Notification ------------------------- 


const sendPushNotification1 = function (recipientId,message) {   
  
  // Retrieve the recipient's FCM token(s) from your database
  // (Assuming you have a function to do this)
  const recipientTokens = retrieveFCMTokensForUser(recipientId);

  if (recipientTokens && recipientTokens.length > 0) {
    const notificationMessage = {
      notification: {
        title: 'New Message',
        body: message,
      },
      tokens: recipientTokens, // Send to multiple recipients if needed
    };

    admin.messaging().sendMulticast(notificationMessage)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  } else {
    console.log('Recipient has no FCM tokens (offline or not registered for push notifications).');
  }


}

const sendPushNotification = async function (targetID,message, sourceId) {  
  const con = await connection();

  // const deviceIDs = retrieveDeviceIDsForUser(deviceID);

  const [rows] = await con.query('SELECT device_token FROM fcm_tokens WHERE user_id = ?', [targetID]);

  const [[user]] = await con.query('SELECT * FROM tbl_user WHERE id = ?', [sourceId]);


  const deviceIDs= rows.map(row => row.device_token);
  

  if (deviceIDs && deviceIDs.length > 0) {
    const notificationMessage = {
      notification: {
        title: 'New Message From '+user.firstname,
        body: message,
      },
      tokens: deviceIDs, // Send to multiple recipients if needed
    };

    // user sendEachForMulticast  if sendMulticast not working
    admin.messaging().sendMulticast(notificationMessage)
      .then((response) => {
        console.log('Push Notification Sent...');
      })
      .catch((error) => {
                console.error('Error sending message:', error);
                if (error.code === 'messaging/invalid-registration-token') {
                  console.log('Invalid FCM token. Check and update the token in your database.');
                } else if (error.code === 'messaging/registration-token-not-registered') {
                  console.log('FCM token is not registered for receiving notifications.');
                } else {
                  console.log('Unknown error:', error.code);
                }
      });
  } else {
    console.log('User has no associated device IDs (offline or not registered for push notifications).');
  }
}


//-------------------------------------------


const sendSMS = async function (to, body) {    



  try {
    const message = await client.messages.create({
      body,
      from: '+18507898637', // Your Twilio phone number
      to, // Recipient's phone number
    });

    console.log('SMS sent successfully:', message.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
 
}


export { hashPassword , comparePassword , sendMailOTP , responsetoQuery, sendNotification ,
   sendPushNotification, sendPushNotification1, sendSMS};

