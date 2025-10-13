import { handleFetch } from "./handle-fetch.js";

const sidebar = document.querySelector("aside");

await renderSidebar();
highlightCurrentItem();
renderUserInfo();
handleLogout();

// Permite buscar el "partial" del sidebar, se encargará
// de obtener el html e incrustarlo para simular el mismo
// comportamiento que un componente React
async function renderSidebar() {
    const file = sidebar.getAttribute("data-include");
    const res = await fetch(file);
    const html = await res.text();
    sidebar.innerHTML = html;
}

// Se encarga de añadir la clase select al item del sidebar que
// toca, según la url.
function highlightCurrentItem() {
    const pathname = window.location.pathname;
    
    const current = sidebar.querySelector(`a[data-url='${pathname}']`);
    if (current) {
        current.classList.add("selected");
    }
}

// Renderizar información del usuario en el sidebar
async function renderUserInfo() {
    const userId = localStorage.getItem("user_id");
    const result = await handleFetch(
        `http://localhost:3000/api/user?userId=${userId}`,
        "GET",
    )

    const name = sidebar.querySelector("#user-name")
    const dni = sidebar.querySelector("#user-dni")

    name.textContent = result.info.user;
    dni.textContent = result.info.dni;

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