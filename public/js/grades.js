import { closeDialog, dialog, initDialog, setOnCloseDialog } from "./dialog.js";
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
// Tabla donde se muestran los resultados de los trimestres
const quartersTable = document.getElementById("quarters-table");
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
// Almacena la actividad seleccionada que se va a editar (Si corresponde)
let editActivityId = null;

// Elementos del dialog de añadir actividad/examen
const dialogTitle = document.getElementById("dialog-title");
const dialogBtn = document.querySelector("form input[type='submit']");
const openDialog = document.querySelector(".header button");

// Iniciamos dialog
initDialog();
// Incluimos un evento a ejecutar cuando se cierre el dialog
setOnCloseDialog(onCloseDialog);
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
        if (type !== "quarter") {
            hideClasses();
            fillNavigation();
            updateDialogUI();
            await fetchStudents();
            await fetchActivities();
            await fillScores();
            calculateAvg();
            handleTableEvents();
        } else {
            hideClasses();
            fillNavigation();
            updateDialogUI();
            handleQuartersTable();
        }
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
    const activitiesLink = document.getElementById("link-activity");
    activitiesLink.href = `/notas/?clase=${className}&type=activity`;
    const examsLink = document.getElementById("link-exam");
    examsLink.href = `/notas/?clase=${className}&type=exam`;
    const quartersLink = document.getElementById("link-quarter");
    quartersLink.href = `/notas/?clase=${className}&type=quarter`;

    const currentLink = document.getElementById(`link-${type}`);
    currentLink.classList.add("active");
}

function updateDialogUI() {

    // Cambiar título del botón de la pantalla y del dialog (input y titulo) según si estamos en examenes o actividades
    switch (type) {
        case "activity":
            dialogTitle.textContent = editActivityId ? "Editar actividad" : "Nueva actividad";
            openDialog.textContent = "Añadir Actividad";
            dialogBtn.value = editActivityId ? "Editar actividad" : "Crear actividad";
            break;
        case "exam":
            dialogTitle.textContent = editActivityId ? "Editar Examen" : "Nuevo Examen";
            openDialog.textContent = "Añadir Examen";
            dialogBtn.value = editActivityId ? "Editar examen" : "Crear examen";
            break;
    }
    console.log(type);
    // Ocultar el botón de añadir actividad/examen si estoy viendo las notas trimestrales
    if (type == "quarter") {
        openDialog.classList.add("hide");
    } else {
        openDialog.classList.remove("hide");
    }
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
        `http://localhost:3000/api/activity?userId=${userId}&type=${type}&className=${className}`,
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
        tr.dataset.studentId = student.id;

        const loopCount = thead.querySelectorAll("div").length;

        for (let i = 0; i < loopCount; i++) {
            const newCell = document.createElement("div");
            if (i === 0) {
                newCell.dataset.studentId = student.id;
                newCell.textContent = student.name;
            }
            tr.appendChild(newCell);
        }

        const tableEl = type !== "quarter" ? table : quartersTable;
        tableEl.appendChild(tr);
    })
}

// Función que renderiza cada nota en forma de columnas en la tabla
function renderActivities(activities) {
    activities.forEach((activity) => {
        console.log(activity);
        const th = document.createElement("div");
        th.dataset.id = activity.id;
        // Nombre de la actividad
        const activityName = document.createElement("span");
        activityName.classList.add("text");
        activityName.textContent = activity.name;
        // Nombre del trimestre de la actividad
        const quarterInfo = document.createElement("span");
        quarterInfo.classList.add("muted");
        switch (activity.quarter) {
            case "first": quarterInfo.textContent = "(Primer trimestre)"; break;
            case "second": quarterInfo.textContent = "(Segundo trimestre)"; break;
            case "third": quarterInfo.textContent = "(Tercer trimestre)"; break;
        }
        // Añadir nombre y trimestre a la celda.
        th.appendChild(activityName);
        th.appendChild(quarterInfo);
        // Insertar en la tabla
        thead.insertBefore(th, thead.lastElementChild);

        const tbody = table.querySelectorAll(".row:not(.thead)");
        tbody.forEach(tr => {
            const newTd = document.createElement("div");
            newTd.dataset.activityId = activity.id;
            newTd.contentEditable = true
            newTd.textContent = "-";
            tr.insertBefore(newTd, tr.lastElementChild);
        });
    })
}

