// backend/controllers/patientController.js
const dbPool = require('../db');

// Haal alle patiënten op
const getAllPatienten = async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT PatientID, Voornaam, Achternaam FROM Patienten');
    res.json(rows);
  } catch (err) {
    console.error('Fout bij /api/patienten:', err);
    res.status(500).json({ error: 'Interne serverfout' });
  }
};

module.exports = {
    getAllPatienten
};