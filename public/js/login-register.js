
// Añadir la clase "active" al elemento correspondiente dependiendo si la url es 'iniciar-sesion' o 'registro'
handleActiveAnchor();

function handleActiveAnchor() {
    const lastSegment = window.location.pathname
    const anchorEl = document.querySelector(`a[data-url='${lastSegment}'`);
    anchorEl.classList.add("active");
}