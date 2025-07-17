const express = require('express');
const router = express.Router();
const controller = require('../controllers/backup.controller');

router.get('/db-backup', controller.runDbBackup);

module.exports = router;
