// backend/server.js
const express = require('express');
const cors = require('cors'); // Importeer CORS
const dbPool = require('./db'); // Importeer de database pool
require('dotenv').config(); // Laadt variabelen uit .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Sta requests toe van andere origins (zoals je frontend)
app.use(express.json()); // Zodat je JSON requests kunt ontvangen

// === API Routes ===

// Voorbeeld: Haal alle patiënten op
app.get('/api/patienten', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT PatientID, Voornaam, Achternaam FROM Patienten');
    res.json(rows);
  } catch (err) {
    console.error('Fout bij /api/patienten:', err);
    res.status(500).json({ error: 'Interne serverfout' });
  }
});

// TODO: Voeg hier meer API routes toe (bv. voor het dashboard, oefeningen, etc.)
// Voorbeeld dashboard route (vereenvoudigd)
app.get('/api/patienten/:id/dashboard', async (req, res) => {
    const patientId = req.params.id;
    // Check of patientId een geldig getal is
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }
    try {
        const [patientInfo] = await dbPool.query('SELECT Voornaam, Achternaam FROM Patienten WHERE PatientID = ?', [patientId]);
        if (patientInfo.length === 0) {
            return res.status(404).json({ error: 'Patiënt niet gevonden' });
        }
         // Haal hier de andere data op (pijn, oefeningen, afspraak)
         // ... (queries zoals in vorige reactie) ...

        res.json({
            voornaam: patientInfo[0].Voornaam,
            achternaam: patientInfo[0].Achternaam,
            // recentePijnindicaties: ...,
            // oefeningenVandaag: ...,
            // volgendeAfspraak: ...
        });
    } catch (err) {
         console.error(`Fout bij /api/patienten/${patientId}/dashboard:`, err);
         res.status(500).json({ error: 'Interne serverfout' });
    }
});


// Start de server
app.listen(port, () => {
  console.log(`🚀 Backend server draait op http://localhost:${port}`);
});