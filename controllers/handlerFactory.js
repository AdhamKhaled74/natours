// eslint-disable-next-line import/extensions
const catchAsync = require('./../utils/catchAsync.js');

// eslint-disable-next-line import/extensions
const AppError = require('./../utils/appError.js');
// eslint-disable-next-line import/extensions
const APIFeature = require('./../utils/apiFeatures.js');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`No document found with this ${req.params.id}`, 404)
      );
    }
    res.status(204).json({
      status: 'Success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(
        new AppError(`No document found with this ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'Success',
      data: {
        date: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        data: newDoc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`No document found with this ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested Get reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;
    // Send Response
    res.status(200).json({
      status: 'success',
      result: docs.length,
      data: {
        date: docs
      }
    });
  });
