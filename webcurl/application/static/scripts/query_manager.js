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

// Função para redefinir e focar no campo de URL
function resetAndFocusEditor() {
    document.getElementById("query-url").value = ""; // Limpa o campo de URL
    document.getElementById("query-url").focus(); // Define o foco no campo de URL
}

// Vincular o evento de foco no carregamento da página
document.addEventListener("DOMContentLoaded", () => {
    resetAndFocusEditor(); // Garante o foco no campo ao carregar a página
    setHeadersToTable({}); // Adiciona uma linha em branco na tabela ao carregar a página
});

// Função para adicionar uma nova linha de header à tabela
function addHeaderRow(property = "", value = "") {
    const tableBody = document.querySelector("#headers-table tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="text" class="header-property" value="${property}" placeholder="Property"></td>
        <td><input type="text" class="header-value" value="${value}" placeholder="Value"></td>
        <td class="action-right-row">
            ${property || value ? `<button class="remove-header-row"><i class="bi bi-trash"></i></button>` : ""}
        </td>
    `;

    // Adicionar evento ao botão de remover, se existir
    const removeButton = row.querySelector(".remove-header-row");
    if (removeButton) {
        removeButton.addEventListener("click", () => {
            row.remove(); // Remove a linha ao clicar no botão
        });
    }

    // Evento para adicionar uma nova linha ao preencher a atual
    const propertyField = row.querySelector(".header-property");
    const valueField = row.querySelector(".header-value");

    propertyField.addEventListener("input", ensureBlankRow);
    valueField.addEventListener("input", ensureBlankRow);

    tableBody.appendChild(row);
}

// Função para garantir que sempre haja uma linha em branco no final da tabela
function ensureBlankRow() {
    const rows = document.querySelectorAll("#headers-table tbody tr");
    const lastRow = rows[rows.length - 1];
    const property = lastRow.querySelector(".header-property").value.trim();
    const value = lastRow.querySelector(".header-value").value.trim();

    if (property || value) {
        addHeaderRow(); // Adiciona uma nova linha em branco
    }
}

// Função para obter headers da tabela como JSON
function getHeadersFromTable() {
    const headers = {};
    const rows = document.querySelectorAll("#headers-table tbody tr");

    rows.forEach((row) => {
        const property = row.querySelector(".header-property").value.trim();
        const value = row.querySelector(".header-value").value.trim();
        if (property) {
            headers[property] = value;
        }
    });

    return headers;
}

// Função para preencher a tabela de headers com dados
function setHeadersToTable(headers) {
    const tableBody = document.querySelector("#headers-table tbody");
    tableBody.innerHTML = ""; // Limpa linhas anteriores

    Object.entries(headers).forEach(([key, value]) => {
        addHeaderRow(key, value);
    });

    // Sempre mantém uma linha em branco no final
    addHeaderRow();
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
    let parsedBody = "";

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
        headers: getHeadersFromTable(), // Headers da tabela
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
                    loadAllQueries();
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
                    loadAllQueries();
                    currentQueryId = data.id;
                    currentQueryName = queryName;
                    resetAndFocusEditor(); // Resetar e focar no campo após criar
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
            bodyField.value = JSON.stringify(data.body || {}, null, 2);
            setHeadersToTable(data.headers || {}); // Preencher a tabela de headers
            bearerField.value = data.bearer_token || "";
            protocolBtn.textContent = data.protocol || "HTTP";

            currentQueryId = data._id;
            currentQueryName = data.name;

            document.querySelectorAll(".query-item").forEach((item) => {
                item.classList.remove("selected");
            });
            selectedItem.classList.add("selected");
        })
        .catch((err) => {
            console.error("Error loading query:", err);
        });
}

// Função para executar a query
function executeQuery() {
    const url = urlField.value.trim();
    const method = methodField.value.trim().toUpperCase();
    const headers = getHeadersFromTable();
    const token = bearerField.value.trim();

    // Validar a URL
    if (!url) {
        showFeedbackMessage("API URL/URI is required.");
        return;
    }

    // Adicionar Bearer Token aos headers, se fornecido
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
        url,
        method,
        headers,
        body: validateRequestBody()
    };

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
