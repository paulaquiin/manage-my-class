import { closeDialog } from "./dialog.js";


// Variables globales
const userId = localStorage.getItem("user_id");
const content = document.querySelector(".content");
const iconGroupEl = document.querySelector(".icon-group");
const form = document.querySelector("form");
const iconList = {
    1: "../assets/classes/biologia.svg",
    2: "../assets/classes/educacion-fisica.svg",
    3: "../assets/classes/geografia.svg",
    4: "../assets/classes/ingles.svg",
    5: "../assets/classes/lengua.svg",
    6: "../assets/classes/mates.svg",
    7: "../assets/classes/musica.svg",
    8: "../assets/classes/plastica.svg",
    9: "../assets/classes/religion.svg",
}

// Funciones
getClasses();
renderDialogIcons();

/**
 * CLASES
 */

// Recupera las clases de base de datos
async function getClasses() {
    try {
        const response = await fetch(`http://localhost:3000/api/class?userId=${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();

        if (!response.ok) {
            const errorEl = document.getElementById(result.errorId);
            if (errorEl) {
                errorEl.classList.add("show");
            }
        } else {
            // Vaciar todas las clases del DOM
            removeDomClasses();
            // Renderizar las clases
            renderClasses(result.rows);
        }
    } catch (error) {
        console.log(error);
    }
}

// Función para ibujar las cajas para cada clase
function renderClasses(classes) {

    const template = document.getElementById("box-template");
    const fragment = document.createDocumentFragment();

    classes.forEach((item) => {
        const clone = template.content.cloneNode(true);

        const classEl = clone.querySelector("#class");
        const iconEl = clone.querySelector("img");
        const titleEl = clone.querySelector("#title");
        const studentsEl = clone.querySelector("#students");
        const removeEl = clone.querySelector("#delete-class");
        removeEl.addEventListener("click", () => {
            deleteClassById()
        })

        classEl.textContent = item.grade;
        iconEl.src = iconList[item.icon];
        titleEl.textContent = item.name;
        studentsEl.textContent = `${item.students} estudiantes`;

        fragment.appendChild(clone);
    })

    content.appendChild(fragment);
}

// Función para eliminar cada caja que representa cada clase
function removeDomClasses() {
    const classes = content.querySelectorAll(".box");
    classes.forEach((classEl) => {
        classEl.remove();
    })
}

// Eliminar una clase de base de datos
async function deleteClassById(id) {
    try {
        const response = await fetch("http://localhost:3000/api/class", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (response.ok) {
            // Si todo ha ido bien, llamamos a getClasses para eliminar todo y renderizar de nuevo la lista
            getClasses();
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * DIALOG
 */

// Función para dibujar el selector de iconos
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

    // Se lanza la petición
    try {
        const response = await fetch("http://localhost:3000/api/class", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, course, icon, userId }),
        });

        const result = await response.json();

        if (!response.ok) {
            const errorEl = document.getElementById(result.errorId);
            if (errorEl) {
                errorEl.classList.add("show");
            }
        } else {
            // Si todo ha ido bien, cierra el dialog y recupera
            // nuevamente todas las clases (las antiguas + la nueva)
            closeDialog();
            getClasses();
        }
    } catch (error) {
        console.log(error);
    }
})