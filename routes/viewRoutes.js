const express = require('express');

const router = express.Router();
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const BookingController = require('./../controllers/bookingController');

router.get(
  '/',
  BookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-tours',
  // BookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours
);
router.get('/my-reviews', authController.protect, viewsController.getMyReviews);
router.get('/signup', viewsController.getSignupForm);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
