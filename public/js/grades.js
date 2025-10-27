import { initDialog } from "./dialog.js";
import { handleFetch } from "./handle-fetch.js";
import { iconList } from "./utils/icons.js";

// Variables globales
const userId = localStorage.getItem("user_id");
const content = document.querySelector(".content");
const filters = document.querySelector(".filter");
const activitiesTable = document.getElementById("activities-table");
const thead = activitiesTable.querySelector(".row.thead");
const form = document.querySelector("form");
const saveStudentGradesEl = document.getElementById("save-student-grades");
let students = null; // Esta variable almacena todos los estudiantes de la clase escogida
let className = null;

init();

async function init() {

    // Iniciamos dialog
    initDialog();

    // La función principal a lanzar dependerá si la url contiene el parámetro "clase".
    // Si lo contiene, significa que debo mostrar las notas de esa clase
    // Si no es así, entonces debo renderizar la lista de clases para que el profesor elija una
    let params = new URLSearchParams(document.location.search);
    if (params.get("clase")) {
        className = params.get("clase");
        await handleGrades();
        handleTableEvents();
    } else {
        handleClasses();
    }
}

/**
 * NOTAS
 */

// Función que maneja las notas, según la clase escogida
async function handleGrades() {
    // Primero ocultamos los filtros.
    filters.classList.add("hide");

    // Luego, listar las notas según el nombre de la clase que he recibido
    // Lo primero hay que recuperar todos los estudiantes de la clase seleccionada
    const studentsResult = await handleFetch(
        `http://localhost:3000/api/student-by-class-name?userId=${userId}&&className=${className}`,
        "GET",
    )
    students = studentsResult.rows;
    renderStudents();

    // Después, se recuperan las actividades, 
    const activitiesResult = await handleFetch(
        `http://localhost:3000/api/activity?userId=${userId}`,
        "GET",
    )

    // Ahora se crea una columna por cada actividad
    const activities = activitiesResult.rows;
    renderActivities(activities);
}


// Función que renderiza cada estudiante en forma de fila en la tabla
function renderStudents() {
    students.forEach((student) => {
        const tr = document.createElement("div");
        tr.classList.add("row");

        const loopCount = thead.querySelectorAll("div").length;

        for (let i = 0; i < loopCount; i++) {
            const newCell = document.createElement("div");
            if (i === 0) {
                newCell.dataset.studentId = student.id;
                newCell.textContent = student.name;
            }
            tr.appendChild(newCell);
        }

        activitiesTable.appendChild(tr);
    })
}

// Función que renderiza cada nota en forma de columnas en la tabla
function renderActivities(activities) {
    activities.forEach((activity) => {
        const th = document.createElement("div");
        th.textContent = activity.name;
        thead.insertBefore(th, thead.lastElementChild);
        const tbody = activitiesTable.querySelectorAll(".row:not(.thead)");
        tbody.forEach(tr => {
            const newTd = document.createElement("div");
            newTd.dataset.studentId = tr.firstElementChild.dataset.studentId
            newTd.dataset.activityId = activity.id
            newTd.contentEditable = true
            newTd.textContent = activity.score || "-";
            tr.insertBefore(newTd, tr.lastElementChild);
        });
    })

    console.log("ok");
}

// Función que detecta cambios en las celdas para habilitar el botón de guardar notas
function handleTableEvents() {
    // No permitir escribir algo diferente a una nota en cada celda
    const cells = document.querySelectorAll('div[contenteditable="true"]')
    cells.forEach((cell) => {
        cell.addEventListener("keydown", (e) => {
            const key = e.key;
            if (
                key !== "0" &&
                key !== "1" &&
                key !== "2" &&
                key !== "3" &&
                key !== "4" &&
                key !== "5" &&
                key !== "6" &&
                key !== "7" &&
                key !== "8" &&
                key !== "9" &&
                key !== "." &&
                key !== "," &&
                key !== "Backspace"
            ) {
                e.preventDefault();
            } else {
                saveStudentGradesEl.classList.add("show");
            }
        })
    })

    // Añadir el evento correspondiente al botón de guardar notas
    saveStudentGradesEl.addEventListener("click", saveGrades);
}

async function saveGrades() {
    // Recorrer cada estudiante y guardar su nota siempre y cuando su nota sea diferente a "-".

    const studentsElements = activitiesTable.querySelectorAll("div[data-student-id]:first-child");
    studentsElements.forEach((studentEl) => {
        const studentId = studentEl.dataset.studentId;

        const studentActivitiesElements = studentEl.parentElement.querySelectorAll("div[data-activity-id]");
        studentActivitiesElements.forEach(async (activityEl) => {
            const activityId = activityEl.dataset.activityId;
            const activityScore = activityEl.textContent;
            // Por cada actividad de cada estudiante, se lanza petición
            const result = await handleFetch(
                `http://localhost:3000/api/grade`,
                "POST",
                JSON.stringify({ activityScore, activityId, studentId, userId, className })
            )
            console.log(result);

        })

    })
}


/**
 * FILTRADO POR CLASE
 */

// Encargado de obtener las clases y renderizarlas en pantalla
async function handleClasses() {

    // 1. Ocultar notas.
    content.classList.add("hide");
    // 2. Listar las clases
    const result = await handleFetch(
        `http://localhost:3000/api/class?userId=${userId}`,
        "GET",
    )
    if (!result.success) {
        const errorEl = document.getElementById(result.errorId);
        if (errorEl) {
            errorEl.classList.add("show");
        }
    } else {
        renderClasses(result.rows);
    }

}

// Encargado de renderizar cada caja de cada clase en filtros
function renderClasses(classes) {
    const template = document.getElementById("box-template");
    const fragment = document.createDocumentFragment();

    classes.forEach((item) => {
        const clone = template.content.cloneNode(true);
        console.log(item);
        const boxEl = clone.querySelector(".box");
        boxEl.addEventListener("click", () => {
            window.location.href = `/notas?clase=${item.name}`
        })
        const classEl = clone.querySelector("#class");
        const iconEl = clone.querySelector("img");
        const titleEl = clone.querySelector("#title");

        classEl.textContent = item.grade;
        iconEl.src = iconList[item.icon];
        titleEl.textContent = item.name;

        fragment.appendChild(clone);
    })

    filters.appendChild(fragment);
}




/**
 * DIALOG
 */

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Obtener nombre de la actividad
    const { name } = Object.fromEntries(formData.entries());

    // Por cada estudiante, debo añadir una nueva actividad
    students.forEach(async (student) => {
        console.log(student.id);
        const result = await handleFetch(
            "http://localhost:3000/api/activity",
            "POST",
            JSON.stringify({
                name,
                studentId: student.id,
                userId,
            })
        )

        if (!result.success) {
            const errorEl = document.getElementById(result.errorId);
            if (errorEl) {
                errorEl.classList.add("show");
            }
        } else {
            console.log(result);
        }

    })

})