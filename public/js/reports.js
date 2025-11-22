import { handleFetch } from "./handle-fetch.js";


// Variables globales
const userId = localStorage.getItem("user_id");
const content = document.querySelector(".content");
const template = document.getElementById("box-template");

// init es la función que arranca todas las funciones
init();

function init() {
    getBestClass();
    getTotalUsers();
}

async function getBestClass() {
    const result = await handleFetch(
        `http://localhost:3000/api/top-approved-class?userId=${userId}`,
        "GET",
    )

    if (result.success) {
        const clone = template.content.cloneNode(true);
        const mutedEl = clone.querySelector("#subtitle");
        const titleEl = clone.querySelector("#title");
        const gradeEl = clone.querySelector("#grade");
        const resultEl = clone.querySelector("#result");

        mutedEl.textContent = "Mejor Clase (Aprobados)";
        if (result.classroom) {
            titleEl.textContent = result.classroom.name;
            gradeEl.textContent = result.classroom.grade;
            resultEl.textContent = `${result.classroom.approval_percentage}%`;
        } else {
            titleEl.textContent = "-";
            resultEl.textContent = "-%";

        }
    
    
        content.appendChild(clone);
    }
}

async function getTotalUsers() {
    const result = await handleFetch(
        `http://localhost:3000/api/student-count?userId=${userId}`,
        "GET",
    )

    if (result.success) {
        const clone = template.content.cloneNode(true);
        const mutedEl = clone.querySelector("#subtitle");

        const titleEl = clone.querySelector("#title");
        const resultEl = clone.querySelector("#result");
    
        // mutedEl.textContent = "Cantidad de alumnos";
        mutedEl.textContent = "Todas las clases"
        titleEl.textContent = "Cantidad de alumnos";
        resultEl.textContent = result.quantity;
    
        content.appendChild(clone);
    }
}