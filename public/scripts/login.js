const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const { user, password } = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            const errorEl = document.getElementById(result.errorId);
            if (errorEl) {
                errorEl.textContent = result.message;
            }
            
        }
    } catch (error) {}
});