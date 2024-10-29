
// const express = require('express');
// const connectDatabase = require('./config/connection');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const userRoutes = require('./routes/userRoutes'); // Import your user routes
// const adminRoutes = require('./routes/adminRoutes')
// const Slot = require('./model/SlotModal')
// const router = express.Router();
// const Booking = require('./model/BookingModal')

// dotenv.config();
 
// const app = express();

// // Middleware
// app.use(cors({
//     origin: '*',
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
// }));
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });

// // Connect to database

// // Middleware for parsing JSON
// app.use(express.json());

// // Use user routes
// app.use('/api', userRoutes); // Add this line to use user routes
// app.use('/api', adminRoutes); // Add this line to use user routes

// router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
//     const sig = req.headers['stripe-signature'];

//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//         console.log(`Webhook Error: ${err.message}`);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the payment_intent.succeeded event
//     if (event.type === 'checkout.session.completed') {
//         const session = event.data.object;

//         const { serviceId, userId, selectedDate } = session.metadata; // Pass userId and other data in metadata

//         // Create a new booking
//         const booking = await Booking.create({
//             user: userId,
//             service: serviceId,
//             // You should have the slot reference here
//             paymentStatus: 'completed',
//             bookingStatus: 'confirmed',
//         });

//         // Update the corresponding slot to booked
//         await Slot.findOneAndUpdate(
//             { service: serviceId, date: selectedDate },
//             { isBooked: true }
//         );

//         console.log(`Booking created: ${booking.id}`);
//     }

//     res.status(200).send('Received');
// });



// connectDatabase();
// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server started at http://localhost:${PORT}`);
// });




const express = require('express');
const connectDatabase = require('./config/connection');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // Import your user routes
const adminRoutes = require('./routes/adminRoutes');


dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Connect to database
connectDatabase();

// Middleware for parsing JSON
app.use(express.json());

// Use user routes
app.use('/api', userRoutes); // Add this line to use user routes
app.use('/api', adminRoutes); // Add this line to use admin routes



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
