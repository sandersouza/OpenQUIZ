// Selecionar os campos do editor
const protocolBtn = document.getElementById("protocol-toggle-btn");
const methodField = document.getElementById("query-method");
const urlField = document.getElementById("query-url");
const bodyField = document.getElementById("query-body");
const bearerField = document.getElementById("bearer-token");

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
