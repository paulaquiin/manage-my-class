const express = require("express");
const db = require("./database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET_KEY = "1c975aca040f714db40ba0f0fdbf8aad"; // Firma generada en https://jwtsecrets.com/
const JWT_EXPIRATION = "12h";

/**
 * MIDDLEWARES
*/
app.use(express.json({ limit: "10mb" })); // Permite utilizar estructuras JSON en cada petición y además le indico un tamaño mayor de contenido JSON de hasta 10MB (necesario para las fotos de estudiantes)
app.use(express.static("public")); // Sirve los archivos de la carpeta public
// Permite comprobar si la petición recibida es de un usuario autenticado
// Este middleware se ejecutará en todas las peticiones donde sea necesario la autenticación
function authJwtToken(req, res, next) {
    const exclude = ["/api/register", "/api/login"];
    if (exclude.includes(req.path)) return next();

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No autorizado" });

    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) return res.status(401).json({ message: "Token inválido" });
        req.user = user;
        next();
    });
}
app.use(authJwtToken);

/**
 * ENDPOINTS
*/

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
                return res.status(400).json({ success: false, errorId: "user-exists-error", message: "Usuario ya existe" });
            } else {
                // Usuario registrado y redirecciona a la pantalla de inicio de sesión
                return res.status(201).json({ success: true });
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

// Endpoint para usuarios
app.get("/api/user/", (req, res) => {
    const userId = req.query.userId;
    db.get(
        "SELECT user, dni FROM users WHERE id = ?",
        [userId],
        async function (error, user) {
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true, info: user });
            }

        }
    )
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
        `
            SELECT c.*, 
            COUNT(s.id) AS students_qty
            FROM classes c
            LEFT JOIN students s ON s.class_id = c.id
            WHERE c.user_id = ?
            GROUP BY c.id
        `,
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
    const { id, userId } = req.body;
    db.run(
        "DELETE FROM classes WHERE id = ? AND user_id = ?",
        [id, userId],
        function (error) {
            if (error) {
                return res.status(400).json({ success: false, error });
            } else {
                return res.status(200).json({ success: true });
            }
        }
    )
})


// Endpoint para alumnos
app.post("/api/student/", (req, res) => {
    const { name, surname, photo, classId, userId } = req.body;
    db.run(
        "INSERT INTO students (name, surname, photo, class_id, user_id) VALUES (?, ?, ?, ?, ?)",
        [name, surname, photo, classId, userId],
        function (error) {
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true });
            }
        }
    )
})

app.get("/api/student/", (req, res) => {
    const userId = req.query.userId;
    db.all(
        `
            SELECT s.name AS student_name,
            s.id,
            s.surname,
            s.photo,
            s.class_id,
            s.user_id,
            c.id AS class_id,
            c.name AS class_name,
            c.grade,
            c.icon
            FROM students s LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.user_id = ?
        `,
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

app.get("/api/student-by-class-name/", (req, res) => {
    const userId = req.query.userId;
    const className = req.query.className;
    // console.log(userId);
    // console.log(className);
    db.all(
        `
            SELECT 
            s.id,
            s.name,
            s.surname
            FROM students s
            JOIN classes c ON s.class_id = c.id
            WHERE s.user_id = ? AND c.name = ?;
        `,
        [userId, className],
        function (error, rows) {
            // console.log(error);
            // console.log(rows);
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true, rows });

            }

        }
    );
})

app.delete("/api/student/", (req, res) => {
    const { id, userId } = req.body;
    db.run(
        "DELETE FROM students WHERE id = ? AND user_id = ?",
        [id, userId],
        function (error) {
            console.log(error);
            if (error) {
                return res.status(400).json({ success: false, error });
            } else {
                return res.status(200).json({ success: true });
            }
        }
    )
})


// Endpoints para las notas
app.get("/api/grade/", (req, res) => {
    const className = req.query.className;
    const userId = req.query.userId;
    db.all(
        `
            SELECT g.*
            FROM grades g
            JOIN classes c ON g.class_id = c.id
            WHERE c.name = ? AND g.user_id = ?;
        `,
        [className, userId],
        function (error, rows) {
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true, rows });

            }
        }
    );
})
app.post("/api/grade/", (req, res) => {
    const { activityScore, activityId, studentId, userId, className } = req.body;
    db.run(
        `
            INSERT INTO grades 
            (score, activity_id, student_id, class_id, user_id) 
            VALUES (
            ?,
            ?,
            ?,
            (SELECT id FROM classes WHERE name = ? AND user_id = ?),
            ?
            )
            ON CONFLICT(activity_id, student_id, class_id, user_id)
            DO UPDATE SET score = excluded.score
        `,
        [activityScore, activityId, studentId, className, userId, userId],
        function (error) {
            console.log(error);
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true });

            }

        }
    );
})


// Endpoints para las actividades
app.post("/api/activity/", (req, res) => {
    const { name, type, userId, className } = req.body;
    db.run(
        `
            INSERT INTO activities 
            (type, name, user_id, class_id) 
            VALUES (
                ?,
                ?,
                ?,
                (SELECT id FROM classes WHERE name = ? AND user_id = ?)
            )
        `,
        [type, name, userId, className, userId],
        function (error) {
            console.log(error);
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true, activityId: this.lastID });

            }

        }
    );
})

app.get("/api/activity/", (req, res) => {
    const userId = req.query.userId;
    const type = req.query.type;
    const className = req.query.className;
    console.log(className);
    db.all(
        `
            SELECT a.id, a.name, a.type, a.class_id, g.score
            FROM activities a 
            LEFT JOIN grades g ON g.activity_id = a.id
            WHERE a.user_id = ? AND a.type = ? AND a.class_id = (SELECT id FROM classes WHERE name = ? AND user_id = ?)
            GROUP BY a.id
        `,
        [userId, type, className, userId],
        function (error, rows) {
            console.log(rows);
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(201).json({ success: true, rows });

            }
        }
    );
})

app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));