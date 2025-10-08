
// Identificar el dialogo
const dialog = document.querySelector("dialog");

// Identificar el botón que abrirá el dialogo
const button = document.querySelector("button");

// Añadir eventos para abrir el dialogo
button.addEventListener("click", () => {
    dialog.showModal();
})

// Identificar la "x" que cierra el dialogo
const closeDialog = document.querySelector(".close-dialog");

// Añadir evento para cerrar el dialogo
closeDialog.addEventListener("click", () => {
    dialog.close();
})