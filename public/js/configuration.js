import { handleFetch } from "./handle-fetch.js";

const userId = localStorage.getItem("user_id");
const form = document.querySelector("form");
const photoLabel = form.querySelector("#label-photo");
const photoInput = form.querySelector("input#photo");
const dniInput = form.querySelector("input#dni");
const userInput = form.querySelector("input#user");
const activityInput = form.querySelector("input#activity-percentage");
const examInput = form.querySelector("input#exam-percentage");

// init es la función que arranca todas las funciones
init();

function init() {
    loadConfig();
    handleChosenPhotoPreview();
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

    if (result.info.photo) {
        photoLabel.innerHTML = `<img src="${result.info.photo}" />`
    } else {
        photoLabel.innerHTML = `<svg id="user-photo" height=512 style="enable-background:new 0 0 512 512"version=1.1 viewBox="0 0 24 24"width=512 x=0 xml:space=preserve xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink y=0><g><path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0ZM7 21.797V21c0-2.757 2.243-5 5-5s5 2.243 5 5v.797C15.499 22.566 13.799 23 12 23s-3.499-.434-5-1.203Zm11-.582V21c0-3.309-2.691-6-6-6s-6 2.691-6 6v.215C2.992 19.25 1 15.853 1 12 1 5.935 5.935 1 12 1s11 4.935 11 11c0 3.853-1.992 7.25-5 9.215ZM12 5C9.794 5 8 6.794 8 9s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4Zm0 7c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3Z"data-original=#000000 fill=#181818 opacity=1></path></g></svg>`;
    }
}

function handleChosenPhotoPreview() {
    photoInput.addEventListener("change", (e) => {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (event) => {
            photoLabel.innerHTML = `<img src="${event.target.result}" />`
            photo.src = result.info.photo;
        }
    })
}


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);


    const { user, dni, activityPercentage, examPercentage, password } = Object.fromEntries(formData.entries());

    if (
        ((parseInt(activityPercentage) + parseInt(examPercentage)) > 100) ||
        ((parseInt(activityPercentage) + parseInt(examPercentage)) < 100)
    ) {
        const errorEl = form.querySelector("#percentage-overflow-error");
        errorEl.classList.add("show");
        return;
    }

    let photo = undefined;
    const file = photoInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (event) => {
            photo = event.target.result
            console.log(photo);
            const result = await handleFetch(
                `http://localhost:3000/api/user`,
                "PUT",
                JSON.stringify({ userId, user, dni, photo, activityPercentage, examPercentage, password })
            )

            if (result.success) {
                // window.location.reload();
            }
        }
    }


})