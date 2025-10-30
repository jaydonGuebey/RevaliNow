// backend/routes/pijnRoutes.js
const express = require('express');
const router = express.Router();
const pijnController = require('../controllers/pijnController');

// GET /api/patienten/:id/pijnindicaties
router.get('/patienten/:id/pijnindicaties', pijnController.getPijnindicaties);

// POST /api/pijnindicaties
router.post('/pijnindicaties', pijnController.postPijnindicatie);

module.exports = router;