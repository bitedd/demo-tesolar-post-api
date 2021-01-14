const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true }); // /api/v1/packages/:packageId/reviews

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'package', // for populating packages collection
      select: 'itemName itemType',
    }),
    getReviews
  )
  .post(protect, authorize('customer'), addReview); // customer만 리뷰 작성한다.

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('customer'), updateReview) // customer만 리뷰 업데이트한다.
  .delete(protect, authorize('customer'), deleteReview); // customer만 리뷰 삭제 한다.

module.exports = router;
