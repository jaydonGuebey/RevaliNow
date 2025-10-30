// backend/hash.js
const bcrypt = require('bcryptjs');

// VERANDER DIT IN HET WACHTWOORD DAT JE WILT:
const wachtwoord = 'password123'; 

const saltRounds = 10;

bcrypt.hash(wachtwoord, saltRounds, function(err, hash) {
  if (err) {
    console.error(err);
  } else {
    console.log('--- KOPIEER DEZE HASH ---');
    console.log(hash);
    console.log('---------------------------');
  }
});