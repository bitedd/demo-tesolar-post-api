const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Package = require('../models/Package');

// @desc      Get all packages
// @route     GET /api/v1/packages
// @access    Public
exports.getPackages = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single package
// @route     GET /api/v1/packages/:id
// @access    Public
exports.getPackage = asyncHandler(async (req, res, next) => {
  const package = await Package.findById(req.params.id);

  if (!package) {
    return next(
      new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: package });
});

// @desc      Create new package
// @route     POST /api/v1/packages
// @access    Private
exports.createPackage = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  const package = await Package.create(req.body);

  res.status(201).json({
    success: true,
    data: package,
  });
});

// @desc      Update package
// @route     PUT /api/v1/packages/:id
// @access    Private
exports.updatePackage = asyncHandler(async (req, res, next) => {
  let package = await Package.findById(req.params.id);

  if (!package) {
    return next(
      new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is package owner
  // package.user 는 Objectid이기 때문에, 비교를 위해서 toString()메소드로 String으로 변환해준다.
  //if (package.user.toString() !== req.user.id && req.user.role !== 'admin') {
  if (req.user.role !== 'officer') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this package`,
        401
      )
    );
  }

  package = await Package.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: package });
});

// @desc      Delete package
// @route     DELETE /api/v1/packages/:id
// @access    Private
exports.deletePackage = asyncHandler(async (req, res, next) => {
  const package = await Package.findById(req.params.id);

  if (!package) {
    return next(
      new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== 'officer') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this package`,
        401
      )
    );
  }

  package.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get packages within a radius
// @route     GET /api/v1/packages/radius/:zipcode/:distance
// @access    Private
exports.getPackagesInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const packages = await Package.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: packages.length,
    data: packages,
  });
});

// @desc      Upload photo for package
// @route     PUT /api/v1/packages/:id/photo
// @access    Private
exports.packagePhotoUpload = asyncHandler(async (req, res, next) => {
  const package = await Package.findById(req.params.id);

  if (!package) {
    return next(
      new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is package owner
  //if (package.user.toString() !== req.user.id && req.user.role !== 'admin') {
  if (req.user.role !== 'officer') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update photo this package`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  console.log(req.files); // for testing

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename (for not overwriting same file name)
  file.name = `photo_${package._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Package.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
