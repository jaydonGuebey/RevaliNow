// backend/routes/afspraakRoutes.js
const express = require('express');
const router = express.Router();

// Importeer de zojuist gemaakte controller
const afspraakController = require('../controllers/afspraakController');

// Koppel de URL aan de controller functie
// GET /api/patienten/:id/afspraken (AC 1, 2, 3)
router.get('/patienten/:id/afspraken', afspraakController.getAfspraken);

module.exports = router;