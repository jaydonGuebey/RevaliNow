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

// Functie om de dashboard data voor een specifieke patiënt op te halen
app.get('/api/patienten/:id/dashboard', async (req, res) => {
    const patientId = req.params.id;
    
    // Check of patientId een geldig getal is
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }

    try {
        // 1. Haal patiëntinformatie op
        const [patientInfoRows] = await dbPool.query('SELECT Voornaam, Achternaam FROM Patienten WHERE PatientID = ?', [patientId]);
        
        if (patientInfoRows.length === 0) {
            return res.status(404).json({ error: 'Patiënt niet gevonden' });
        }
        const patientInfo = patientInfoRows[0];

        // 2. Haal de rest van de data parallel op voor snelheid
        const [pijnRows, oefenRows, afspraakRows] = await Promise.all([
            
            // Query voor Recente pijnindicaties (max 3)
            dbPool.query(`
                SELECT PijnScore, DatumTijdRegistratie 
                FROM Pijnindicaties 
                WHERE PatientID = ? 
                ORDER BY DatumTijdRegistratie DESC 
                LIMIT 3
            `, [patientId]),
            
            // Query voor Actieve oefeningen
            dbPool.query(`
                SELECT O.Naam, OP.Herhalingen, OP.Sets 
                FROM Oefenplannen AS OP
                JOIN Oefeningen AS O ON OP.OefeningID = O.OefeningID 
                WHERE OP.PatientID = ? 
                  AND OP.StartDatum <= CURDATE() 
                  AND (OP.EindDatum >= CURDATE() OR OP.EindDatum IS NULL)
            `, [patientId]),

            // Query voor Eerstvolgende afspraak
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

// Haal alle oefenplannen voor een specifieke patiënt op
app.get('/api/patienten/:id/oefenplannen', async (req, res) => {
    const patientId = req.params.id;

    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }

    try {
        const [rows] = await dbPool.query(`
            SELECT
                OP.PatientOefenplanID,
                OP.Herhalingen,
                OP.Sets,
                OP.StartDatum,
                O.Naam,
                O.Beschrijving,
                O.InstructieVideoURL,
                (EXISTS (
                    SELECT 1
                    FROM Uitgevoerde_oefeningen UO
                    WHERE UO.PatientOefenplanID = OP.PatientOefenplanID
                      AND DATE(UO.DatumTijdAfgevinkt) = CURDATE()
                )) AS IsVandaagAfgerond
            FROM
                Oefenplannen AS OP
            JOIN
                Oefeningen AS O ON OP.OefeningID = O.OefeningID
            WHERE
                OP.PatientID = ?
            ORDER BY
                O.Naam ASC; -- Sorteer op naam (A-Z)
        `, [patientId]);

        res.json(rows);

    } catch (err) {
        console.error(`Fout bij /api/patienten/${patientId}/oefenplannen:`, err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
});

// Markeer een oefenplan als afgerond voor vandaag
app.post('/api/uitgevoerde-oefeningen', async (req, res) => {
    const { patientOefenplanId } = req.body;

    if (!patientOefenplanId) {
        return res.status(400).json({ error: 'PatientOefenplanID ontbreekt' });
    }

    try {
        // 1. Check eerst of deze al is afgevinkt vandaag (voorkom duplicates)
        const [checkRows] = await dbPool.query(`
            SELECT 1 
            FROM Uitgevoerde_oefeningen 
            WHERE PatientOefenplanID = ? 
              AND DATE(DatumTijdAfgevinkt) = CURDATE()
        `, [patientOefenplanId]);

        if (checkRows.length > 0) {
            return res.status(409).json({ message: 'Deze oefening is vandaag al afgerond' });
        }
        
        // 2. Voeg de nieuwe record toe.
        const [result] = await dbPool.query(`
            INSERT INTO Uitgevoerde_oefeningen 
                (UitgevoerdeOefeningID, PatientOefenplanID, DatumTijdAfgevinkt, IsAfgevinkt)
            VALUES 
                ((SELECT COALESCE(MAX(t.UitgevoerdeOefeningID), 0) + 1 FROM Uitgevoerde_oefeningen t), ?, NOW(), 1)
        `, [patientOefenplanId]);

        // 3. Stuur een success-respons terug
        res.status(201).json({
            message: 'Oefening afgerond',
            patientOefenplanId: patientOefenplanId
        });

    } catch (err) {
        console.error(`Fout bij POST /api/uitgevoerde-oefeningen:`, err);
        res.status(500).json({ error: 'Interne serverfout bij afvinken' });
    }
});

// === BEGIN AANPASSING VOOR 'ONGEDAAN' KNOP ===

// Maak een 'afvinken' ongedaan (verwijder de record voor vandaag)
app.delete('/api/uitgevoerde-oefeningen', async (req, res) => {
    const { patientOefenplanId } = req.body;

    if (!patientOefenplanId) {
        return res.status(400).json({ error: 'PatientOefenplanID ontbreekt' });
    }

    try {
        // Verwijder de record(s) voor dit plan die VANDAAG zijn afgevinkt
        const [result] = await dbPool.query(`
            DELETE FROM Uitgevoerde_oefeningen
            WHERE PatientOefenplanID = ? 
              AND DATE(DatumTijdAfgevinkt) = CURDATE()
        `, [patientOefenplanId]);

        if (result.affectedRows === 0) {
            // Dit is geen harde fout, maar wel goed om te weten
            return res.status(404).json({ message: 'Geen afgeronde oefening gevonden om ongedaan te maken' });
        }

        // Stuur een success-respons terug
        res.status(200).json({ message: 'Afvinken ongedaan gemaakt' });

    } catch (err) {
        console.error(`Fout bij DELETE /api/uitgevoerde-oefeningen:`, err);
        res.status(500).json({ error: 'Interne serverfout bij ongedaan maken' });
    }
});

// === EINDE AANPASSING VOOR 'ONGEDAAN' KNOP ===


// Start de server
app.listen(port, () => {
  console.log(`🚀 Backend server draait op http://localhost:${port}`);
});