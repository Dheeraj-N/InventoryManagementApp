const model = require('../models/jobcard.model');

// Get all job card numbers
exports.getAllJobCards = async (req, res, next) => {
  try {
    const sort = req.query.sort || 'asc';
    const jobCards = await model.getAllJobCards(sort);
    res.json(jobCards);
  } catch (err) {
    next(err);
  }
};

// Get movements for a specific job card
exports.getMovementsByJobCard = async (req, res, next) => {
  try {
    const jobCardNumber = req.params.number;
    const movements = await model.getMovementsByJobCard(jobCardNumber);
    if (movements.length === 0)
      return res.status(404).json({ message: 'No movements found for this job card' });
    res.json(movements);
  } catch (err) {
    next(err);
  }
};

// Get all movements sorted by job card number
exports.getSortedJobCardMovements = async (req, res, next) => {
  try {
    const sort = req.query.sort || 'asc';
    const movements = await model.getSortedJobCardsWithMovements(sort);
    res.json(movements);
  } catch (err) {
    next(err);
  }
};

exports.filterJobCards = async (req, res, next) => {
  try {
    const result = await jobcardModel.filterJobCards(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};