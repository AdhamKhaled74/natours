// const AppError = require('../utils/appError');
// eslint-disable-next-line no-unused-vars
const catchAsync = require('../utils/catchAsync');

const Review = require('./../models/reviewModel');
// eslint-disable-next-line import/extensions
const factory = require('./handlerFactory.js');

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review, { path: 'user tour' });
// this has a relation with createReview endpoint
exports.setUserTourIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // it will be get from the req
  if (!req.body.user) req.body.user = req.user.id; // it will be get from the protect middleware
  next();
};
exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);
// exports.deleteReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndDelete(req.params.id);
//   if (!review) {
//     return next(
//       new AppError(`No review found with this ${req.params.id}`, 404)
//     );
//   }
//   res.status(204).json({
//     status: 'Success',
//     data: {
//       review: null
//     }
//   });
// });

exports.updateReview = factory.updateOne(Review);
