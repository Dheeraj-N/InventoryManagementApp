const express = require('express');
const router = express.Router();
const controller = require('../controllers/jobcard.controller');

router.get('/', controller.getAllJobCards); // /api/job-cards?sort=asc|desc
router.get('/movements', controller.getSortedJobCardMovements); // optional
router.get('/:number', controller.getMovementsByJobCard); // /api/job-cards/JC-123/movements
router.get('/filter', controller.filterJobCards);

module.exports = router;
