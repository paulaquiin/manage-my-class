const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const JWT_SECRET_KEY = "1c975aca040f714db40ba0f0fdbf8aad"; // Firma generada en https://jwtsecrets.com/
const JWT_EXPIRATION = "12h";

// MIDDLEWARES
app.use(express.static("public")); //Muestra los archivos de la carpeta public
app.use(bodyParser.json()); // Permite utilizar estructuras JSON en cada petición
function authJwtToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No autorizado" });

// Comprueba si la petición la hace un usuario autenticado y se ejecuta en todas las peticiones que sean necesarias
    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = user;
        next();
    });
}

// ENDPOINTS

// Endpoint para registrar profesores
app.post("/api/register/", async (req, res) => {

    const { user, password, dni } = req.body;

    // Librería para encriptar la contraseña
    const hashedPwd = await bcrypt.hash(password, 10);
    db.run(
        "INSERT INTO users (user, password, dni) VALUES (?, ?, ?)",
        [user, hashedPwd, dni],
        function (error) {
            if (error) {
                return res.status(400).json({ errorId: "user-exists-error", message: "Usuario ya existe" });
            } else {
                // Usuario registrado y redirecciona a la pantalla de inicio de sesión
                return res.status(201).json({ redirect: "/iniciar-sesion" });
            }
        }
    );
})

// Endpoint para iniciar sesión
app.post("/api/login/", async (req, res) => {
    const { user, password } = req.body;
    db.get(
        "SELECT * FROM users WHERE user = ?",
        [user],
        async function (error, user) {
            if (!user) {
                return res.status(400).json({ errorId: "user-error", message: "El usuario no existe" });
            } else {
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(400).json({ errorId: "password-error", message: "Contraseña incorrecta" });
                } else {
                    const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION });
                    return res.status(200).json({ token, user_id: user.id });
                }
            }

        }
    );
})

// Endpoint para clases
app.post("/api/class/", (req, res) => {
    const { name, course, icon, userId } = req.body;
    db.run(
        "INSERT INTO classes (name, grade, icon, user_id) VALUES (?, ?, ?, ?)",
        [name, course, icon, userId],
        function (error) {
            if (error) {
                if (error.code === "SQLITE_CONSTRAINT") {
                    return res.status(400).json({ success: false, errorId: "class-exists" });
                } else {
                    return res.status(400).json({ success: false });
                }
            } else {
                return res.status(201).json({ success: true });
            }
        }
    )
})

app.get("/api/class/", (req, res) => {
    const userId = req.query.userId;
    db.all(
        "SELECT * FROM classes WHERE user_id = ?",
        [userId],
        function (error, rows) {
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true, rows });
            }

        }
    );
})

app.delete("/api/class/", (req, res) => {
    const { id } = req.body;
    db.run(
        "DELETE FROM classes WHERE id = ?",
        [id],
        function (error) {
            if (error) {
                return res.status(400).json({ success: false, error });
            } else {
                return res.status(200).json({ success: true });
            }
        }
    )
})

app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
