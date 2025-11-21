import { handleFetch } from "./handle-fetch.js";

const form = document.querySelector("form");
const dniInput = form.querySelector("input#dni")
const userInput = form.querySelector("input#user")
const activityInput = form.querySelector("input#activity-percentage");
const examInput = form.querySelector("input#exam-percentage");

// init es la función que arranca todas las funciones
init();

function init() {
    loadConfig();
}

// Encargado de recuperar toda la información de
// configuración y rellenar los respectivos inputs
async function loadConfig() {
    
    // Información del usuario
    const userId = localStorage.getItem("user_id");
    const result = await handleFetch(
    `http://localhost:3000/api/user?userId=${userId}`,
        "GET",
    )

    dniInput.value = result.info.dni;
    userInput.value = result.info.user;
    activityInput.value = result.info.activityPercentage;
    examInput.value = result.info.examPercentage;
}