// Función encargada de rellenar cada celda con la puntuación que le corresponde
// Gracias a que las anteriores funciones han rellenado las filas y celdas con un dataset para identificar la actividad y el estudiante
// tan solo debo buscar la nota con la activityId y studentId renderizado en el dom y cambiar su textContent.
async function fillScores() {
    // Primero obtengo todas las notas
    const result = await handleFetch(
        `http://localhost:3000/api/grade?className=${className}&userId=${userId}`,
        "GET",
    );
    const grades = result.rows;
    // Por cada nota, busco el elemento del DOM con el dataset correspondiente y cambio su textContent
    grades.forEach((grade) => {
        const cell = document.querySelector(`.row[data-student-id='${grade.student_id}'] > [data-activity-id='${grade.activity_id}']`);
        if (cell) {
            cell.textContent = grade.score || "-";
        }
    })
}

// Función que calcula la nota media de cada estudiante según sus actividades
function calculateAvg() {
    // Primero obtengo todas las filas (menos la cabecera)
    const rows = table.querySelectorAll(".row:not(.thead)");
    let avgScore = 0;
    rows.forEach((row) => {
        // Por cada fila, obtengo todas las celdas menos la primera (es el nombre del alumno) y la última (es la nota media).
        const cells = row.querySelectorAll("div:not(:first-child):not(:last-child)");
        // Por cada celda, le sumo su textContent (parseado a numero y comprobando que si es un guión lo trate como un cero).
        cells.forEach((cell) => {
            avgScore += cell.textContent === "-" ? 0 : parseInt(cell.textContent);
        })
        // Obtengo la ultima celda de la fila actual (corresponde a la nota) y le doy la suma de todas las celdas dividido por la longitud
        // de cells que son todas las celdas menos el nombre y la nota final (es decir, todas las notas de las actividades). 
        const lastCell = row.querySelector("div:last-child");
        lastCell.textContent = cells.length > 0 ? Math.round((avgScore / cells.length) * 10) / 10 : 0;
        // Le doy unos estilos a la nota para pintarlo de rojo si la nota es menor de 5
        if (parseInt(lastCell.textContent) < 5) {
            lastCell.classList.add("fail")
        }
        // Reinicio avgScore a cero para que calcule la siguiente fila.
        avgScore = 0;
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

    // Añadir el evento correspondiente a las cabeceras para poder editar el nombre de las actividades
    const headers = thead.querySelectorAll("div:not(:first-child):not(:last-child)");
    headers.forEach((header) => {
        header.addEventListener("click", () => {
            // Asignar activityId para actualizarlo en el backend
            editActivityId = header.dataset.id;
            // Añadir nombre de la actividad en el input
            const activityTitle = dialog.querySelector("#name");
            const activityName = header.querySelector("span:first-child");
            activityTitle.value = activityName.textContent;
            // Actualizar los textos del dialog
            updateDialogUI();
            // Abrir dialog
            dialog.showModal();
        })
    })
}

// Función encargada de renderizar las columnas del primer, segundo y tercer trimestre.
async function handleQuartersTable() {
    // Ocultar tabla original
    table.classList.add("hide");
    // Mostrar tabla trimestral
    quartersTable.classList.remove("hide");
    // Crear los estudiantes en la tabla
    await fetchStudents();
    // Por cada estudiante creado en la tabla, voy a añadir a cada estudiante 3 celdas, una para cada trimestre.
    const rows = quartersTable.querySelectorAll(".row:not(.thead)");
    rows.forEach((tr) => {
        for (let i = 0; i < 3; i++) {
            const newTd = document.createElement("div");
            newTd.textContent = "-";
            tr.insertBefore(newTd, tr.lastElementChild);
        }
    })
    // Obtengo la puntuación de cada estudiante y cada trimestre y lo renderizo
    fetchQuartersScore(rows);
}

// Función encargada de calcular la puntuación total de cada trimestre para cada alumno
async function fetchQuartersScore() {
    // Se hace una petición por clase, trayendose todos los alumnos, con todas sus actividades, tipo de actividad y la nota de esa actividad.
    const result = await handleFetch(
        `http://localhost:3000/api/grades/averages?className=${className}&userId=${userId}`,
        "GET",
    );
    const grades = result.rows;
    // Por cada resultado, se busca el student_id, se identifica el quarter y se le aplica el score devuelto.
    grades.forEach((grade) => {
        const studentRow = document.querySelector(`.row[data-student-id="${grade.student_id}"]`);
        // Dependiendo del trimestre que se esté evaluando, se imprime en la primera, segunda o tercera columna, identificados por
        // el selector :nth-child() teniendo en cuenta que (1) es el nombre del alumno, y a partir de ahí los tres trimestres.
        switch (grade.quarter) {
            case "first": studentRow.querySelector("div:nth-child(2)").textContent = grade.score; break;
            case "second": studentRow.querySelector("div:nth-child(3)").textContent = grade.score; break;
            case "third": studentRow.querySelector("div:nth-child(4)").textContent = grade.score; break;
        }
    })
    // Ahora por cada fila, sumo las tres notas y lo añado en la ultima columna (nota media)
    const rows = quartersTable.querySelectorAll(".row:not(.thead)");
    let avgScore = 0;
    rows.forEach((row) => {
        const columns = row.querySelectorAll("div:not([data-student-id]):not(:last-child)");
        columns.forEach((col) => {
            avgScore += col.textContent !== "-" ? parseFloat(col.textContent) : 0;
        })
        row.querySelector("div:last-child").textContent = Math.round((avgScore / columns.length) * 10) / 10;
    })
}


// Al cerrar el dialog reseteo el editActivityId por si luego le da a añadir actividad que no lo considere un edit
// Al cerrar el dialog, actualizo su interfaz al estado inicial 
function onCloseDialog() {
    editActivityId = null;
    updateDialogUI();
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

            if (result.success) {
                document.location.reload();
                closeDialog();
            }
        })

    })
}


