import express from "express";
import * as path from 'path';
import * as url from 'url';
import cookie from 'cookie-parser';

import dotenv from 'dotenv' 
import connection from './config.js'



import http from 'http';
// import { Server as SocketIO } from 'socket.io'; // Import Socket.IO


import IndexRouter from './routes/IndexRoute.js';
import IndexRouterAPI from './routes/IndexRouteAPI.js';
import ChatRouter from './routes/ChatRoute.js';

import initializeChatService from './controllers/chatSocket.js'; 

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express();
const server = http.createServer(app);
//const io = new SocketIO(server);


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// const upload = multer();
// app.use(upload.none())

const port = 3006;




//----------------------  global  Middle ware start ----------------

app.use(express.static(path.join(__dirname,"public")));

//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(cookie());

//app.use(bodyParser());
//app.use(bodyParser.urlencoded());
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({  extended: true}));




app.use(async (req, res, next) => {  

  
  const con = await connection();

  const [[user]] = await con.query('SELECT * FROM tbl_admin WHERE id = ?', [1]);
  app.locals.user = user;
  next(); 
  
});

app.use("/",IndexRouter);

app.use('/api', IndexRouterAPI);

app.use('/chat',ChatRouter);





//------------------   Middleware End ---------------


app.set("view engine","ejs");
app.set("views", [
		path.join(__dirname,"./views"),
		path.join(__dirname,"./views/notwork/")		
	]  );

//env File added 
dotenv.config({path:"./config.env"});



//===========================  Devlepment Start ==================== 
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

initializeChatService(server);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Initialize chatSocket


// Start the Kilchat server on a different port
// server.listen(chatPort, () => {
//   console.log(`KilChat Server is running on port ${chatPort}`);
// });
