export async function handleFetch(url, method, body, validateToken = true) {

    const token = localStorage.getItem("token");
    if (validateToken && !token) {
        localStorage.removeItem("token");
        window.location.href = "/iniciar-sesion";
        return;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: body
        });

        // En el caso de una respuesta no autorizada (401) se redirige
        // a iniciar-sesion
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/iniciar-sesion";
            return;
        }

        const result = await response.json();

        if (!result.success) {
            const errorEl = document.getElementById(result.errorId);
            if (errorEl) {
                errorEl.classList.add("show");
            }
        }

        return result;
    } catch (error) {
        console.error("Error en fetch:", error);
    }
}