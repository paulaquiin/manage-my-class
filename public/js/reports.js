import { handleFetch } from "./handle-fetch.js";


// Variables globales
const userId = localStorage.getItem("user_id");
const content = document.querySelector(".content");
const template = document.getElementById("box-template");

// init es la función que arranca todas las funciones
init();

async function init() {
    await getTotalUsers();
    await getOverallApprovalRate();
    await getOverallFailureRate();
    await getBestClass();
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

        mutedEl.textContent = "Todas las clases"
        titleEl.textContent = "Cantidad de alumnos";
        resultEl.textContent = result.quantity;

        content.appendChild(clone);
    }
}

async function getOverallApprovalRate() {
    const result = await handleFetch(
        `http://localhost:3000/api/grade-overall-approval-rate?userId=${userId}`,
        "GET",
    )

    console.log(result);

    if (result.success) {
        const clone = template.content.cloneNode(true);
        const mutedEl = clone.querySelector("#subtitle");
        const titleEl = clone.querySelector("#title");
        const resultEl = clone.querySelector("#result");

        mutedEl.textContent = "Todas las clases (Aprobados)";
        titleEl.textContent = "Cantidad de aprobados";
        resultEl.textContent = `${result.rate}%`;

        content.appendChild(clone);
    }
}

async function getOverallFailureRate() {
    const result = await handleFetch(
        `http://localhost:3000/api/grade-overall-failure-rate?userId=${userId}`,
        "GET",
    )

    console.log(result);

    if (result.success) {
        const clone = template.content.cloneNode(true);
        const mutedEl = clone.querySelector("#subtitle");
        const titleEl = clone.querySelector("#title");
        const resultEl = clone.querySelector("#result");

        mutedEl.textContent = "Todas las clases (Suspensos)";
        titleEl.textContent = "Cantidad de suspensos";
        resultEl.textContent = `${result.rate}%`;

        content.appendChild(clone);
    }
}