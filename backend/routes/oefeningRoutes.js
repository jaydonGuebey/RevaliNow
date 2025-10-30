// backend/routes/oefeningRoutes.js
const express = require('express');
const router = express.Router();
const oefeningController = require('../controllers/oefeningController');

// GET /api/patienten/:id/oefenplannen
router.get('/patienten/:id/oefenplannen', oefeningController.getOefenplannen);

// POST /api/uitgevoerde-oefeningen
router.post('/uitgevoerde-oefeningen', oefeningController.postUitgevoerdeOefening);

// DELETE /api/uitgevoerde-oefeningen
router.delete('/uitgevoerde-oefeningen', oefeningController.deleteUitgevoerdeOefening);

module.exports = router;