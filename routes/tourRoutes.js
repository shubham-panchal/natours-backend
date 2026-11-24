const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter); // by adding mergeParams:true in reviewRouter we can have access to tourId in reviewRouter

// PARAM MIDDLEWARE
// router.param(paramName, (req, res, next, valueOfParam) => {})
// router.param('id', checkID);
router.get('/', getAllTours);
router.get('/:id', getTour);
router.get('/top-5-tours', aliasTopTours, getAllTours);
router.get('/stats', getTourStats);

router.get(
  '/monthly-plan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  getMonthlyPlan,
);

router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWithin);
router.get('/distances/:latlng/unit/:unit', getDistances);

router.post(
  '/',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  createTour,
);

router.patch(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  uploadTourImages,
  resizeTourImages,
  updateTour,
);

router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  deleteTour,
);

module.exports = router;
