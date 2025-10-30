// backend/controllers/afspraakController.js
const dbPool = require('../db');

// (AC 1, 2, 3) Haal alle afspraken op voor een patiënt
const getAfspraken = async (req, res) => {
    const patientId = req.params.id;
    if (isNaN(patientId)) {
        return res.status(400).json({ error: 'Ongeldig Patient ID' });
    }

    try {
        // (AC 2) We JOINen met de Gebruikers tabel om de naam van de arts op te halen.
        const [rows] = await dbPool.query(`
            SELECT 
                A.AfspraakID,
                A.DatumTijdAfspraak,
                A.TypeAfspraak,
                A.Status,
                G.Voornaam,
                G.Achternaam
            FROM Afspraken AS A
            JOIN Gebruikers AS G ON A.RevalidatieartsID = G.GebruikerID
            WHERE A.PatientID = ?
            ORDER BY A.DatumTijdAfspraak DESC
        `, [patientId]);
        
        res.json(rows); // Stuur alle afspraken (verleden en toekomst)
    } catch (err) {
        console.error(`Fout bij GET /api/patienten/${patientId}/afspraken:`, err);
        res.status(500).json({ error: 'Interne serverfout' });
    }
};

module.exports = {
    getAfspraken
};