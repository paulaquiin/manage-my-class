const sqlite3 = require("sqlite3").verbose();

// Crear (o abrir) la base de datos
const db = new sqlite3.Database("./backend/data.db", (err) => {
    if (err) console.error("Error al abrir la base de datos:", err);
    else console.log("Base de datos conectada.");
});

// Crear una tabla si no existe
db.run(
    `CREATE TABLE IF NOT EXISTS usuarios 
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        dni TEXT NOT NULL
    )
    `
);

module.exports = db;