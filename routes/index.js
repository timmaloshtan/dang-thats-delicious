const express = require('express');
const storeController = require('../controllers/storeController');

const router = express.Router();

// Do work here
router.get('/', storeController.homePage);

module.exports = router;
