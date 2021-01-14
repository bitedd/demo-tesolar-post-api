const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const PackageSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Please add a item name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    itemType: {
      type: String,
      required: [true, 'Please add a item type'],
      enum: ['electronics', 'stuff', 'food', 'furniture'],
    },
    packagePrice: {
      type: Number,
      min: [0, 'Package price must be at least 0'],
      default: 0,
    },
    deliveryPrice: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      default: 4000,
    },
    deliveryPricePaid: {
      type: Boolean,
      default: true,
    },
    senderAddress: {
      type: String,
      required: [true, 'Please add an sender address'],
    },
    recieverAddress: {
      type: String,
      required: [true, 'Please add an reciever address'],
    },
    senderLocation: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    recieverLocation: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },

    photo: {
      type: String,
      default: 'photo-icon.jpg',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId, // Package와 User의 relationship
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geocode & create location field
PackageSchema.pre('save', async function (next) {
  let loc = await geocoder.geocode(this.senderAddress);
  this.senderLocation = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  loc = await geocoder.geocode(this.recieverAddress);
  this.recieverLocation = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.senderAddress = undefined;
  this.recieverAddress = undefined;
  next();
});

// Cascade delete package event information when a package is deleted
PackageSchema.pre('remove', async function (next) {
  console.log(`Package Events being removed from package ${this._id}`);
  await this.model('PackageEvent').deleteMany({ package: this._id });
  next();
});

// Reverse populate with virtuals
PackageSchema.virtual('packageEvents', {
  ref: 'PackageEvent',
  localField: '_id',
  foreignField: 'package',
  justOne: false,
});

module.exports = mongoose.model('Package', PackageSchema);
