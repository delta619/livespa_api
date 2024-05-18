const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    trim: true,
  },
  appointment_id: {
    type: String,
  },
  contact: {
    type: String,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
  },
  pmc_details: {
    type: String,
  },
  paid: {
    type: Boolean,
    default: 'false',
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  matchedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
  ],
  registeredAt: {
    type: Date,
    default: () => new Date().toISOString(),
  },
  customer_details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  services: {
    type: [String],
    default: [],
  },
  duration: {
    type: String,
    default: "N/A",
  },
  cabin: {
    type: String,
    default: "",
  },
});

const Appointment = mongoose.model('Appointments', appointmentSchema);

module.exports = Appointment;
