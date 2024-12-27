function showFeedbackMessage(message) {
    const feedbackElement = document.getElementById("feedback-message");
    feedbackElement.textContent = message;
    feedbackElement.classList.remove("hidden");
    feedbackElement.classList.add("visible");
    setTimeout(() => {
        feedbackElement.classList.remove("visible");
        feedbackElement.classList.add("hidden");
    }, 2000);
}

function resetAndFocusEditor() {
    document.getElementById("query-url").value = "";
    document.getElementById("query-url").focus();
}

document.addEventListener("DOMContentLoaded", () => {
    resetAndFocusEditor();
    setHeadersToTable({});
});

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
    const removeButton = row.querySelector(".remove-header-row");
    if (removeButton) {
        removeButton.addEventListener("click", () => {
            row.remove();
        });
    }
    const propertyField = row.querySelector(".header-property");
    const valueField = row.querySelector(".header-value");
    propertyField.addEventListener("input", ensureBlankRow);
    valueField.addEventListener("input", ensureBlankRow);
    tableBody.appendChild(row);
}

function ensureBlankRow() {
    const rows = document.querySelectorAll("#headers-table tbody tr");
    const lastRow = rows[rows.length - 1];
    const property = lastRow.querySelector(".header-property").value.trim();
    const value = lastRow.querySelector(".header-value").value.trim();
    if (property || value) {
        addHeaderRow();
    }
}

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

function setHeadersToTable(headers) {
    const tableBody = document.querySelector("#headers-table tbody");
    tableBody.innerHTML = "";
    Object.entries(headers).forEach(([key, value]) => {
        addHeaderRow(key, value);
    });
    addHeaderRow();
}

function validateRequestBody() {
    const bodyValue = bodyField.value.trim();
    if (bodyValue) {
        try {
            return JSON.parse(bodyValue);
        } catch (e) {
            showFeedbackMessage("Request Body must be in valid JSON format.");
            throw new Error("Invalid JSON format in request body");
        }
    }
    return null;
}

function saveQuery() {
    let parsedBody = "";
    try {
        parsedBody = validateRequestBody();
    } catch (e) {
        return;
    }
    const queryData = {
        protocol: protocolBtn.textContent.trim(),
        method: methodField.value,
        url: urlField.value,
        headers: getHeadersFromTable(),
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
                    resetAndFocusEditor();
                }
            })
            .catch((err) => {
                console.error("Error saving query:", err);
                showFeedbackMessage("An error occurred while saving the query.");
            });
    }
}

function loadQuery(queryId, selectedItem) {
    fetch(`/queries/${queryId}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                showFeedbackMessage(`Error loading query: ${data.error}`);
                return;
            }
            urlField.value = data.url || "";
            methodField.value = data.method || "GET";
            bodyField.value = JSON.stringify(data.body || {}, null, 2);
            setHeadersToTable(data.headers || {});
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

function executeQuery() {
    const protocol = protocolBtn.textContent.trim();
    const url = urlField.value.trim();
    const method = methodField.value.trim().toUpperCase();
    const headers = getHeadersFromTable();
    const token = bearerField.value.trim();
    if (!url) {
        showFeedbackMessage("API URL/URI is required.");
        return;
    }
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const payload = {
        protocol,
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

document.getElementById("execute-query-btn").addEventListener("click", executeQuery);
document.getElementById("save-query-btn").addEventListener("click", saveQuery);
