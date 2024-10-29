const bcrypt = require('bcryptjs')
const User = require('../model/userModal')
const jwt = require('jsonwebtoken')
const Service = require('../model/serviceModal')
const Slot = require('../model/SlotModal')
const Stripe = require('stripe')
const Booking = require('../model/BookingModal')


const registerUser = async(req,res)=>{
    console.log(req.body);
    const { name, email, password} = req.body;   
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    console.log(newUser,"newuser");
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
}

const userLogin = async(req,res)=>{
    console.log(req.body);
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  

    const token = jwt.sign(
        { userId: user._id, role: 'user' }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      console.log(token,"token///////");
      
  
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    
}

const getAllService = async(req,res)=>{
    try {
        const services = await Service.find(); 
        res.status(200).json({ services });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const getServiceById = async (req, res) => {
    const { serviceId } = req.params;
console.log(serviceId,"idddd");

    try {
        const service = await Service.findById(serviceId);
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json({ service });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkAvailability = async(req,res)=>{
    const { serviceId, selectedDate } = req.body;
    console.log(req.body);
    
    try {
      
        const date = new Date(selectedDate);
        const slot = await Slot.findOne({
            service: serviceId,
            date: date,
            isBooked: false,
        });

        if (slot) {
            res.json({ available: true });
        } else {
            res.json({ available: false });
        }
    } catch (error) {
        console.error("Error checking date availability:", error);
        res.status(500).json({ error: "Failed to check date availability" });
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const bookService = async (req, res) => {
    const { serviceId, selectedDate, price } = req.body; 
    const { userId } = req.user;

    try {
       
        const booking = await createBooking(userId, serviceId, selectedDate, price);
        const session = await createStripeSession(booking, price, selectedDate);
        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create booking and payment session' });
    }
};

const createBooking = async (userId, serviceId, selectedDate, price) => {
    const slot = await Slot.findOne({ service: serviceId, date: selectedDate });

    if (!slot) {
        throw new Error('Slot not found');
    }

    // Create a booking record
    const booking = new Booking({
        user: userId,
        service: serviceId,
        date: selectedDate,
        price: price,
        paymentStatus: 'pending', 
        bookingStatus: 'pending', 
        slot: slot._id, 
    });

    await booking.save(); 
    return booking;
};

const createStripeSession = async (booking, price, selectedDate) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Service Booking',
                        description: `Booking for date: ${selectedDate}`,
                    },
                    unit_amount: price * 100, 
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `https://eventify-frontend-pi.vercel.app/success/${booking._id}`, 
        // success_url: `http://localhost:5173/success/${booking._id}`, 
        cancel_url: 'https://eventify-frontend-pi.vercel.app/cancel',
        // cancel_url: 'http://localhost:5173/cancel',
    });

    return session; 
};





const confirmPayment = async (req, res) => {
    console.log("heyyy");
    
    const { bookingId } = req.params; 
    const { paymentStatus = 'paid', bookingStatus = 'confirmed' } = req.body;

    try {

        const booking = await Booking.findById(bookingId).populate('slot');
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

      
        booking.paymentStatus = paymentStatus;
        booking.bookingStatus = bookingStatus;
        await booking.save(); 

      
        const slot = booking.slot; 
        slot.isBooked = true;
        await slot.save();
        res.status(200).json({ message: 'Payment confirmed and booking updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
};





const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.user;
        const { page = 1, limit = 5 } = req.query; 
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'service',
                select: 'title price category contactDetails' 
            })
            .populate({
                path: 'slot',
                select: 'date'
            })
            .select('paymentStatus bookingStatus createdAt') 
            .sort({ createdAt: -1 }) 
            .skip((page - 1) * limit) 
            .limit(Number(limit)); 

        
        const totalCount = await Booking.countDocuments({ user: userId });

        res.json({ bookings, totalCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve booking history' });
    }
}






module.exports = {
    registerUser,
    userLogin,
    getAllService,
    getServiceById,
    checkAvailability,
    bookService,
    confirmPayment,
    getUserBookings,
}