import { handleFetch } from "./handle-fetch.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { user, password } = Object.fromEntries(formData.entries());

    const result = await handleFetch(
        "http://localhost:3000/api/login",
        "POST",
        JSON.stringify({ user, password }),
        false
    )

    if (!result.token) {
        const errorEl = document.getElementById(result.errorId);
        if (errorEl) {
            errorEl.textContent = result.message;
        }
    } else {
        localStorage.setItem("token", result.token)
        localStorage.setItem("user_id", result.user_id)
        window.location.href = "/clases";
    }

});