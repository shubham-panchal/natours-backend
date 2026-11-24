const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');

// ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

// Enable CORS for routes and origins
app.use(
  cors({
    origin: ['http://localhost:5173', process.env.CLIENT_URL],
    credentials: true,
  }),
);

// GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // min * sec * ms => 1 hour
  message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS(Cross Site Scripting)
app.use(xss());

// Prevent parameter pollution eg: ?sort=duration&sort=price
app.use(
  hpp({
    // whitelist: allow duplicate params eg: ?duration=9&duration=5
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression()); // compresses texts sent to client

// // Serving static files
// app.use(express.static(`${__dirname}/public`));

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  //.all() runs for all HTTP methods

  ////// handling error by sending it to error middleware //////
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // Whenever we pass a param in next() express assumes it's an error and goes straight to the error middleware

  ////// normal way of handling error //////
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
});

// By specifying 4 parameters (starting with err), express knows that it is an Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
