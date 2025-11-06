import { handleFetch } from "./handle-fetch.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const { user, password, dni } = Object.fromEntries(formData.entries());

    const result = await handleFetch(
        "http://localhost:3000/api/register",
        "POST",
        JSON.stringify({ user, password, dni }),
        false
    )

    if (result.success) {
        window.location.href = "/iniciar-sesion/"
    }
});