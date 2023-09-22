import express from 'express'
import { homePage , Kil, Login, addUser, viewUser, 
    Register, Profile, ongoingBooking,
     bookHistory, Notify, Support, 
     Faq_User, Faq_Driver, TC_User,
      TC_Driver, userPrivacy, driverPrivacy, 
      loginAdmin,
      Logout,
      updateAdmin,
      addUserPost,
      updateS,
      loginUserPost,
      SupportPost,
      Faq_UserPost,
      addProduct,
      addProductPost,
      viewProducts,
      updateStock,
      ImgReq,
      ImgReqPost,
      userProfile,
      userProfilePost,
      aboutUs,
      aboutUsPost,
      TC_UserPost,
      userPrivacyPost,
      QueriesPost,
      Queries,
      sendMailtoUser,
      Schema,
      Schema1,
      NotifyPost,
      addCoupon,
      verifycpn,
      fetchProduct,
      editProduct} from '../controllers/indexController.js';

    import upload from '../middleware/upload.js';
      import { isAuthenticatedAdmin} from '../middleware/Adminauth.js' ;

const router = express.Router(); 



//------------- Routing Start -----------------------

router.route('/').get(isAuthenticatedAdmin,homePage)

router.route('/kil').get(Kil)

router.route('/login').get(Login)

router.route('/login').post(loginAdmin)

router.route('/logout').get(isAuthenticatedAdmin,Logout)



router.route('/addUser').get(isAuthenticatedAdmin,addUser)

router.route('/addUser').post(isAuthenticatedAdmin,upload.single('image'),addUserPost)

router.route('/loginUser').post(loginUserPost)



router.route('/viewUser').get(isAuthenticatedAdmin,viewUser)


router.route('/updateUserstatus').post(isAuthenticatedAdmin,updateS)



router.route('/register').get(Register)

router.route('/profile').get(isAuthenticatedAdmin,Profile)

router.route('/profile').post(isAuthenticatedAdmin,upload.single('image'),updateAdmin)



router.route('/addproduct').get(isAuthenticatedAdmin,addProduct)

router.route('/addproduct').post(isAuthenticatedAdmin,upload.single('image'),addProductPost)

router.route('/products').get(isAuthenticatedAdmin,viewProducts)


router.route('/updatestock').post(isAuthenticatedAdmin,updateStock)

router.route('/editProduct').get(isAuthenticatedAdmin,fetchProduct)

router.route('/editProduct').post(isAuthenticatedAdmin,upload.single('image'),editProduct)




router.route('/ongoingBooking').get(isAuthenticatedAdmin,ongoingBooking)

router.route('/bookHistory').get(isAuthenticatedAdmin,bookHistory)

router.route('/notifications').get(isAuthenticatedAdmin,Notify)

router.route('/notifications').post(isAuthenticatedAdmin, NotifyPost)



router.route('/support').get(isAuthenticatedAdmin,Support)

router.route('/support').post(isAuthenticatedAdmin,SupportPost)




router.route('/Faq_User').get(isAuthenticatedAdmin,Faq_User)

router.route('/Faq_User').post(isAuthenticatedAdmin,Faq_UserPost)






router.route('/Faq_Driver').get(isAuthenticatedAdmin,Faq_Driver)


router.route('/TC_User').get(isAuthenticatedAdmin,TC_User)

router.route('/TC_User').post(isAuthenticatedAdmin,TC_UserPost)

router.route('/TC_Driver').get(isAuthenticatedAdmin,TC_Driver)

router.route('/userPrivacy').get(isAuthenticatedAdmin,userPrivacy)

router.route('/userPrivacy').post(isAuthenticatedAdmin,userPrivacyPost)

router.route('/driverPrivacy').get(isAuthenticatedAdmin,driverPrivacy)

router.route('/aboutus').get(isAuthenticatedAdmin, aboutUs)

router.route('/aboutus').post(isAuthenticatedAdmin, aboutUsPost)


router.route('/imgreq').get(isAuthenticatedAdmin,ImgReq)

router.route('/imgreq').post(isAuthenticatedAdmin,ImgReqPost)


router.route('/userprofile/:id').get(isAuthenticatedAdmin,userProfile)

router.route('/userprofile').post(isAuthenticatedAdmin,upload.single('image'),userProfilePost)

router.route('/query').get(isAuthenticatedAdmin,Queries)

router.route('/query').post(isAuthenticatedAdmin, QueriesPost)

router.route('/sendemail').post(isAuthenticatedAdmin, sendMailtoUser)




router.route('/schema').get(Schema)

router.route('/tablemaps').get(Schema1)

router.route('/addcpn').post(upload.none(),addCoupon)


router.route('/verifycpn').post(upload.none(),verifycpn)






export default router