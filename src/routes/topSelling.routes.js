const express = require('express');
const router = express.Router();
const controller = require('../controllers/topSelling.controller');

// GET /api/top-selling/films
router.get('/films', controller.topSellingFilms);

// GET /api/top-selling/materials
router.get('/materials', controller.topUsedRawMaterials);

module.exports = router;
