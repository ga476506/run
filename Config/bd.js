const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '230904',  
  database: 'garzaRun'
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL con ID: ' + db.threadId);
});

module.exports = db;
