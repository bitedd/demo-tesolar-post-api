const express = require('express');
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  getPackagesInRadius,
  packagePhotoUpload,
} = require('../controllers/packages');

const Package = require('../models/Package');

// Include other resource routers
const packageEventRouter = require('./packageEvents'); // /api/v1/packages/:packageId/packageevents
const reviewRouter = require('./reviews'); // /api/v1/packages/:packageId/reviews

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
// /api/v1/packages/:packageId/packageevents
// /api/v1/packages/:packageId/reviews
router.use('/:packageId/packageevents', packageEventRouter);
router.use('/:packageId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getPackagesInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('officer'), packagePhotoUpload);

router
  .route('/')
  .get(advancedResults(Package, 'packageEvents'), getPackages)
  .post(protect, authorize('officer'), createPackage);

router
  .route('/:id')
  .get(getPackage)
  .put(protect, authorize('officer'), updatePackage)
  .delete(protect, authorize('officer'), deletePackage);

module.exports = router;
