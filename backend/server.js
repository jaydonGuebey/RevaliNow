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

// === BEGIN AANPASSING VOOR USER STORY 1 ===

// Functie om de dashboard data voor een specifieke patiënt op te halen
app.get('/api/patienten/:id/dashboard', async (req, res) => {
    const patientId = req.params.id;
    
    // Check of patientId een geldig getal is
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }

    try {
        // 1. Haal patiëntinformatie op (AC 1: Naam)
        const [patientInfoRows] = await dbPool.query('SELECT Voornaam, Achternaam FROM Patienten WHERE PatientID = ?', [patientId]);
        
        if (patientInfoRows.length === 0) {
            return res.status(404).json({ error: 'Patiënt niet gevonden' });
        }
        const patientInfo = patientInfoRows[0];

        // 2. Haal de rest van de data parallel op voor snelheid
        const [pijnRows, oefenRows, afspraakRows] = await Promise.all([
            
            // Query voor AC 2: Recente pijnindicaties (max 3)
            dbPool.query(`
                SELECT PijnScore, DatumTijdRegistratie 
                FROM Pijnindicaties 
                WHERE PatientID = ? 
                ORDER BY DatumTijdRegistratie DESC 
                LIMIT 3
            `, [patientId]),
            
            // Query voor AC 3: Oefeningen voor vandaag
            dbPool.query(`
                SELECT O.Naam, OP.Herhalingen, OP.Sets 
                FROM Oefenplannen AS OP
                JOIN Oefeningen AS O ON OP.OefeningID = O.OefeningID 
                WHERE OP.PatientID = ? 
                  AND OP.StartDatum <= CURDATE() 
                  AND (OP.EindDatum >= CURDATE() OR OP.EindDatum IS NULL)
            `, [patientId]),

            // Query voor AC 4: Eerstvolgende afspraak
            dbPool.query(`
                SELECT TypeAfspraak, DatumTijdAfspraak 
                FROM Afspraken 
                WHERE PatientID = ? 
                  AND DatumTijdAfspraak >= NOW() 
                ORDER BY DatumTijdAfspraak ASC 
                LIMIT 1
            `, [patientId])
        ]);

        // 3. Stuur alle data terug in één JSON-object
        res.json({
            voornaam: patientInfo.Voornaam,
            achternaam: patientInfo.Achternaam,
            recentePijnindicaties: pijnRows[0], // [0] omdat dbPool.query [rows, fields] teruggeeft
            oefeningenVandaag: oefenRows[0],
            volgendeAfspraak: afspraakRows[0].length > 0 ? afspraakRows[0][0] : null // Pak het eerste object, of null
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