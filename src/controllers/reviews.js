const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Package = require('../models/Package');

// @desc      Get reviews
// @route     GET /api/v1/reviews
//            모든 리뷰
//
// @route     GET /api/v1/packages/:packageId/reviews
//            해당 패키지의 리뷰
//
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  // /api/v1/packages/:packageId/reviews
  if (req.params.packageId) {
    const reviews = await Review.find({ package: req.params.packageId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'package',
    select: 'itemName itemType',
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Add review
// @route     POST /api/v1/packages/:packageId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.package = req.params.packageId; // 나중에 mongodb에 넣기 위해서
  req.body.user = req.user.id; // 나중에 mongodb에 넣기 위해서

  const package = await Package.findById(req.params.packageId);

  if (!package) {
    return next(
      new ErrorResponse(
        `No package with the id of ${req.params.packageId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is customer
  if (review.user.toString() !== req.user.id && req.user.role !== 'customer') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is customer
  if (review.user.toString() !== req.user.id && req.user.role !== 'customer') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await review.remove(); // Review 가 아니고 review인거에 주목.

  res.status(200).json({
    success: true,
    data: {},
  });
});
