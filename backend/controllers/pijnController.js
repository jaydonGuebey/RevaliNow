// backend/controllers/pijnController.js
const dbPool = require('../db');

// Haal alle pijnindicaties op
const getPijnindicaties = async (req, res) => {
    const patientId = req.params.id;
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }
    
    try {
        const [rows] = await dbPool.query(`
            SELECT PijnIndicatieID, PijnScore, Toelichting, DatumTijdRegistratie
            FROM Pijnindicaties
            WHERE PatientID = ?
            ORDER BY DatumTijdRegistratie ASC
        `, [patientId]);
        res.json(rows);
    } catch (err) {
        console.error(`Fout bij /api/patienten/${patientId}/pijnindicaties:`, err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
};

// Sla een nieuwe pijnindicatie op
const postPijnindicatie = async (req, res) => {
    const { patientId, pijnScore, toelichting } = req.body;

    if (isNaN(patientId) || isNaN(pijnScore)) {
        return res.status(400).json({ error: 'PatientID en PijnScore moeten nummers zijn' });
    }
    
    const score = parseInt(pijnScore, 10);
    if (score < 0 || score > 10) {
        return res.status(400).json({ error: 'Pijnscore moet tussen 0 en 10 liggen' });
    }

    try {
        // Stap 1: Bepaal de nieuwe ID
        const [idRows] = await dbPool.query(
            'SELECT COALESCE(MAX(PijnIndicatieID), 0) + 1 AS newId FROM Pijnindicaties'
        );
        const newPijnIndicatieID = idRows[0].newId;

        // Stap 2: Voer de INSERT uit
        await dbPool.query(`
            INSERT INTO Pijnindicaties
                (PijnIndicatieID, PatientID, DatumTijdRegistratie, PijnScore, Toelichting)
            VALUES
                (?, ?, NOW(), ?, ?)
        `, [newPijnIndicatieID, patientId, score, toelichting || null]);

        // Stap 3: Stuur het object terug MET DE JUISTE ID
        res.status(201).json({
            PijnIndicatieID: newPijnIndicatieID,
            PatientID: patientId,
            DatumTijdRegistratie: new Date().toISOString(),
            PijnScore: score,
            Toelichting: toelichting || null
        });

    } catch (err) {
        console.error(`Fout bij POST /api/pijnindicaties:`, err);
        if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
             return res.status(400).json({ error: 'Database validatie mislukt: Pijnscore moet tussen 0 en 10 liggen.' });
        }
        res.status(500).json({ error: 'Interne serverfout bij opslaan pijnindicatie' });
    }
};

module.exports = {
    getPijnindicaties,
    postPijnindicatie
};