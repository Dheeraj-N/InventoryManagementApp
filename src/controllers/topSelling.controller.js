const topSellingModel = require('../models/topSelling.model');

exports.topSellingFilms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const range = req.query.range || null; // last_week, last_month, etc.

    const data = await topSellingModel.getTopSellingFilms();
    res.json(data);
  } catch (error) {
    console.error('Error fetching top selling films:', error);
    next(error);
  }
};

exports.topUsedRawMaterials = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const range = req.query.range || null;

    const data = await topSellingModel.getTopUsedRawMaterials();
    res.json(data );
  } catch (error) {
    console.error('Error fetching top used raw materials:', error);
    next(error);
  }
};
