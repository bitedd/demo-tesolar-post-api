const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// 위에서 middleware를 설정해주면, 아래는 다 적용 받음.
router.use(protect);
router.use(authorize('officer'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
