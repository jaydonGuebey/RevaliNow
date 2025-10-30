// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/patienten/:id/dashboard
router.get('/patienten/:id/dashboard', dashboardController.getDashboard);

module.exports = router;