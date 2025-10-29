// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Laadt variabelen uit .env

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'RevaliNowDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connectie (optioneel)
pool.getConnection()
  .then(connection => {
    console.log('✅ Verbonden met de MySQL database!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Fout bij verbinden met de database:', err);
  });


// Exporteer de pool voor gebruik in andere modules
module.exports = pool;