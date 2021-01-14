const mongoose = require('mongoose');

const PackageEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: [true, 'Please add a event type'],
    enum: ['recepted', 'standby', 'on delivery', 'delivered'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  package: {
    type: mongoose.Schema.ObjectId, // Package와 PackageEvent 의 relationship
    ref: 'Package',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId, // PackageEvent와 User의 relationship
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('PackageEvent', PackageEventSchema);
