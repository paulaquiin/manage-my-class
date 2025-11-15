let onCloseDialog = null;
export let dialog = null;
export function initDialog() {
    // Identificar el dialogo
    dialog = document.querySelector("dialog");
    
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
}



export function setOnCloseDialog(callback) {
    onCloseDialog = callback;
}

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

    // Si hay algún callback definido tras cerrar un modal, hay que ejecutarlo
    if (onCloseDialog) {
        onCloseDialog();
    }
    // Vaciar todos los selects
    const selects = dialog.querySelectorAll("select");
    selects.forEach((select) => {
        select.value = "";
    })
}