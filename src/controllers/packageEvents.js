const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const PackageEvent = require('../models/PackageEvent');
const Package = require('../models/Package');

// @desc      Get package events
// @route     GET /api/v1/packageevents
// @route     GET /api/v1/packages/:packageId/packageevents
// @access    Public
exports.getPackageEvents = asyncHandler(async (req, res, next) => {
  if (req.params.packageId) {
    const packageEvents = await PackageEvent.find({
      package: req.params.packageId,
    });

    return res.status(200).json({
      success: true,
      count: packageEvents.length,
      data: packageEvents,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single packageEvents
// @route     GET /api/v1/packageevents/:id
// @access    Public
exports.getPackageEvent = asyncHandler(async (req, res, next) => {
  const packageEvent = await PackageEvent.findById(req.params.id).populate({
    path: 'package',
    select: 'itemName itemType',
  });

  if (!packageEvent) {
    return next(
      new ErrorResponse(`No package events with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: packageEvent,
  });
});

// @desc      Add Package Event
// @route     POST /api/v1/packages/:packageId/packageevents
// @access    Private
exports.addPackageEvent = asyncHandler(async (req, res, next) => {
  req.body.package = req.params.packageId; // 나중에 mongodb에 넣기 위해서
  req.body.user = req.user.id; // 나중에 mongodb에 넣기 위해서

  const package = await Package.findById(req.params.packageId);

  if (!package) {
    return next(
      new ErrorResponse(`No package with the id of ${req.params.packageId}`),
      404
    );
  }

  const packageEvent = await PackageEvent.create(req.body);

  res.status(200).json({
    success: true,
    data: packageEvent,
  });
});

// @desc      Update packageEvent
// @route     PUT /api/v1/packageevents/:id
// @access    Private
exports.updatePackageEvent = asyncHandler(async (req, res, next) => {
  let packageEvent = await PackageEvent.findById(req.params.id);

  if (!packageEvent) {
    return next(
      new ErrorResponse(`No package events with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is packageEvent owner
  //if (packageEvent.user.toString() !== req.user.id && req.user.role !== 'admin') {
  if (req.user.role !== 'officer') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update package event ${packageEvent._id}`,
        401
      )
    );
  }

  packageEvent = await PackageEvent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: packageEvent,
  });
});

// @desc      Delete package event
// @route     DELETE /api/v1/packageevents/:id
// @access    Private
exports.deletePackageEvent = asyncHandler(async (req, res, next) => {
  const packageEvent = await PackageEvent.findById(req.params.id);

  if (!packageEvent) {
    return next(
      new ErrorResponse(`No package event with the id of ${req.params.id}`),
      404
    );
  }

  if (req.user.role !== 'officer') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete package event ${packageEvent._id}`,
        401
      )
    );
  }

  await packageEvent.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
