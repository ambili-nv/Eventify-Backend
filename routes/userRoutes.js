const express = require('express')
const router = express.Router();
const userController = require('../controller/userController')
const { verifyToken, requireUser } = require('../Middlewares/authmiddleware'); // Import the middleware


router.post('/register',userController.registerUser)
router.post('/login',userController.userLogin)
router.get('/user-services',userController.getAllService)
router.get('/service-details/:serviceId',userController.getServiceById)
router.post('/check-availability',userController.checkAvailability)
router.post('/create-checkout-session',verifyToken,requireUser,userController.bookService)
router.post('/confirm-payment/:bookingId',verifyToken,requireUser,userController.confirmPayment); // New route for confirming payment
router.get('/users-history',verifyToken,requireUser,userController.getUserBookings); // New route for confirming payment


module.exports = router;   