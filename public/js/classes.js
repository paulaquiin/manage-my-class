import { closeDialog, initDialog } from "./dialog.js";
import { handleFetch } from "./handle-fetch.js";
import { iconList } from "./utils/icons.js";


// Variables globales
const userId = localStorage.getItem("user_id");
const content = document.querySelector(".content");
const iconGroupEl = document.querySelector(".icon-group");
const form = document.querySelector("form");


// init es la función que arranca todas las funciones
init();

function init() {
    getClasses();
    renderDialogIcons();
    initDialog();
}

/**
 * CLASES
 */

// Recupera las clases de base de datos
export async function getClasses() {
    const result = await handleFetch(
        `/api/class?userId=${userId}`,
        "GET",
    )
    if (result.success) {
        renderClasses(result.rows);
    }
}

// Se encarga de dibujar las cajas para cada clase
function renderClasses(classes) {

    const template = document.getElementById("box-template");
    const fragment = document.createDocumentFragment();

    classes.forEach((item) => {
        const clone = template.content.cloneNode(true);
        const classEl = clone.querySelector("#class");
        const iconEl = clone.querySelector("img");
        const titleEl = clone.querySelector("#title");
        const studentsEl = clone.querySelector("#students");
        const removeEl = clone.querySelector("svg");
        removeEl.addEventListener("click", () => {
            deleteClassById(item.id)
        })

        classEl.textContent = item.grade;
        iconEl.src = iconList[item.icon];
        titleEl.textContent = item.name;
        studentsEl.textContent = `${item.studentsQty} estudiantes`;

        fragment.appendChild(clone);
    })

    content.appendChild(fragment);
}

// Eliminar una clase de base de datos
async function deleteClassById(id) {

    const result = await handleFetch(
        "/api/class",
        "DELETE",
        JSON.stringify({ id, userId })
    )

    if (result.success) {
        window.location.reload();
    }
}

/**
 * DIALOG
 */

// Se encarga de dibujar el selector de iconos
function renderDialogIcons() {
    for (const key in iconList) {
        const icon = document.createElement("img");
        icon.src = iconList[key];
        icon.dataset.id = key;
        icon.addEventListener("click", () => {
            removeSelectedIcons();
            icon.classList.add("selected");
        })

        iconGroupEl.appendChild(icon);
    }

    focusRandomDialogIcon();
}

// Elimina la clase selected de todos los iconos
function removeSelectedIcons() {
    const icons = iconGroupEl.querySelectorAll("img");
    icons.forEach((icon) => {
        icon.classList.remove("selected");
    })
}

// Auto-focus en un icono aleatorio
function focusRandomDialogIcon() {
    const index = Math.floor(Math.random() * Object.keys(iconList).length);
    const icons = iconGroupEl.querySelectorAll("img");
    icons[index].classList.add("selected");
}

// Evento submit para el formulario del dialog que permite enviar
// los datos de una nueva clase al back
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    // Obtener nombre y curso
    const { name, course } = Object.fromEntries(formData.entries());

    // Icono
    const iconEl = iconGroupEl.querySelector("img.selected");
    const icon = iconEl.dataset.id;

    const result = await handleFetch(
        "/api/class",
        "POST",
        JSON.stringify({ name, course, icon, userId })
    )

    if (result.success) {
        // Si todo ha ido bien, recargo página
        closeDialog();
        window.location.reload();
    }
})