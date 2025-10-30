// backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// GET /api/patienten
router.get('/patienten', patientController.getAllPatienten);

module.exports = router;