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
        `/api/user?userId=${userId}`,
        "GET",
    )

    const name = sidebar.querySelector("#user-name")
    const dni = sidebar.querySelector("#user-dni")
    const photo = sidebar.querySelector("#user-photo");

    name.textContent = result.info.user;
    dni.textContent = result.info.dni;

    if (result.info.photo) {
        photo.innerHTML = `<img id="user-photo" src="${result.info.photo}" />`
        photo.src = result.info.photo;
    } else {
        photo.innerHTML = `<svg id="user-photo" height=512 style="enable-background:new 0 0 512 512"version=1.1 viewBox="0 0 24 24"width=512 x=0 xml:space=preserve xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink y=0><g><path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0ZM7 21.797V21c0-2.757 2.243-5 5-5s5 2.243 5 5v.797C15.499 22.566 13.799 23 12 23s-3.499-.434-5-1.203Zm11-.582V21c0-3.309-2.691-6-6-6s-6 2.691-6 6v.215C2.992 19.25 1 15.853 1 12 1 5.935 5.935 1 12 1s11 4.935 11 11c0 3.853-1.992 7.25-5 9.215ZM12 5C9.794 5 8 6.794 8 9s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4Zm0 7c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3Z"data-original=#000000 fill=#181818 opacity=1></path></g></svg>`;
    }

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