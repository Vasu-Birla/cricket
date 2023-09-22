// ChatController.js

import connection from '../config.js';

const con = await connection();



const chatHome = async (req, res, next) => {

//    res.render('chat')
    
//   //res.sendFile(__dirname + "/public/index.html");

};


const updloadinChat  = async(req,res,next)=>{
   const con = await connection(); 

   const files = req.files;
   const file = files.file[0];
   

   if(files.thumbnail){
      const thumb = files.thumbnail[0];
      
           
              const filePath = `http://${process.env.Host}/chatUploads/${file.filename}`;
              //const filePath = `http://192.168.1.7:3005/chatUploads/${file.filename}`;
              const filename = file.filename
              const mimetype = file.mimetype
              const result =  'success';
               const thumbnail = `http://${process.env.Host}/chatUploads/${thumb.filename}`;
             //  const thumbnail = `http://192.168.1.7:3005/chatUploads/${thumb.filename}`;
              res.json({ result,filePath,  filename, mimetype ,thumbnail });


   }
   else{  
                const filePath = `http://${process.env.Host}/chatUploads/${file.filename}`;
              //const filePath = `http://192.168.1.7:3005/chatUploads/${file.filename}`;
              const filename = file.filename
              const mimetype = file.mimetype
              const result =  'success';
              const thumbnail = '';
              res.json({ result,filePath,  filename, mimetype ,thumbnail });
   }

 

   

   // if(file){
   //    if (file.mimetype = 'video'){

                // const filePath = `http://${process.env.Host}/chatUploads/${req.file.filename}`;
      // const filePath = `http://192.168.1.7:3005/chatUploads/${req.file.filename}`;
      // const filename = file.filename
      // const mimetype = file.mimetype
      // const result =  'success';
      // res.json({ result,filePath,  filename, mimetype  });


   //    }else{

   //              // const filePath = `http://${process.env.Host}/chatUploads/${req.file.filename}`;
   //    const filePath = `http://192.168.1.7:3005/chatUploads/${req.file.filename}`;
   //    const filename = file.filename
   //    const mimetype = file.mimetype
   //    const result =  'success';
   //    res.json({ result,filePath,  filename, mimetype  });


   //    }




   // }else{
   //    res.json({ "result":"failed" });
   // }
   

}

const chatList  = async(req,res,next)=>{
   const con = await connection(); 

   // const [chats] = await con.query("SELECT * FROM messages WHERE (user_from = '" + data.sourceId+ "' AND  user_to = '" + data.targetId + "' ) OR (user_from = '" + data.targetId + "' AND  user_to = '" + data.sourceId+ "')  ORDER BY timestamp ASC")
   
   var userID = req.body.user_id;
   const [chats] = await con.query('SELECT * FROM messages WHERE user_from = ? ORDER BY timestamp ASC', [userID ]);  
   const [chats1] = await con.query('SELECT * FROM messages WHERE user_to = ? ORDER BY timestamp ASC', [userID ]);  
  
  for (let row of chats1){

   row.user_to = row.user_from;
  }

   // Merge the two arrays into a single chat list
const chatList = chats.concat(chats1);

// Sort the merged chat list by timestamp in ascending order
chatList.sort((a, b) => a.timestamp - b.timestamp);


   var receivers = [];

   const uniqueReceivers = new Set();

  //----------- unread msg start ------- 
   var unreadCount;

//    const [results] = await con.query('SELECT COUNT(*) as unreadMsgCount FROM messages WHERE user_to = ? AND readStaus = false', [userID] );


//    if (results.length > 0) {
//      // Extract the unread message count from the query results
//       unreadCount  = results[0].unreadMsgCount;
    
//  } else {
//      // No unread messages found for the user
//      unreadCount= 0;
//  }

//  console.log("Unread Messages",unreadCount)
  //----------- unread msg end ------- 

   for (const row of chatList) {
      const receiverID = row.user_to;
      const senderID = row.user_from;   
      if (!uniqueReceivers.has(receiverID)) {

         
         var [[receiver]] = await con.query('SELECT * from tbl_user where id = ? ',[receiverID]); 
         const [[user]] = await con.query('SELECT * FROM messages WHERE user_from = ? ORDER BY timestamp ASC', [receiverID ]);  
         const [unreadResult] = await con.query('SELECT * FROM messages WHERE user_from = ? AND user_to = ? AND readStaus = ? ', [receiverID,userID,'false'] );
            
       

         console.log(unreadResult.length," unread msgs from ",receiverID," for ",userID)
      //    if (unreadResult.length > 0) {
      //       // Extract the unread message count from the query results
      //        unreadCount  = unreadResult[0].unreadMsgCount;
           
      //   } else {
      //       // No unread messages found for the user
      //       unreadCount= 0;
      //   }


   
         if(user != undefined){
            const currentTime = new Date().getTime();
            // const timestamp = parseInt(user.userStatus, 10)
            // const date = new Date(timestamp);
            // var lastSeen = date.toLocaleString();  

            if(user.userStatus != 'online'){
               var lastSeen = parseInt(user.userStatus, 10);

               const timeDifference = Math.floor((currentTime - lastSeen) / 1000);
              // lastSeen = `active ${timeDifference} min${timeDifference > 1 ? 's' : ''} ago`;

               if (timeDifference < 60) {
                  // Less than a minute ago
                  lastSeen = `active ${timeDifference} second${timeDifference !== 1 ? 's' : ''} ago`;
                } else if (timeDifference < 3600) {
                  // Less than an hour ago
                  const minutes = Math.floor(timeDifference / 60);
                  lastSeen = `active ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
                } else if (timeDifference < 86400) {
                  // Less than a day ago
                  const hours = Math.floor(timeDifference / 3600);
                  lastSeen = `active ${hours} hour${hours !== 1 ? 's' : ''} ago`;
                } else {
                  // More than a day ago
                  const days = Math.floor(timeDifference / 86400);
                  lastSeen = `active ${days} day${days !== 1 ? 's' : ''} ago`;
                }


               
            }
            else{
               lastSeen = 'online'
            }

   
      
         }else {
            lastSeen = "Never Logged in"
         }
   
        var panewala = {"id":receiver.id, "name":receiver.firstname,"image":receiver.imagePath,"LastSeen": lastSeen,"unreadCount":unreadResult.length}
         receivers.push(panewala)



         uniqueReceivers.add(receiverID);
      }
   
  } 

 res.send(receivers)
}


  

export {  chatHome, updloadinChat , chatList}