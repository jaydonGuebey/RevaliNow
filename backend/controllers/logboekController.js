// backend/controllers/logboekController.js
const dbPool = require('../db');

// (AC 4) Haal alle logboek items op voor een patiënt
const getLogboek = async (req, res) => {
    const patientId = req.params.id;
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }

    try {
        const [rows] = await dbPool.query(`
            SELECT LogboekID, DatumTijdActiviteit, Beschrijving
            FROM Activiteiten_logboek
            WHERE PatientID = ?
            ORDER BY DatumTijdActiviteit DESC
        `, [patientId]);
        res.json(rows); 
    } catch (err) {
        console.error(`Fout bij GET /api/patienten/${patientId}/logboek:`, err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
};

// (AC 1, 2, 3) Maak een nieuw logboek item aan
const createLogboekEntry = async (req, res) => {
    const { patientId, beschrijving } = req.body;

    if (!patientId || !beschrijving) {
        return res.status(400).json({ error: 'PatientID en Beschrijving zijn verplicht' });
    }

    try {
        // Stap 1: Bepaal de nieuwe ID
        const [idRows] = await dbPool.query(
            'SELECT COALESCE(MAX(LogboekID), 0) + 1 AS newId FROM Activiteiten_logboek'
        );
        const newLogboekId = idRows[0].newId;

        // Stap 2: Voer de INSERT uit met de vastgestelde nieuwe ID
        await dbPool.query(`
            INSERT INTO Activiteiten_logboek
                (LogboekID, PatientID, DatumTijdActiviteit, Beschrijving)
            VALUES
                (?, ?, NOW(), ?)
        `, [newLogboekId, patientId, beschrijving]);

        // Stap 3: Stuur het nieuwe object terug MET DE JUISTE ID
        res.status(201).json({
            LogboekID: newLogboekId, // Dit is nu correct
            PatientID: patientId,
            DatumTijdActiviteit: new Date().toISOString(),
            Beschrijving: beschrijving
        });
    } catch (err) {
        console.error('Fout bij POST /api/logboek:', err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
};

// (AC 5) Bewerk een bestaand logboek item
const updateLogboekEntry = async (req, res) => {
    const logboekId = req.params.id;
    const { beschrijving } = req.body;

    if (isNaN(logboekId) || !beschrijving) {
        return res.status(400).json({ error: 'LogboekID en Beschrijving zijn verplicht' });
    }

    try {
        const [result] = await dbPool.query(`
            UPDATE Activiteiten_logboek
            SET Beschrijving = ?
            WHERE LogboekID = ?
        `, [beschrijving, logboekId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Logboek item niet gevonden' });
        }
        res.json({ LogboekID: logboekId, Beschrijving: beschrijving });
    } catch (err) {
        console.error(`Fout bij PUT /api/logboek/${logboekId}:`, err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
};

// (AC 5) Verwijder een logboek item
const deleteLogboekEntry = async (req, res) => {
    const logboekId = req.params.id;
    if (isNaN(logboekId)) {
        return res.status(400).json({ error: 'Ongeldig Logboek ID' });
    }

    try {
        const [result] = await dbPool.query(`
            DELETE FROM Activiteiten_logboek WHERE LogboekID = ?
        `, [logboekId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Logboek item niet gevonden' });
        }
        res.status(200).json({ message: 'Logboek item succesvol verwijderd' });
    } catch (err) {
        console.error(`Fout bij DELETE /api/logboek/${logboekId}:`, err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
};

module.exports = {
    getLogboek,
    createLogboekEntry,
    updateLogboekEntry,
    deleteLogboekEntry
};