import { handleFetch } from "./handle-fetch.js";

const userId = localStorage.getItem("user_id");
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
    const result = await handleFetch(
        `http://localhost:3000/api/user?userId=${userId}`,
        "GET",
    )

    dniInput.value = result.info.dni;
    userInput.value = result.info.user;
    activityInput.value = result.info.activityPercentage;
    examInput.value = result.info.examPercentage;
}


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);


    const { user, dni, activityPercentage, examPercentage, password } = Object.fromEntries(formData.entries());


    console.log(user);
    console.log(dni);
    console.log(activityPercentage);
    console.log(examPercentage);
    console.log(password);
    await handleFetch(
        `http://localhost:3000/api/user`,
        "PUT",
        JSON.stringify({ userId, user, dni, activityPercentage, examPercentage, password })
    )

})