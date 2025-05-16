//theme.js

document.addEventListener("DOMContentLoaded", () => {
    const themeBtn = document.getElementById("theme-btn");
    const body = document.body;

    // Verificamos si ya hay un tema guardado
    let savedTheme = localStorage.getItem("theme");

    // Si no hay tema guardado, usamos el del sistema
    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedTheme = prefersDark ? 'theme-dark' : 'theme-light';
        localStorage.setItem("theme", savedTheme);
    }

    // Aplicamos el tema guardado o detectado
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(savedTheme);
    updateThemeButtonText(savedTheme);

    // Cambiar tema al hacer clic
    themeBtn.addEventListener("click", () => {
        body.classList.toggle("theme-dark");
        body.classList.toggle("theme-light");

        const currentTheme = body.classList.contains("theme-dark") ? "theme-dark" : "theme-light";
        localStorage.setItem("theme", currentTheme);
        updateThemeButtonText(currentTheme);
    });

    function updateThemeButtonText(theme) {
        if (theme === "theme-dark") {
            themeBtn.textContent = "☀️ Modo Claro";
        } else {
            themeBtn.textContent = "🌙 Modo Oscuro";
        }
    }
});
