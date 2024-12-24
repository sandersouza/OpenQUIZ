// Selecionar os campos do editor
const protocolBtn = document.getElementById("protocol-toggle-btn");
const methodField = document.getElementById("query-method");
const urlField = document.getElementById("query-url");
const bodyField = document.getElementById("query-body");
const headersField = document.getElementById("query-headers");
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

// Função para recarregar o sidebar
function reloadSidebar() {
    const queriesList = document.getElementById("queries-list");
    queriesList.innerHTML = ""; // Limpa a lista atual

    fetch("/queries")
        .then((res) => res.json())
        .then((queries) => {
            queries.forEach((query) => {
                addQueryToSidebar(query.name, query._id, query.method);
            });
        })
        .catch((err) => {
            console.error("Error reloading sidebar:", err);
        });
}

// Função para processar os headers em JSON
function parseHeaders(headersText) {
    const headers = {};
    const lines = headersText.split("\n").filter((line) => line.trim() !== "");

    lines.forEach((line, index) => {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) {
            showFeedbackMessage(`Header line ${index + 1} is invalid. Use format "Key: Value".`);
            throw new Error("Invalid header format");
        }

        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 1).trim();
        headers[key] = value;
    });

    return headers;
}

// Função para salvar a query (criar ou atualizar)
function saveQuery() {
    let parsedHeaders = {};
    let parsedBody = "";

    // Processar os headers
    try {
        parsedHeaders = parseHeaders(headersField.value);
    } catch (e) {
        return; // Não prosseguir se os headers forem inválidos
    }

    // Validar o body como JSON, se preenchido
    if (bodyField.value.trim() !== "") {
        try {
            parsedBody = JSON.parse(bodyField.value);
        } catch (e) {
            showFeedbackMessage("Request Body must be in valid JSON format.");
            return;
        }
    }

    // Dados da query
    const queryData = {
        protocol: protocolBtn.textContent.trim(),
        method: methodField.value,
        url: urlField.value,
        headers: parsedHeaders,
        body: parsedBody,
        bearer_token: bearerField.value
    };

    if (currentQueryId) {
        // Atualizar query existente
        fetch(`/queries/${currentQueryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(queryData)
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    showFeedbackMessage(`Error: ${data.error}`);
                } else {
                    showFeedbackMessage("Query updated successfully!");
                    reloadSidebar(); // Recarrega o sidebar após salvar
                }
            })
            .catch((err) => console.error("Error updating query:", err));
    } else {
        // Criar uma nova query
        const queryName = prompt("Enter a name for the new query:");
        if (!queryName || queryName.trim() === "") {
            showFeedbackMessage("Query name is required!");
            return;
        }
        queryData.name = queryName.trim();

        fetch("/queries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(queryData)
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    showFeedbackMessage(`Error: ${data.error}`);
                } else {
                    showFeedbackMessage("Query created successfully!");
                    reloadSidebar(); // Recarrega o sidebar após criar
                    currentQueryId = data.id; // Atualizar o ID da nova query
                    currentQueryName = queryName; // Atualizar o nome da nova query
                }
            })
            .catch((err) => {
                console.error("Error saving query:", err);
                showFeedbackMessage("An error occurred while saving the query.");
            });
    }
}

// Função para carregar uma query no editor
function loadQuery(queryId, selectedItem) {
    fetch(`/queries/${queryId}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                showFeedbackMessage(`Error loading query: ${data.error}`);
                return;
            }

            // Preencher os campos com os dados da query
            urlField.value = data.url || "";
            methodField.value = data.method || "GET";
            bodyField.value = data.body || "";
            headersField.value = Object.entries(data.headers || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n");
            bearerField.value = data.bearer_token || "";
            protocolBtn.textContent = data.protocol || "HTTP";

            // Atualizar o ID e o nome da query carregada
            currentQueryId = data._id;
            currentQueryName = data.name;

            // Alterar estilo de seleção
            document.querySelectorAll(".query-item").forEach((item) => {
                item.classList.remove("selected");
                item.style.backgroundColor = ""; // Remove fundo de seleção de outros itens
            });
            selectedItem.classList.add("selected");
            selectedItem.style.backgroundColor = "#1E1E1E"; // Fundo da query selecionada
        })
        .catch((err) => {
            console.error("Error loading query:", err);
        });
}

// Função para executar a query
function executeQuery() {
    const url = urlField.value.trim();
    const method = methodField.value.trim().toUpperCase();
    const headersValue = headersField.value.trim();
    const bodyValue = bodyField.value.trim();
    const token = bearerField.value.trim();

    // Validar a URL
    if (!url) {
        showFeedbackMessage("API URL/URI is required.");
        return;
    }

    // Processar os headers
    let parsedHeaders = {};
    if (headersValue) {
        try {
            parsedHeaders = parseHeaders(headersValue);
        } catch (e) {
            showFeedbackMessage("Invalid headers format. Please fix and try again.");
            return;
        }
    }

    // Validar o Request Body (se necessário)
    let parsedBody = null;
    if (bodyValue) {
        try {
            parsedBody = JSON.parse(bodyValue);
        } catch (e) {
            showFeedbackMessage("Request Body must be in valid JSON format.");
            return;
        }
    }

    // Adicionar Bearer Token aos headers, se fornecido
    if (token) {
        parsedHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Dados a serem enviados ao backend
    const payload = {
        url,
        method,
        headers: parsedHeaders,
        body: parsedBody
    };

    // Enviar ao backend para execução
    fetch("/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                showFeedbackMessage(`Error: ${data.error}`);
                return;
            }

            // Exibir resultados
            const responseContainer = document.getElementById("response-output");
            const headersContainer = document.getElementById("response-headers");

            responseContainer.innerHTML = `<pre>${JSON.stringify(data.output, null, 2)}</pre>`;
            headersContainer.innerHTML = data.headers
                .map((header) => `<div class="header-line">${header}</div>`)
                .join("");
        })
        .catch((err) => {
            console.error("Error executing query:", err);
            showFeedbackMessage("An error occurred while executing the query.");
        });
}

// Vincular os botões
document.getElementById("execute-query-btn").addEventListener("click", executeQuery);
document.getElementById("save-query-btn").addEventListener("click", saveQuery);
