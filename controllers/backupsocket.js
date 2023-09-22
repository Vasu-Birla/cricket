import { Server as SocketIO } from 'socket.io';
import { sendPushNotification } from '../middleware/helper.js'

import fs from 'fs/promises';

import connection from '../config.js';

const db = await connection();

import path from 'path';





export default function initializeChatService(server) {  
  
        //---------------------- Main Section start -----------------------------------
        const chatPort =3006;
        const clients = {}; 
     
        const onlineUsers = new Map();
       // const unreadMessageCounts = {};

        const io = new SocketIO(server);

    io.on('connection', (socket) => {
        console.log("Chat Socket connected...");

        socket.on('userConnected', async (userId) => {
         console.log("User Connected -> ",userId)
          onlineUsers.set(socket.id, { userId, unreadMsgCount: 0 });
          var newStatus = 'online'
          await db.query('UPDATE messages SET userStatus = ? WHERE user_from = ?', [newStatus, userId]);
          updateOnlineStatus(userId, true);

         

        });

        //----  KilLogin Start --------
        socket.on("signIn",async (id)  => {
            console.log("logged in ",id);
            clients[id] = socket;           
          
       
            // const initialUnreadCount = unreadMessageCounts[id] || 0;

            // console.log("Unread Msg for "+id+" is -> ",initialUnreadCount)
            // socket.emit('unreadMsgCount', initialUnreadCount);
           
        })
        //--------- Kil End ------ 

        //------------------ UnRead Msg -------------------- 
        socket.on('unreadMsgs', async (userId) => { 

         
          var unreadCount;
      
          const [results] = await con.query('SELECT COUNT(*) as unreadMsgCount FROM messages WHERE user_to = ? AND readStaus = false', [userId] );
          //const [results1] = await con.query('SELECT COUNT(*) as unreadMsgCount FROM messages WHERE user_from  = ? AND user_to = ? AND readStaus = false', [userId] );
      
          if (results.length > 0) {
            // Extract the unread message count from the query results
             unreadCount  = results[0].unreadMsgCount;
           
           
        } else {
            // No unread messages found for the user
            unreadCount= 0;
        }
      
        console.log("Unread Messages",unreadCount)
        socket.emit('unreadmsgs', unreadCount); 
        //unreadMessageCounts[userId] = unreadCount;

        

        })

           //------------------ UnRead Msg End  -------------------- 


           //-------------------  read all ------------ 

          

    
        //------------------  Send and Receive Real-Time msg -------------------------------

        socket.on("message", async(msg)=> {               

            var data = msg;  

            //console.log(data); 
           // console.log(data)
            
              //var data = msg;
                  let targetId = msg.targetId;
                console.log("to User -> ",targetId)                

              if(data.filename == '' || data.filePath == '' || data.mimetype== ''){        
                      data.filename =""
                      data.filePath =""
                      data.thumbnail =''
                      data.mimetype = "txt"
                  }

                  var kil = data.filePath;
                  if(data.mimetype== 'video'){                     
                    
                    kil  = data.thumbnail
                    console.log("thumbnail..........",kil)     
                    data.thumbnail =data.filePath
                
                }

              
                 

                  // console.log(data); 
                  // console.log(data.mimetype) ;
    

          var timestamp = Date.now()
          
          var date = new Date(timestamp);

          var formattedDate = date.toLocaleDateString();
          var hours = date.getHours();
          var minutes = date.getMinutes();
          var seconds = date.getSeconds();

          // Determine if it's AM or PM
          var amPm = hours >= 12 ? 'PM' : 'AM';

          // Convert to 12-hour format
          hours = hours % 12;
          hours = hours ? hours : 12; // Handle midnight (0 hours)

          // Format the time as a string (add leading zeros if needed)
          var formattedTime = hours.toString().padStart(2, '0') + ':' +
                            minutes.toString().padStart(2, '0') + ' ' +
                            amPm;

          var formattedDateTime = formattedDate + ' ' + formattedTime;
          var userStatus = '';
          var readStaus = 'false';

          if(clients[targetId]){ 
             readStaus = 'true';
           }

            
  var main = "INSERT INTO `messages` (`user_from`, `user_to`, `message`, `filename`, `filePath`, `mimetype`, `thumbnail`, `timestamp`,`userStatus`, `readStaus`) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?)"
            //db.query("INSERT INTO `messages` (`user_from`,`user_to`,`message`,`image`,`base64`,`timestamp`) VALUES ('"+data.sourceId+"','"+data.targetId+"','"+data.message+"','"+data.image+"','"+data.base64+"','"+formattedDateTime+"')");
            
        const [insertedResult] =  await  db.query(main,[data.sourceId, data.targetId, data.message, data.filename, kil , data.mimetype, data.thumbnail , formattedDateTime,userStatus, readStaus])
                 

        if(insertedResult){

                    const insertedRowId = insertedResult.insertId;

                  
                   var [latestMsg] = await db.query("SELECT * FROM messages WHERE id = '" +insertedRowId+ "'")

                    for( let row of latestMsg){

                      row.timestamp = formattedTime;
                    }      
                  
                           
                    // const targetUserSocket = [...onlineUsers.values()].find(
                    //   (user) => user.userId == data.targetId
                    // );
                    //   console.log("online Users - ->  ",onlineUsers)
                    //   console.log("targetUserSocket - ->  ",targetUserSocket)

                    // if (targetUserSocket) {
                    //   targetUserSocket.unreadMsgCount += 1;
                    //   // Emit the updated unread message count to the target user
                    //   io.to(targetUserSocket.id).emit("unreadMsgCount", targetUserSocket.unreadMsgCount);

                    //   console.log("unread msg count -. ,",targetUserSocket.unreadMsgCount)
                    // }           
                  
          
          
                 // latestMsg =   JSON.stringify(latestMsg);
                  
                //  console.log(latestMsg)
                  if(clients[targetId]){                
                    console.log("Online TargetID ",targetId); 
                   // sendPushNotification(targetId,latestMsg[0].message)                
                    clients[targetId].emit("message", latestMsg);                

                  } else{
                   
                   console.log("Off-line TargetID", targetId);
                   sendPushNotification(targetId,latestMsg[0].message,data.sourceId) 
                  // socket.emit("message", latestMsg);  
                       
                   //clients[targetId].emit("message", latestMsg); 
                   }


        }
                  else{
                    console.log("nhi hua insert")
                  }


             

            });  // messesage socket End  




        //-------------------------  End msg ----------------------------------

  


//---------------------- Delete Chat start  --------------------------------


    socket.on('delete',async(messageIds, targetId) => {
      // clients[targetId] = socket;

            if (!Array.isArray(messageIds)) {
            console.error('Invalid messageIds. Expected an array.');
            return;
            } 
            
          //   for (const row of messageIds) {  
          //     const [[msg]] = await db.query('SELECT * from messages where id = ? ',[row]);
                        
          //     if( msg && msg.mimetype != 'txt'){
          //       var filepath = path.join('public', 'chatUploads', msg.filename);  
          //     await fs.unlink(filepath);               
          //     }             
              
          // }


          const filePathsToDelete = messageIds.map( async (messageId) => {
                        
            const [[msg]] = await db.query('SELECT * from messages where id = ? ',[messageId]);  
     
            if(msg && msg.mimetype != 'txt'){
              var filepath = path.join('public', 'chatUploads', msg.filename);  
            await fs.unlink(filepath);               
            } else{
              return;
            }
          });
            // ----Delete the messages with the given messageIds from the "messages" table
            const deleteQuery = 'DELETE FROM messages WHERE id IN (?)';

            const [result] = await db.query(deleteQuery, [messageIds]);

            if(result){

              if(clients[targetId]){                
                clients[targetId].emit("messagesDeleted", messageIds);        

              }else{
                socket.emit('messagesDeleted', messageIds);
            }
             
               //------- Broadcast the "delete" event to all connected clients (excluding the sender)
               // socket.broadcast.emit('messagesDeleted', messageIds);                    
         
            } else {
                console.error('Error deleting messages:', err);
                return;
            }
          
        
             
   });     


                             
                      

 
//----------  Delete Chat End ----------------------------------

  // .................On Typing...............
  socket.on('is_typing', (data) =>{
    if(data.status === true) {
       socket.emit("typing", data);
       socket.broadcast.emit('typing', data);
     } else {
       socket.emit("typing", data);
       socket.broadcast.emit('typing', data);
     }
  });
  //------------------- on Typing End...............


  // ---------------------- Chat History  ------------------------- 
  socket.on('chatHistory', async (data) =>{  console.log(".........",data.sourceId)


  const [chats] = await db.query("SELECT * FROM messages WHERE (user_from = '" + data.sourceId+ "' AND  user_to = '" + data.targetId + "' ) OR (user_from = '" + data.targetId + "' AND  user_to = '" + data.sourceId+ "')  ORDER BY timestamp ASC")
  
  //--- here userFrom value will be userTO actually
  const [readALL] = await db.query('UPDATE messages SET readStaus = ? WHERE user_from =? AND user_to = ?', ['true',data.targetId, data.sourceId]);
  
  if(readALL){
    console.log("readALL updated");
  }

  for (let row of chats ){

    var timestamp = row.timestamp

    const [, timePart] = timestamp.split(" ");
  
    // Split the time part into hours, minutes, and AM/PM
    const [hoursMinutes, ampm] = timePart.split(" ");
    const [hours, minutes] = hoursMinutes.split(":");
    var amPm = hours >= 12 ? 'PM' : 'AM';
     row.timestamp = `${hours}:${minutes} ${amPm}`;
  }

 
 
  var chatHistory = chats.map(row => { 
    row.id =  ""+ row.id +""      
    return { ...row };    
  })  
  
   // console.log(chatHistory);
    
  socket.emit('chatHistory', chatHistory);              
    
  
});

//--------------------------- Chat History End ---------------------

socket.on('chatList', async (userID) =>{

  //var userID = req.body.user_id;
  const [chats] = await db.query('SELECT * FROM messages WHERE user_from = ? ORDER BY timestamp ASC', [userID ]);  
  const [chats1] = await db.query('SELECT * FROM messages WHERE user_to = ? ORDER BY timestamp ASC', [userID ]);  
 
 for (let row of chats1){

  row.user_to = row.user_from;
 }

  // Merge the two arrays into a single chat list
const chatList = chats.concat(chats1);

// Sort the merged chat list by timestamp in ascending order
chatList.sort((a, b) => a.timestamp - b.timestamp);


  var receivers = [];

  const uniqueReceivers = new Set();


  for (const row of chatList) {
     const receiverID = row.user_to;  
     if (!uniqueReceivers.has(receiverID)) {

        
        var [[receiver]] = await db.query('SELECT * from tbl_user where id = ? ',[receiverID]); 
        const [[user]] = await db.query('SELECT * FROM messages WHERE user_from = ? ORDER BY timestamp ASC', [receiverID ]);  
  
           
  
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
  
       var panewala = {"id":receiver.id, "name":receiver.firstname,"image":receiver.imagePath,"LastSeen": lastSeen}
        receivers.push(panewala)



        uniqueReceivers.add(receiverID);
     }
  
 } 

 socket.emit('chatList', receivers);   

});

//----------------- chatList start -------------- 




//------------------ chatList End --------------------



              socket.on('disconnect', async () => {
                console.log('A user disconnected.');
                const disconnectedUserId = Object.keys(clients).find(key => clients[key] === socket);
                var newStatus = Date.now()
                await db.query('UPDATE messages SET userStatus = ? WHERE user_from = ?', [newStatus, disconnectedUserId]);
                
                onlineUsers.delete(socket.id);

                if (disconnectedUserId) {
                    updateOnlineStatus(disconnectedUserId, false); // Update user's online status
                    delete clients[disconnectedUserId];
                }
              
              
            })
//------------------ online / offline status check ... 
            socket.on('checkUserStatus', (targetUserId) => {
              const isOnline = clients.hasOwnProperty(targetUserId);
              socket.emit("userStatus", { userId: targetUserId, online: isOnline });
          });
            function updateOnlineStatus(userId, online) {
              io.emit("userStatus", { userId, online });
          }
        
    });


 
      


    //-------------------------------  Main Section End ----------------------------------

    // server.listen(chatPort, () => {
    //     console.log(`KilChat Server is running on port ${chatPort}`);
    // });
}
