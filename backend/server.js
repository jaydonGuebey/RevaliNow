// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importeer je nieuwe route-bestand
const patientRoutes = require('./routes/patientRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Gebruik de routes
// Alle requests naar /api/... worden nu afgehandeld door patientRoutes
app.use('/api', patientRoutes);

// Start de server
app.listen(port, () => {
  console.log(`🚀 Backend server draait op http://localhost:${port}`);
});