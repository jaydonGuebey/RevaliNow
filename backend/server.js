// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importeer alle route-bestanden
const patientRoutes = require('./routes/patientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const oefeningRoutes = require('./routes/oefeningRoutes');
const pijnRoutes = require('./routes/pijnRoutes');
const logboekRoutes = require('./routes/logboekRoutes');
const afspraakRoutes = require('./routes/afspraakRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Gebruik alle routes
app.use('/api', patientRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', oefeningRoutes);
app.use('/api', pijnRoutes);
app.use('/api', logboekRoutes);
app.use('/api', afspraakRoutes);

// Start de server
app.listen(port, () => {
  console.log(`Backend server draait op http://localhost:${port}`);
});