// backend/controllers/dashboardController.js
const dbPool = require('../db');

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

        // Haal dashboard data parallel op
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

module.exports = {
    getDashboard
};