const sqlite3 = require("sqlite3").verbose();

// Creamos (o abrimos) la base de datos
const db = new sqlite3.Database("./backend/data.db", (err) => {
    if (err) console.error("Error al abrir la base de datos:", err);
    else console.log("Base de datos conectada.");
});

db.run("PRAGMA foreign_keys = ON");

db.run(
    `CREATE TABLE IF NOT EXISTS users 
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        dni TEXT NOT NULL
    )
    `
);
db.run(
    `CREATE TABLE IF NOT EXISTS classes 
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        icon INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
        UNIQUE (name, user_id)
    )
    `
);

db.run(
    `CREATE TABLE IF NOT EXISTS students 
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        surname TEXT NOT NULL,
        photo TEXT NOT NULL,
        class_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
        FOREIGN KEY (class_id) REFERENCES classes(id)
    )
    `
);


db.run(
    `CREATE TABLE IF NOT EXISTS grades 
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        score REAL NOT NULL,
        
        activity_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        
        FOREIGN KEY (activity_id) REFERENCES activities(id)
        FOREIGN KEY (student_id) REFERENCES students(id)
        FOREIGN KEY (user_id) REFERENCES users(id)
        FOREIGN KEY (class_id) REFERENCES classes(id)
    )
    `
);

db.run(
    `CREATE TABLE IF NOT EXISTS activities
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        student_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        
        FOREIGN KEY (student_id) REFERENCES students(id)
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    `
)

module.exports = db;