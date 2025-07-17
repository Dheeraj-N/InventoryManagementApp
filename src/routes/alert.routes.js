const express = require('express');
const router = express.Router();
const controller = require('../controllers/alert.controller');

router.get('/', controller.getAlerts);
router.get('/low-stock', controller.getLowStock);
router.get('/out-of-stock', controller.getOutOfStock);

module.exports = router;
