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

// Haal dashboard data op
const getDashboard = async (req, res) => {
    const patientId = req.params.id;
    
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }

    try {
        const [patientInfoRows] = await dbPool.query('SELECT Voornaam, Achternaam FROM Patienten WHERE PatientID = ?', [patientId]);
        
        if (patientInfoRows.length === 0) {
            return res.status(404).json({ error: 'Patiënt niet gevonden' });
        }
        const patientInfo = patientInfoRows[0];

        const [pijnRows, oefenRows, afspraakRows] = await Promise.all([
            dbPool.query(`
                SELECT PijnScore, DatumTijdRegistratie 
                FROM Pijnindicaties 
                WHERE PatientID = ? 
                ORDER BY DatumTijdRegistratie DESC 
                LIMIT 3
            `, [patientId]),
            dbPool.query(`
                SELECT O.Naam, OP.Herhalingen, OP.Sets 
                FROM Oefenplannen AS OP
                JOIN Oefeningen AS O ON OP.OefeningID = O.OefeningID 
                WHERE OP.PatientID = ? 
                  AND OP.StartDatum <= CURDATE() 
                  AND (OP.EindDatum >= CURDATE() OR OP.EindDatum IS NULL)
            `, [patientId]),
            dbPool.query(`
                SELECT TypeAfspraak, DatumTijdAfspraak 
                FROM Afspraken 
                WHERE PatientID = ? 
                  AND DatumTijdAfspraak >= NOW() 
                ORDER BY DatumTijdAfspraak ASC 
                LIMIT 1
            `, [patientId])
        ]);

        res.json({
            voornaam: patientInfo.Voornaam,
            achternaam: patientInfo.Achternaam,
            recentePijnindicaties: pijnRows[0], 
            oefeningenVandaag: oefenRows[0],
            volgendeAfspraak: afspraakRows[0].length > 0 ? afspraakRows[0][0] : null
        });

    } catch (err) {
         console.error(`Fout bij /api/patienten/${patientId}/dashboard:`, err);
         res.status(500).json({ error: 'Interne serverfout' });
    }
};

// Haal alle oefenplannen voor een patiënt op
const getOefenplannen = async (req, res) => {
    const patientId = req.params.id;

    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }

    try {
        const [rows] = await dbPool.query(`
            SELECT
                OP.PatientOefenplanID, OP.Herhalingen, OP.Sets, OP.StartDatum,
                O.Naam, O.Beschrijving, O.InstructieVideoURL,
                (EXISTS (
                    SELECT 1
                    FROM Uitgevoerde_oefeningen UO
                    WHERE UO.PatientOefenplanID = OP.PatientOefenplanID
                      AND DATE(UO.DatumTijdAfgevinkt) = CURDATE()
                )) AS IsVandaagAfgerond
            FROM Oefenplannen AS OP
            JOIN Oefeningen AS O ON OP.OefeningID = O.OefeningID
            WHERE OP.PatientID = ?
            ORDER BY O.Naam ASC;
        `, [patientId]);
        res.json(rows);
    } catch (err) {
        console.error(`Fout bij /api/patienten/${patientId}/oefenplannen:`, err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
};

// Markeer een oefening als afgerond
const postUitgevoerdeOefening = async (req, res) => {
    const { patientOefenplanId } = req.body;
    if (!patientOefenplanId) {
        return res.status(400).json({ error: 'PatientOefenplanID ontbreekt' });
    }
    try {
        // Voorkom duplicaten op dezelfde dag
        const [checkRows] = await dbPool.query(`
            SELECT 1 FROM Uitgevoerde_oefeningen 
            WHERE PatientOefenplanID = ? AND DATE(DatumTijdAfgevinkt) = CURDATE()
        `, [patientOefenplanId]);

        if (checkRows.length > 0) {
            return res.status(409).json({ message: 'Deze oefening is vandaag al afgerond' });
        }
        
        // Stap 1: Bepaal de nieuwe ID
        const [idRows] = await dbPool.query(
            'SELECT COALESCE(MAX(UitgevoerdeOefeningID), 0) + 1 AS newId FROM Uitgevoerde_oefeningen'
        );
        const newId = idRows[0].newId;

        // Stap 2: Voeg de 'afvink' record toe met de nieuwe ID
        await dbPool.query(`
            INSERT INTO Uitgevoerde_oefeningen 
                (UitgevoerdeOefeningID, PatientOefenplanID, DatumTijdAfgevinkt, IsAfgevinkt)
            VALUES 
                (?, ?, NOW(), 1)
        `, [newId, patientOefenplanId]);

        res.status(201).json({ 
            message: 'Oefening afgerond',
            UitgevoerdeOefeningID: newId // Stuur correcte data terug
        });
    } catch (err) {
        console.error(`Fout bij POST /api/uitgevoerde-oefeningen:`, err);
        res.status(500).json({ error: 'Interne serverfout bij afvinken' });
    }
};

// Maak afvinken ongedaan
const deleteUitgevoerdeOefening = async (req, res) => {
    const { patientOefenplanId } = req.body;
    if (!patientOefenplanId) {
        return res.status(400).json({ error: 'PatientOefenplanID ontbreekt' });
    }
    try {
        const [result] = await dbPool.query(`
            DELETE FROM Uitgevoerde_oefeningen
            WHERE PatientOefenplanID = ? AND DATE(DatumTijdAfgevinkt) = CURDATE()
        `, [patientOefenplanId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Geen afgeronde oefening gevonden om ongedaan te maken' });
        }
        res.status(200).json({ message: 'Afvinken ongedaan gemaakt' });
    } catch (err) {
        console.error(`Fout bij DELETE /api/uitgevoerde-oefeningen:`, err);
        res.status(500).json({ error: 'Interne serverfout bij ongedaan maken' });
    }
};

// Haal alle pijnindicaties op
const getPijnindicaties = async (req, res) => {
    const patientId = req.params.id;
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }
    
    try {
        const [rows] = await dbPool.query(`
            SELECT PijnScore, Toelichting, DatumTijdRegistratie
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
            PijnIndicatieID: newPijnIndicatieID, // Dit is nu correct
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

// Exporteer alle functies zodat de router ze kan gebruiken
module.exports = {
    getAllPatienten,
    getDashboard,
    getOefenplannen,
    postUitgevoerdeOefening,
    deleteUitgevoerdeOefening,
    getPijnindicaties,
    postPijnindicatie
};