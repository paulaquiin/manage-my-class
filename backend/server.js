const express = require("express");
const db = require("./database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserController = require("./controller/userController");
const ClassController = require("./controller/classController");
const StudentController = require("./controller/studentController");
const GradeController = require("./controller/gradeController");
const ActivityController = require("./controller/activityController");

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
    if (!token) {
        return res.status(401).json({ message: "No autorizado" });
    } 

    jwt.verify(token, JWT_SECRET_KEY, (error, user) => {
        if (error) {
            return res.status(401).json({ message: "Token inválido" });
        } 
        req.user = user;
        next();
    });
}
app.use(authJwtToken);

/**
 * ENDPOINTS
*/

// Endpoint para registrar
app.post("/api/register/", UserController.register);
// Endpoint para iniciar sesión
app.post("/api/login/", UserController.login)
// Endpoint para obtener la información del usuario
app.get("/api/user/", UserController.getUser);
app.put("/api/user/", UserController.update);

// Endpoint para clases
app.post("/api/class/", ClassController.create);
app.get("/api/class/", ClassController.getAll)
app.delete("/api/class/", ClassController.delete)
app.get("/api/top-approved-class/", ClassController.getTopApprovedClass)
app.get("/api/top-failure-class/", ClassController.getTopFailureClass)

// Endpoint para alumnos
app.post("/api/student/", StudentController.create);
app.get("/api/student/", StudentController.getAll);
app.delete("/api/student/", StudentController.delete);
app.get("/api/student-by-class-name/", StudentController.getAllByClassName)
app.get("/api/student-count/", StudentController.getTotalByUser)

// Endpoints para las notas
app.get("/api/grade/", GradeController.getAll)
app.get("/api/grades/averages", GradeController.getAverages);
app.post("/api/grade/", GradeController.create);
app.get("/api/grade-overall-approval-rate/", GradeController.getOverallApprovalRate);
app.get("/api/grade-overall-failure-rate/", GradeController.getOverallFailureRate);

// Endpoints para las actividades
app.post("/api/activity/", ActivityController.create);
app.put("/api/activity/", ActivityController.update);
app.get("/api/activity/", ActivityController.getAll);

app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));