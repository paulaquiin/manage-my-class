import { handleFetch } from "./handle-fetch.js";
import { iconList } from "./utils/icons.js";

// Variables globales
const userId = localStorage.getItem("user_id");
const content = document.querySelector(".content");
const filters = document.querySelector(".filter");

init();

// La función principal a lanzar dependerá si la url contiene el parámetro "clase".
// Si lo contiene, significa que debo mostrar las notas de esa clase
// Si no es así, entonces debo renderizar la lista de clases para que el profesor elija una
function init() {
    let params = new URLSearchParams(document.location.search);
    if (params.get("clase")) {
        handleGrades(params.get("clase"));
    } else {
        handleClasses();
    }
}

function handleGrades(className) {
    console.log("Renderizar notas");
    // 1. Ocultar filtros.
    filters.classList.add("hide");
    // 2. Listar las notas según el nombre de la clase que he recibido
    getGrades(className);
}

async function getGrades(className) {
    const result = await handleFetch(
        `http://localhost:3000/api/grade?className=${className}`,
        "GET",
    )
    console.log(result);
}

// Encargado de obtener las clases y renderizarlas en pantalla
function handleClasses() {

    // 1. Ocultar notas.
    content.classList.add("hide");
    // 2. Listar las clases
    getClasses();

}

async function getClasses() {
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
        // Renderizar las clases
        renderClasses(result.rows);
    }
}

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
