// backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();

// Importeer de controller met alle logica
const patientController = require('../controllers/patientController');

// Definieer alle routes die we in de controller hebben gemaakt
// De '/api' prefix wordt toegevoegd in server.js

// Routes voor /api/patienten
router.get('/patienten', patientController.getAllPatienten);
router.get('/patienten/:id/dashboard', patientController.getDashboard);
router.get('/patienten/:id/oefenplannen', patientController.getOefenplannen);
router.get('/patienten/:id/pijnindicaties', patientController.getPijnindicaties);

// Routes voor /api/pijnindicaties
router.post('/pijnindicaties', patientController.postPijnindicatie);

// Routes voor /api/uitgevoerde-oefeningen
router.post('/uitgevoerde-oefeningen', patientController.postUitgevoerdeOefening);
router.delete('/uitgevoerde-oefeningen', patientController.deleteUitgevoerdeOefening);

// Exporteer de router
module.exports = router;