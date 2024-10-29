const mongoose = require('mongoose')
const Service = require('../model/serviceModal');
const jwt = require('jsonwebtoken')
const Slot = require('../model/SlotModal')
const Booking = require('../model/BookingModal')


const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password, "admin credentials");

  // Check if the provided credentials match the ones in .env
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    // Generate a JWT token
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log(token, "admain token");

    return res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  } else {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }
};


const addService = async (req, res) => {
  try {
    const { title, category, price, description, location, contactDetails, images } = req.body;

    // Create a new service instance
    const newService = new Service({
      title,
      category,
      price,
      description,
      location,
      contactDetails,
      images,
    });

    // Save the service to the database
    const savedService = await newService.save();

    // Respond with the saved service data
    res.status(201).json({ message: 'Service created successfully', service: savedService });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
};




const listServices = async (req, res) => {
  try {
    const services = await Service.find(); // Fetches all services from the database
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};


const editService = async (req, res) => {
  const { id } = req.params; // Get the service ID from the request parameters
  const updatedServiceData = req.body; // Get the updated service data from the request body
  console.log(req.body, "service data");

  try {
    const service = await Service.findByIdAndUpdate(id, updatedServiceData, { new: true, runValidators: true });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: 'Error updating service', error: error.message });
  }
};

const getServiceDetails = async (req, res) => {
  const { id } = req.params; // Get the service ID from the request parameters

  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service); // Return the service details
  } catch (error) {
    console.error("Error fetching service details:", error);
    res.status(500).json({ message: 'Error fetching service details', error: error.message });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params; // Get the service ID from the request parameters

  try {
    // Ensure the service ID is valid
    if (!id) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    // Find the service by ID and remove it
    const service = await Service.findByIdAndDelete(id);

    // Check if the service was found and deleted
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Send back a success message
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
};
const addSlots = async (req, res) => {
  const { serviceId } = req.params; // Get serviceId from URL params
  const { dates } = req.body; // Expecting an array of dates

  try {
    // Log serviceId and dates to debug
    console.log("Service ID:", serviceId);
    console.log("Dates received:", dates);

    // Validate that dates are provided and in the future
    const now = new Date();
    const futureDates = dates.filter(date => new Date(date) > now);

    if (futureDates.length === 0) {
      return res.status(400).json({ message: "No valid future dates provided." });
    }

    // Create an array of slot documents
    const slots = futureDates.map(date => ({
      service: serviceId, // Ensure serviceId is being set
      date: new Date(date),
      isBooked: false
    }));

    // Log the slots being created
    console.log("Slots to be created:", slots);

    // Insert multiple slots into the database
    await Slot.insertMany(slots);

    res.status(201).json({ message: "Slots added successfully", slots });
  } catch (error) {
    console.error("Error adding slots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const getAllBookings = async (req, res) => {
//   try {
//     console.log("heyyeyyeye");
//     const bookings = await Booking.find()
//       .populate({
//         path: "user",
//         select: 'name email'
//       })
//       .populate({
//         path: 'service',
//         select: 'title price category'
//       })
//       .populate({
//         path: 'slot',
//         select: 'date'
//       })
//       .select('paymentStatus bookingStatus createdAt');
//     console.log(bookings, "user booking his");

//     res.status(200).json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching bookings' });
//   }
// }


const getAllBookings = async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // Get page and limit from query parameters

  try {
    const bookings = await Booking.find()
      .populate({
        path: "user",
        select: 'name email'
      })
      .populate({
        path: 'service',
        select: 'title price category'
      })
      .populate({
        path: 'slot',
        select: 'date'
      })
      .select('paymentStatus bookingStatus createdAt')
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip((page - 1) * limit) // Skip records based on the current page
      .limit(limit); // Limit the number of records per page

    // Get total count of bookings for pagination
    const totalBookings = await Booking.countDocuments();

    res.status(200).json({
      totalBookings,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};






module.exports = {
  addService,
  adminLogin,
  listServices,
  editService,
  getServiceDetails,
  deleteService,
  addSlots,
  getAllBookings
};