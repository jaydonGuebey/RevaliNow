// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importeer de route-bestanden
const patientRoutes = require('./routes/patientRoutes');
const logboekRoutes = require('./routes/logboekRoutes'); // Nieuwe import

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Gebruik de routes
app.use('/api', patientRoutes);
app.use('/api', logboekRoutes); // Vertel de app de logboek routes te gebruiken

// Start de server
app.listen(port, () => {
  console.log(`🚀 Backend server draait op http://localhost:${port}`);
});