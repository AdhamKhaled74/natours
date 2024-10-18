// const express = require('express');
// const bookingController = require('./../controllers/bookingController');
// const authController = require('./../controllers/authController');

// const router = express.Router();
// router.use(authController.protect);
// router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// router.use(authController.restrictTo('admin', 'lead-guide'));

// router
//   .route('/')
//   .get(bookingController.getAllBookings)
//   .post(bookingController.createBooking);

// router
//   .route('/:id')
//   .get(bookingController.getBooking)
//   .patch(bookingController.updateBooking)
//   .delete(bookingController.deleteBooking);
// module.exports = router;
const express = require('express');

const router = express.Router();

const {
  getCheckoutSession,
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking
} = require('./../controllers/bookingController');

const { protect, restrictTo } = require('./../controllers/authController');

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(getAllBookings)
  .post(createBooking);

router
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = router;
