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

// Função para validar e processar o corpo da requisição
function validateRequestBody() {
    const bodyValue = bodyField.value.trim();
    if (bodyValue) {
        try {
            return JSON.parse(bodyValue); // Valida o JSON
        } catch (e) {
            showFeedbackMessage("Request Body must be in valid JSON format.");
            throw new Error("Invalid JSON format in request body");
        }
    }
    return null; // Retorna null se o corpo estiver vazio
}

// Função para salvar ou atualizar uma query
function saveQuery() {
    let parsedHeaders = {};
    let parsedBody = "";

    // Processar os headers
    try {
        parsedHeaders = parseHeaders(headersField.value);
    } catch (e) {
        return; // Não prosseguir se os headers forem inválidos
    }

    // Validar e processar o corpo da requisição
    try {
        parsedBody = validateRequestBody();
    } catch (e) {
        return; // Não prosseguir se o corpo for inválido
    }

    const queryData = {
        protocol: protocolBtn.textContent.trim(),
        method: methodField.value,
        url: urlField.value,
        headers: parsedHeaders,
        body: parsedBody,
        bearer_token: bearerField.value
    };

    if (currentQueryId) {
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
                    reloadSidebar();
                }
            })
            .catch((err) => console.error("Error updating query:", err));
    } else {
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
                    reloadSidebar();
                    currentQueryId = data.id;
                    currentQueryName = queryName;
                }
            })
            .catch((err) => {
                console.error("Error saving query:", err);
                showFeedbackMessage("An error occurred while saving the query.");
            });
    }
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
