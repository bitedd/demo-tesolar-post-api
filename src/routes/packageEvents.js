const express = require('express');
const {
  getPackageEvents,
  getPackageEvent,
  addPackageEvent,
  updatePackageEvent,
  deletePackageEvent,
} = require('../controllers/packageEvents');

const PackageEvent = require('../models/PackageEvent');

const router = express.Router({ mergeParams: true }); // /api/v1/packages/:packageId/packageevents

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(PackageEvent, {
      path: 'package', // for populating packages collection
      select: 'itemName itemType',
    }),
    getPackageEvents
  )
  .post(protect, authorize('officer', 'postman'), addPackageEvent);

router
  .route('/:id')
  .get(getPackageEvent)
  .put(protect, authorize('officer', 'postman'), updatePackageEvent)
  .delete(protect, authorize('officer', 'postman'), deletePackageEvent);

module.exports = router;
