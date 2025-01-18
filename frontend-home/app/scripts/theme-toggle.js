document.addEventListener("DOMContentLoaded", () => {
    const themeToggler = document.getElementById("theme-toggler");
    const lightModeLink = document.getElementById("light-mode");
    const darkModeLink = document.getElementById("dark-mode");

    // Verifica se os elementos existem no DOM
    if (!themeToggler || !lightModeLink || !darkModeLink) {
        console.error("Erro: Elementos necessários não encontrados no DOM.");
        return;
    }

    // Função para alternar entre os temas
    const toggleTheme = (isDark) => {
        if (isDark) {
            darkModeLink.disabled = false;
            lightModeLink.disabled = true;
            localStorage.setItem("theme", "dark");
        } else {
            darkModeLink.disabled = true;
            lightModeLink.disabled = false;
            localStorage.setItem("theme", "light");
        }
    };

    // Define o tema com base no LocalStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        themeToggler.checked = true;
        toggleTheme(true);
    } else {
        themeToggler.checked = false;
        toggleTheme(false);
    }

    // Alterna o tema quando o botão é clicado
    themeToggler.addEventListener("change", () => {
        toggleTheme(themeToggler.checked);
    });
});
