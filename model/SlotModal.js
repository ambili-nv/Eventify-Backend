// slot.model.js
const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Slot', slotSchema);
