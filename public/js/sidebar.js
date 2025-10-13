
await renderSidebar();
highlightCurrentItem();
handleLogout();

// Permite buscar el "partial" del sidebar, se encargará
// de obtener el html e incrustarlo para simular el mismo
// comportamiento que un componente React
async function renderSidebar() {
    const sidebar = document.querySelector("aside[data-include]");
    const file = sidebar.getAttribute("data-include");
    const res = await fetch(file);
    const html = await res.text();
    sidebar.innerHTML = html;
}

// Se encarga de añadir la clase select al item del sidebar que
// toca, según la url.
function highlightCurrentItem() {
    const pathname = window.location.pathname;
    const sidebar = document.querySelector("aside");
    const current = sidebar.querySelector(`a[data-url='${pathname}']`);
    current.classList.add("selected");
}

// Se encarga de eliminar el token de autenticación y redirigir
// a /iniciar-sesion/
function handleLogout() {
    const logoutEl = document.getElementById("logout");
    logoutEl.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/iniciar-sesion/";
    })
}