const model = require('../models/alert.model');

exports.getAlerts = async (req, res, next) => {
  try {
    const data = await model.getStockAlerts();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getLowStock = async (req, res, next) => {
  try {
    const items = await model.getLowStock();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.getOutOfStock = async (req, res, next) => {
  try {
    const items = await model.getOutOfStock();
    res.json(items);
  } catch (err) {
    next(err);
  }
};