/**
 * FILTRADO POR CLASE
 */

// Encargado de obtener las clases y renderizarlas en pantalla
async function handleClasses() {

    // Ocultar notas.
    content.classList.add("hide");
    // Ocultar botón de añadir actividad/examen.
    const openDialog = document.querySelector(".header button");
    openDialog.classList.add("hide");
    // Listar las clases
    const result = await handleFetch(
        `http://localhost:3000/api/class?userId=${userId}`,
        "GET",
    )
    if (result.success) {
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
    // Obtener trimestre
    const quarterActivitySelect = document.getElementById("activity-quarter");
    const quarterActivity = quarterActivitySelect.value;

    // Añado una nueva actividad o edito una existente
    const result = await handleFetch(
        "http://localhost:3000/api/activity",
        editActivityId ? "PUT" : "POST",
        editActivityId ? JSON.stringify({ name, quarterActivity, activityId: editActivityId }) : JSON.stringify({ name, type, userId, className, quarterActivity })
    );

    if (result.success && !editActivityId) {
        // Si todo ha ido bien, recorreré todos los alumnos de esta clase y les añadiré una nota inicial (0) a cada uno
        // de ellos para esta actividad
        students.forEach(async (student) => {
            const result2 = await handleFetch(
                "http://localhost:3000/api/grade",
                "POST",
                JSON.stringify({
                    activityId: result.activityId,
                    studentId: student.id,
                    userId,
                    className,
                    activityScore: 0,
                })
            );

            if (result2.success) {
                window.location.reload()
                closeDialog();
            }
        })
    } else if (result.success && editActivityId) {
        window.location.reload();
        closeDialog();
    }
})