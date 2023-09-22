import express from 'express'
import multer from 'multer';
import path from 'path';
import { chatHome, chatList, updloadinChat} from '../controllers/ChatController.js';


const router = express.Router(); 



// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 	  cb(null, 'public/chatUploads/'); // Set the destination folder
// 	},
// 	filename: (req, file, cb) => {
// 	  // Rename the file to avoid conflicts
// 	  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// 	  const extension = path.extname(file.originalname);
// 	  cb(null, file.fieldname + '-' + uniqueSuffix + extension);
// 	}
//   });
  
//   // Define the file filter

//   const fileFilter = (req, file, cb) => {
//     cb(null, true); // Accept all files
// };
  
//   const upload = multer({ storage: storage, fileFilter: fileFilter });



// Define the storage for files
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	  cb(null, 'public/chatUploads/'); // Set the destination folder
	},
	filename: (req, file, cb) => {
	  // Rename the file to avoid conflicts
	  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
	  const extension = path.extname(file.originalname);
	  cb(null, file.fieldname + '-' + uniqueSuffix + extension);
	},
  });
  
  // Define the file filter
  const fileFilter = (req, file, cb) => {
	cb(null, true); // Accept all files
  };
  
  const upload = multer({ storage: storage, fileFilter: fileFilter });

  //---------------- Middle ware End -------------



// Define WebSocket route(s)
// router.route('/').get( upload.none(),chatHome);

//router.route('/upload').post(upload.single('file'),updloadinChat);

//router.route('/upload').post(upload.array('file','thumbnail','mimetype'),updloadinChat);

router.route('/upload').post(upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updloadinChat);

router.route('/chatList').post(upload.none(),chatList);



export default router