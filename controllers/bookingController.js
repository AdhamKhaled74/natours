// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const Tour = require('./../models/tourModel');
// // eslint-disable-next-line import/extensions
// const Booking = require('./../models/bookingModel.js');
// // eslint-disable-next-line import/no-unresolved, import/extensions, node/no-missing-require
// const catchAsync = require('./../utils/catchAsync.js');
// // eslint-disable-next-line import/extensions, no-unused-vars
// const AppError = require('./../utils/appError.js');
// // eslint-disable-next-line import/extensions, no-unused-vars
// const factory = require('./handlerFactory.js');

// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//   //1) Get the currently booked tour
//   const tour = await Tour.findById(req.params.tourId);
//   //2) Create checkout session
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     success_url: `${req.protocol}://${req.get('host')}/?tour=${
//       req.params.tourId
//     }&user=${req.user.id}&price=${tour.price}`,
//     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//     customer_email: req.user.email,
//     client_reference_id: req.params.tourId,
//     mode: 'payment',
//     line_items: [
//       {
//         quantity: 1,
//         price_data: {
//           currency: 'usd',
//           unit_amount: tour.price * 100,
//           product_data: {
//             name: `${tour.name} Tour`,
//             description: tour.summary,
//             images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
//           }
//         }
//       }
//     ]
//   });
//   //3) Create session as response
//   res.status(200).json({
//     status: 'success',
//     session
//   });
// });
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]);
//   // res.redirect(`${req.protocol}://${req.get('host')}/`);
// });
// exports.createBooking = factory.createOne(Booking);
// exports.getBooking = factory.getOne(Booking);
// exports.updateBooking = factory.updateOne(Booking);
// exports.deleteBooking = factory.deleteOne(Booking);
// exports.getAllBookings = factory.getAll(Booking);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create checkout session  [npm i stripe]
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`
            ]
          }
        }
      }
    ]
  });

  // 3) Create session as response
  // if (!req.user.isConfirmed) {
  //   //  return res.status(403).json({
  //   //    status: 'error',
  //   //    message: 'Please confirm your account before booking.',
  //   //  });
  //   return next(
  //     new AppError(
  //       'Please confirm your account before booking! check your profile.',
  //       400
  //     )
  //   );
  // }
  res.status(200).json({
    status: 'success',
    session
  });
});

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
