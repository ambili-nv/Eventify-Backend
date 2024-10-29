// const express = require('express')
// const router = express.Router();
// const adminController = require('../controller/adminController')

// router.post('/admin-login',adminController.adminLogin)
// router.post('/add-service',adminController.addService)
// module.exports = router; 



const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { verifyToken, requireAdmin } = require('../Middlewares/authmiddleware'); // Import the middleware

// Public route
router.post('/admin-login', adminController.adminLogin);

// Protected routes
router.post('/add-service', verifyToken, requireAdmin, adminController.addService); // Only admins can add services

router.get('/services', adminController.listServices);
router.put('/edit-services/:id', adminController.editService);
router.delete('/delete-services/:id', adminController.deleteService);
router.get('/services/:id', adminController.getServiceDetails);
router.post('/services/:serviceId/slots', adminController.addSlots);
router.get('/admin/bookings',verifyToken, requireAdmin, adminController.getAllBookings);


module.exports = router;
