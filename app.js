/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
// eslint-disable-next-line import/extensions
const cookieParser = require('cookie-parser');
const cors = require('cors');
// eslint-disable-next-line import/extensions
const AppError = require('./utils/appError.js');
// eslint-disable-next-line import/extensions
const globalErrorHandler = require('./controllers/errorController.js');

// eslint-disable-next-line import/extensions
const bookingController = require('./controllers/bookingController.js');

const tourRouter = require(`./routes/tourRoutes.js`);
const userRouter = require(`./routes/userRoutes.js`);
const reviewRouter = require(`./routes/reviewRoutes.js`);
const viewRouter = require(`./routes/viewRoutes.js`);
const bookingRouter = require(`./routes/bookingRoutes.js`);
// eslint-disable-next-line import/extensions

const app = express();

// app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Serving static files
// app.use(express.static(`${__dirname}/public`)); the same with line 66
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com'
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network'
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://localhost:*/'
        ],
        upgradeInsecureRequests: []
      }
    }
  })
);

// Development Logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware function to limit num of requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);
app.use(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
app.use(compression());
// Body parser , Reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// Parse Cookie header and populate req.cookies
app.use(cookieParser());
// parsing form data
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb'
  })
);
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'price',
      'maxGroupSize'
    ]
  })
);

// Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});
module.exports = app;
