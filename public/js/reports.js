import { handleFetch } from "./handle-fetch.js";


// Variables globales
const userId = localStorage.getItem("user_id");

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
    // console.log(result);
}

async function getTotalUsers() {
    const result = await handleFetch(
        `http://localhost:3000/api/student-count?userId=${userId}`,
        "GET",
    )
    // console.log(result);
}