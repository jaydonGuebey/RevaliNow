// backend/routes/logboekRoutes.js
const express = require('express');
const router = express.Router();

// Importeer de zojuist gemaakte controller
const logboekController = require('../controllers/logboekController');

// Koppel de URL's aan de controller functies

// GET /api/patienten/:id/logboek (AC 4)
router.get('/patienten/:id/logboek', logboekController.getLogboek);

// POST /api/logboek (AC 1, 2, 3)
router.post('/logboek', logboekController.createLogboekEntry);

// PUT /api/logboek/:id (AC 5)
router.put('/logboek/:id', logboekController.updateLogboekEntry);

// DELETE /api/logboek/:id (AC 5)
router.delete('/logboek/:id', logboekController.deleteLogboekEntry);

module.exports = router;