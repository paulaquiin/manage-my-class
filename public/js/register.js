const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const { user, password, dni } = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, password, dni }),
        });

        const result = await response.json();

        if (!response.ok) {
            const errorEl = document.getElementById(result.errorId);
            if (errorEl) {
                errorEl.textContent = result.message;
            }
        } else {
            if (result.redirect) {
                window.location.href = result.redirect;
            }
        }
    } catch (error) {}
});