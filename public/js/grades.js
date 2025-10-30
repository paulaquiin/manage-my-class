import { initDialog } from "./dialog.js";
import { handleFetch } from "./handle-fetch.js";
import { iconList } from "./utils/icons.js";

// Id del usuario logeado
const userId = localStorage.getItem("user_id");

// Sección de filtros - Se renderizan las clases
const filters = document.querySelector(".filter");
// Sección de contenido - Se renderiza la tabla de actividades/examenes/trimestre
const content = document.querySelector(".content");
// Tabla donde se muestran las actividades/examenes
const table = document.getElementById("grades-table");
// Referencia del encabezado de la tabla
const thead = table.querySelector(".row.thead");
// Botón para guardar las notas cuando se ha editado la tabla
const saveStudentGradesEl = document.getElementById("save-student-grades");

// Referencia del form donde se añaden nuevas actividades/examenes
const form = document.querySelector("form");

// Almacena la clase seleccionada
let className = null;
// Almacena el tipo de tabla a mostrar (actividades, examenes, trimestre)
let type = null;
// Almacena los estudiantes de la clase seleccionada
let students = null;

// Iniciamos dialog
initDialog();
// Iniciamos el resto de funcionalidad de notas
init();

async function init() {
    // La función principal a lanzar dependerá si la url contiene el parámetro "clase" y el parámetro "type".
    // Si lo contiene, significa que debo mostrar las notas de esa clase
    // Si no es así, entonces debo renderizar la lista de clases para que el profesor elija una
    const params = new URLSearchParams(document.location.search);
    if (params.get("clase") && params.get("type")) {
        className = params.get("clase");
        type = params.get("type");
        hideClasses();
        fillNavigation();
        await fetchStudents();
        await fetchActivities();
        handleTableEvents();
    } else {
        handleClasses();
    }
}

/**
 * NOTAS
 */

// Función para ocultar las clases
function hideClasses() {
    filters.classList.add("hide");
}

// Función para agregarle a cada item de navegación su respectivo href (Depende de la clase seleccionada)
function fillNavigation() {
    const activitiesLink = document.getElementById("grades-activities");
    activitiesLink.href = `/notas/?clase=${className}&type=activity`;
    const examsLink = document.getElementById("grades-exams");
    examsLink.href = `/notas/?clase=${className}&type=exam`;
    const quartersLink = document.getElementById("grades-quarters");
    quartersLink.href = `/notas/?clase=${className}&type=quarter`;
}

// Obtiene todos los estudiantes y los renderiza en la tabla
async function fetchStudents() {
    const studentsResult = await handleFetch(
        `http://localhost:3000/api/student-by-class-name?userId=${userId}&&className=${className}`,
        "GET",
    )
    // Ahora se crea una fila por cada estudiantes
    students = studentsResult.rows;
    renderStudents();
}

// Obtiene todas las actividades y las renderiza en la tabla
async function fetchActivities() {
    const activitiesResult = await handleFetch(
        `http://localhost:3000/api/activity?userId=${userId}&type=${type}`,
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

        table.appendChild(tr);
    })
}

// Función que renderiza cada nota en forma de columnas en la tabla
function renderActivities(activities) {
    activities.forEach((activity) => {
        const th = document.createElement("div");
        th.textContent = activity.name;
        thead.insertBefore(th, thead.lastElementChild);
        const tbody = table.querySelectorAll(".row:not(.thead)");
        tbody.forEach(tr => {
            const newTd = document.createElement("div");
            newTd.dataset.studentId = tr.firstElementChild.dataset.studentId
            newTd.dataset.activityId = activity.id
            newTd.contentEditable = true
            newTd.textContent = activity.score || "-";
            tr.insertBefore(newTd, tr.lastElementChild);
        });
    })
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

    const studentsElements = table.querySelectorAll("div[data-student-id]:first-child");
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

        const boxEl = clone.querySelector(".box");
        boxEl.addEventListener("click", () => {
            window.location.href = `/notas?clase=${item.name}&type=activity`
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
        const result = await handleFetch(
            "http://localhost:3000/api/activity",
            "POST",
            JSON.stringify({
                name,
                type,
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