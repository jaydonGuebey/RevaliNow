// backend/controllers/oefeningController.js
const dbPool = require('../db');

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
            UitgevoerdeOefeningID: newId
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

module.exports = {
    getOefenplannen,
    postUitgevoerdeOefening,
    deleteUitgevoerdeOefening
};