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
let students = null; // Esta variable almacena todos los estudiantes de la clase escogida


init();

function init() {

    // Iniciamos dialog
    initDialog();

    // La función principal a lanzar dependerá si la url contiene el parámetro "clase".
    // Si lo contiene, significa que debo mostrar las notas de esa clase
    // Si no es así, entonces debo renderizar la lista de clases para que el profesor elija una
    let params = new URLSearchParams(document.location.search);
    if (params.get("clase")) {
        handleGrades(params.get("clase"));
    } else {
        handleClasses();
    }
}

/**
 * NOTAS
 */

// Función que maneja las notas, según la clase escogida
async function handleGrades(className) {
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
                newCell.textContent = student.name;
            }
            tr.appendChild(newCell);
        }

        activitiesTable.appendChild(tr);
    })
}

// Función que renderiza cada nota en forma de columnas en la tabla
function renderActivities(activities) {
    activities.forEach((grade) => {
        const th = document.createElement("div");
        th.textContent = grade.name;
        thead.insertBefore(th, thead.lastElementChild);
        const tbody = activitiesTable.querySelectorAll(".row:not(.thead)");
        tbody.forEach(tr => {
            const newTd = document.createElement("div");
            newTd.contentEditable = true
            newTd.textContent = "-"; // valor inicial
            tr.insertBefore(newTd, tr.lastElementChild); // antes de la columna de media
        });
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