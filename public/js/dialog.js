
// Identificar el dialogo
const dialog = document.querySelector("dialog");

// Identificar el botón que abrirá el dialogo
const button = document.querySelector("button");

// Añadir eventos para abrir el dialogo
button.addEventListener("click", () => {
    dialog.showModal();
})

// Identificar la "x" que cierra el dialogo
const closeDialogEl = document.querySelector(".close-dialog");

// Añadir evento para cerrar el dialogo
closeDialogEl.addEventListener("click", closeDialog);

export function closeDialog() {
    // Cerrar dialog
    dialog.close();

    // Vacíar todos los inputs
    const inputs = dialog.querySelectorAll("input:not(input[type='submit'])");
    inputs.forEach((input) => {
        input.value = "";
    })

    // Esconder todos los mensajes de error
    const errorMessages = dialog.querySelectorAll(".error");
    errorMessages.forEach((errorMsg) => {
        errorMsg.classList.remove("show");
    })
}