document.addEventListener("DOMContentLoaded", () => {
    const languageSelector = document.getElementById("language-selector");

    // Função para substituir marcadores no DOM
    const replacePlaceholders = (translations) => {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach((element) => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    };

    // Função para carregar o idioma
    const loadLanguage = async (lang) => {
        try {
            const response = await fetch(`languages/${lang}.json`);
            const translations = await response.json();
            replacePlaceholders(translations); // Aplica as traduções
        } catch (error) {
            console.error("Erro ao carregar o idioma:", error);
        }
    };

    // Carrega o idioma inicial
    const savedLang = localStorage.getItem("language") || "en";
    languageSelector.value = savedLang;
    loadLanguage(savedLang);

    // Alterna o idioma quando o seletor é alterado
    languageSelector.addEventListener("change", (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem("language", selectedLang);
        loadLanguage(selectedLang);
    });
});
