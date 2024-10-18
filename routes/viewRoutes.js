// const express = require('express');

// const router = express.Router();
// const viewsController = require('./../controllers/viewsController');
// const authController = require('./../controllers/authController');
// // eslint-disable-next-line import/no-unresolved, node/no-missing-require
// const BookingController = require('./../controllers/bookingController');

// router.use(viewsController.alerts);
// router.get(
//   '/',
//   BookingController.createBookingCheckout,
//   authController.isLoggedIn,
//   viewsController.getOverview
// );
// router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
// router.get('/login', viewsController.getLoginForm);
// router.get('/me', authController.protect, viewsController.getAccount);
// router.get(
//   '/my-tours',
//   // BookingController.createBookingCheckout,
//   authController.protect,
//   viewsController.getMyTours
// );
// router.get('/my-reviews', authController.protect, viewsController.getMyReviews);
// router.get('/signup', viewsController.getSignupForm);
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );

// module.exports = router;
const express = require('express');

const router = express.Router();

const { isLoggedIn, protect } = require('./../controllers/authController');

const {
  getOverview,
  getTour,
  getLoginForm,
  getSignupForm,
  getAccount,
  updateUserData,
  getMyTours,
  alerts
} = require('./../controllers/viewsController');

// const {createBookingCheckout} = require('./../controllers/bookingController')
// router.use(isLoggedIn);

router.use(alerts);

// router.get('/',createBookingCheckout, isLoggedIn,getOverview);
router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/auth/login', isLoggedIn, getLoginForm);
router.get('/auth/signup', isLoggedIn, getSignupForm);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);
// router.get('/my-tours', protect, getMyTours);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
