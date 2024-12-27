// Selecionar os campos do editor
const protocolBtn = document.getElementById("protocol-toggle-btn");
const methodField = document.getElementById("query-method");
const urlField = document.getElementById("query-url");
const bodyField = document.getElementById("query-body");
const bearerField = document.getElementById("bearer-token");

// Sidebar constants
const sidebar = document.querySelector(".queries-sidebar");
const toggleContainer = document.querySelector(".toggle-lingueta");

// Variáveis para armazenar o estado atual
let currentQueryId = null;
let currentQueryName = null;

// Função para exibir mensagem de feedback
function showFeedbackMessage(message) {
    const feedbackElement = document.getElementById("feedback-message");
    feedbackElement.textContent = message;
    feedbackElement.classList.remove("hidden");
    feedbackElement.classList.add("visible");

    // Remover a mensagem após 2 segundos
    setTimeout(() => {
        feedbackElement.classList.remove("visible");
        feedbackElement.classList.add("hidden");
    }, 2000);
}

// For PWA application Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/static/scripts/service-worker.js")
        .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
            console.error("Service Worker registration failed:", error);
        });
}
