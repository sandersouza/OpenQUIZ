document.addEventListener("DOMContentLoaded", () => {
    const themeToggler = document.getElementById("theme-toggler");
    const lightModeLink = document.getElementById("light-mode");
    const darkModeLink = document.getElementById("dark-mode");
    const themeIcon = document.getElementById("theme-icon");

    // Função para alternar tema
    const toggleTheme = (isDark) => {
        if (isDark) {
            darkModeLink.disabled = false;
            lightModeLink.disabled = true;
            themeIcon.textContent = "dark_mode"; // Ícone de lua
            localStorage.setItem("theme", "dark"); // Salvar tema no localStorage
        } else {
            darkModeLink.disabled = true;
            lightModeLink.disabled = false;
            themeIcon.textContent = "light_mode"; // Ícone de sol
            localStorage.setItem("theme", "light"); // Salvar tema no localStorage
        }
    };

    // Verifica o tema salvo no localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        themeToggler.checked = true;
        toggleTheme(true);
    } else {
        themeToggler.checked = false;
        toggleTheme(false);
    }

    // Adiciona evento para alternar o tema
    themeToggler.addEventListener("change", () => {
        toggleTheme(themeToggler.checked);
    });
});
