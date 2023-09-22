import express from 'express'
import multer from 'multer';
import upload from '../middleware/upload.js';

import {isAuthenticatedUser} from '../middleware/auth.js'

import { register ,Login, Logout,  ForgotPassword ,
    resetpassword,
    getProducts,
    prodcutDetails,  
    fvtList,
    addtoFVT,
    addtocol,
    colList,
    removeFromCol,
    updloadBYUser,
    profile,
    profilePost,
    similarColl,
    aboutUs,
    TC_User,
    UserPrivacy,
    contactUS,
    aboutUs1,
    createPayment,
    successPayment,
    cancelPayment,
    paymentStatus,
    obtainToken} from '../controllers/indexControllerAPI.js';

const router = express.Router(); 

//router.use(upload.none());


//------------- API Routing Start -----------------------


router.route('/register').post( upload.none(),register);

router.route('/login').post( upload.none(),Login);

router.route('/logout').get( Logout);

router.route('/forgotpassword').post( upload.none(),ForgotPassword );

router.route('/resetpassword').post( upload.none(),resetpassword);

router.route('/products').post(upload.none(),getProducts);

router.route('/product').post( upload.none(),prodcutDetails);


router.route('/addtofvt').post( upload.none(),addtoFVT);

router.route('/fvtlist').post( upload.none(),fvtList);

router.route('/addtocol').post( upload.none(),addtocol);

router.route('/collist').post( upload.none(),colList);

router.route('/removefromCol').post( upload.none(),removeFromCol);

router.route('/uploadToyImg').post( upload.single('image'),updloadBYUser);

router.route('/getUser').post(upload.none(),profile)

router.route('/updateUser').post(upload.single('image'),profilePost)

router.route('/similarColl').post(upload.none(), similarColl )


router.route('/aboutus').get(upload.none(), aboutUs )

router.route('/aboutus1').get(upload.none(), aboutUs1 )

router.route('/tandc').get(upload.none(), TC_User )

router.route('/userPrivacy').get(upload.none(), UserPrivacy )


router.route('/contactus').post(upload.none(), contactUS )

//--------payment --

router.route('/create-payment').post(upload.none(), createPayment )
router.route('/success').get(upload.none(), successPayment )
router.route('/cancel').get(upload.none(), cancelPayment )

router.route('/isPaid').post(upload.none(), paymentStatus )

router.route('/getToken').post(upload.none(), obtainToken )


export default router