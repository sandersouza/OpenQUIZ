// sidebar.js

// Função para carregar todas as queries da API
async function loadAllQueries() {
    try {
        const res = await fetch("/collections");
        if (!res.ok) {
            throw new Error(`Erro na resposta da API: ${res.status}`);
        }
        const collections = await res.json();
        const queriesList = document.getElementById("queries-list");
        if (!queriesList) {
            console.error("Elemento com id 'queries-list' não foi encontrado no DOM.");
            return;
        }
        queriesList.innerHTML = "";
        collections.forEach(col => addCollectionToSidebar(col));
    } catch (err) {
        console.error("Error loading collections:", err);
    }
}

// Função para carregar uma query específica e atualizar os campos do formulário
async function loadQuery(queryId, selectedItem) {
    try {
        const res = await fetch(`/queries/${queryId}`);
        if (!res.ok) {
            throw new Error(`Erro na resposta da API: ${res.status}`);
        }
        const data = await res.json();
        if (data.error) {
            showFeedbackMessage(`Error loading query: ${data.error}`);
            return;
        }
        document.getElementById("query-url").value = data.url || "";
        document.getElementById("query-method").value = data.method || "GET";
        document.getElementById("query-body").value = data.body ? JSON.stringify(data.body, null, 2) : "";
        setHeadersToTable(data.headers || {});
        document.getElementById("bearer-token").value = data.bearer_token || "";
        protocolBtn.textContent = data.protocol || "HTTP";

        currentQueryId = data._id;
        currentQueryName = data.name;
        currentCollectionId = selectedItem.dataset.collectionId || null;

        console.log(`Query loaded: ${currentQueryName} (${currentQueryId})`);

        document.querySelectorAll(".query-item").forEach(item => item.classList.remove("selected"));
        selectedItem.classList.add("selected");
    } catch (err) {
        console.error("Error loading query:", err);
    }
}

// Função para deletar uma query
async function deleteQuery(queryId) {
    try {
        const confirmation = confirm("Are you sure you want to delete this query?");
        if (!confirmation) return;

        const res = await fetch(`/queries/${queryId}`, { method: "DELETE" });
        if (!res.ok) {
            const error = await res.json();
            console.error("Error deleting query:", error.message);
            showFeedbackMessage(`Error: ${error.message}`);
            return;
        }
        showFeedbackMessage("Query deleted successfully!");
        loadAllQueries();
    } catch (err) {
        console.error("Error deleting query:", err);
        showFeedbackMessage("An error occurred while deleting the query.");
    }
}

// Função para duplicar uma query
async function duplicateQuery(queryId) {
    try {
        const res = await fetch(`/queries/${queryId}`);
        if (!res.ok) {
            throw new Error("Failed to load query for duplication");
        }
        const originalQuery = await res.json();
        if (originalQuery.error) {
            showFeedbackMessage(`Error loading query for duplication: ${originalQuery.error}`);
            return;
        }
        // Cria uma cópia da query sem o ID
        const duplicatedQuery = { ...originalQuery, name: originalQuery.name };
        delete duplicatedQuery._id;

        const duplicateRes = await fetch("/queries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(duplicatedQuery)
        });
        if (!duplicateRes.ok) {
            const error = await duplicateRes.json();
            console.error("Error duplicating query:", error.message);
            showFeedbackMessage(`Error: ${error.message}`);
            return;
        }
        showFeedbackMessage("Query duplicated successfully!");
        loadAllQueries();
    } catch (err) {
        console.error("Error duplicating query:", err);
        showFeedbackMessage("An error occurred while duplicating the query.");
    }
}

// Função para adicionar uma query ao sidebar
function addQueryToSidebar(queryName, queryId, method, parent, collectionId) {
    const queriesList = parent || document.getElementById("queries-list");
    if (!queriesList) {
        console.error("Elemento com id 'queries-list' não foi encontrado.");
        return;
    }
    const newItem = document.createElement("li");
    newItem.innerHTML = `
        <div class="queries-label">
            <span class="queries-method ${method.toLowerCase()}">${method}</span>
            <span class="queries-name">${queryName}</span>
            <span class="menu-button" id="sidebar-item-menu"><i class="bi bi-three-dots-vertical"></i></span>
            <div class="menu-options hidden">
                <button class="menu-option" onclick="renameQuery('${queryId}')">Rename</button>
                <button class="menu-option" onclick="duplicateQuery('${queryId}')">Duplicate</button>
                <button class="menu-option" onclick="deleteQuery('${queryId}')">Delete</button>
            </div>
        </div>
    `;
    newItem.dataset.queryId = queryId;
    if (collectionId) {
        newItem.dataset.collectionId = collectionId;
    }
    newItem.classList.add("query-item");
    queriesList.appendChild(newItem);

    const menuButton = newItem.querySelector("#sidebar-item-menu");
    const menuOptions = newItem.querySelector(".menu-options");

    menuButton.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".menu-options.visible").forEach(menu => {
            menu.classList.remove("visible");
        });
        menuOptions.classList.toggle("visible");
    });

    newItem.addEventListener("click", () => {
        loadQuery(queryId, newItem);
    });

    document.addEventListener("click", () => {
        menuOptions.classList.remove("visible");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            menuOptions.classList.remove("visible");
        }
    });
}

function addCollectionToSidebar(collection) {
    const queriesList = document.getElementById("queries-list");
    if (!queriesList) return;

    const colItem = document.createElement("li");
    colItem.classList.add("collection-item");
    const header = document.createElement("div");
    header.classList.add("collection-label");
    header.textContent = collection.name;
    header.dataset.collectionId = collection._id;
    header.addEventListener("click", () => {
        currentCollectionId = collection._id;
        document.querySelectorAll('.collection-label').forEach(h => h.classList.remove('selected'));
        header.classList.add('selected');
    });

    const subList = document.createElement("ul");
    subList.classList.add("collection-queries");

    if (Array.isArray(collection.queries)) {
        collection.queries.forEach(q => {
            if (q.name && q._id) {
                addQueryToSidebar(q.name, q._id, formatMethod(q.method), subList, collection._id);
            }
        });
    }

    colItem.appendChild(header);
    colItem.appendChild(subList);
    queriesList.appendChild(colItem);
}

// Função para formatar o método HTTP
function formatMethod(method) {
    if (!method || typeof method !== "string") {
        return "UNKNOWN";
    }
    const methodMap = {
        GET: "GET", POST: "POST", PUT: "PUT",
        DELETE: "DEL", COPY: "COPY", HEAD: "HEAD",
        OPTIONS: "OPT", LINK: "LINK", UNLINK: "UNLK",
        PURGE: "PURG", LOCK: "LOCK", UNLOCK: "UNLK",
        PROPFIND: "PFND", VIEW: "VIEW"
    };
    return methodMap[method.toUpperCase()] || method.toUpperCase();
}

/* ===== Funções para Gerenciamento do Modal ===== */
function openModal(initialValue, onSubmit) {
    const modal = document.getElementById("query-modal");
    const inputField = document.getElementById("query-name-input");
    const oldSubmitBtn = document.getElementById("submit-query-btn");
    const oldCancelBtn = document.getElementById("cancel-query-btn");
    const submitBtn = oldSubmitBtn.cloneNode(true);
    const cancelBtn = oldCancelBtn.cloneNode(true);
    oldSubmitBtn.parentNode.replaceChild(submitBtn, oldSubmitBtn);
    oldCancelBtn.parentNode.replaceChild(cancelBtn, oldCancelBtn);

    modal.classList.remove("hidden");
    inputField.value = initialValue || "";
    inputField.focus();

    inputField.addEventListener("input", () => {
        if (inputField.value.length > 23) {
            inputField.value = inputField.value.slice(0, 23);
        }
    });

    submitBtn.addEventListener("click", async () => {
        const value = inputField.value.trim();
        if (value.length < 3) {
            showFeedbackMessage("Query name must be at least 3 characters!");
            return;
        }
        await onSubmit(value);
        closeModal();
    });

    cancelBtn.addEventListener("click", closeModal);

    const keydownHandler = (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    };
    document.addEventListener("keydown", keydownHandler);
    modal.dataset.keydownHandler = keydownHandler;
}

function closeModal() {
    const modal = document.getElementById("query-modal");
    const inputField = document.getElementById("query-name-input");
    modal.classList.add("hidden");
    inputField.value = "";
    if (modal.dataset.keydownHandler) {
        document.removeEventListener("keydown", modal.dataset.keydownHandler);
        delete modal.dataset.keydownHandler;
    }
}

function showQueryModal() {
    openModal("", async (queryName) => {
        await createQuery(queryName);
    });
}

async function renameQuery(queryId) {
    try {
        const res = await fetch(`/queries/${queryId}`);
        const queryData = await res.json();
        if (queryData.error) {
            showFeedbackMessage(`Error loading query for renaming: ${queryData.error}`);
            return;
        }
        openModal(queryData.name, async (newName) => {
            try {
                const payload = { name: newName };
                const updateRes = await fetch(`/queries/${queryId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!updateRes.ok) {
                    const error = await updateRes.json();
                    showFeedbackMessage(`Error: ${error.message}`);
                    return;
                }
                showFeedbackMessage("Query renamed successfully!");
                await loadAllQueries();
                const selectedItem = document.querySelector(`.query-item[data-query-id="${queryId}"]`);
                if (selectedItem) {
                    await loadQuery(queryId, selectedItem);
                }
            } catch (err) {
                console.error("Error renaming query:", err);
                showFeedbackMessage("An error occurred while renaming the query.");
            }
        });
    } catch (err) {
        console.error("Error loading query for renaming:", err);
        showFeedbackMessage("An error occurred while preparing to rename the query.");
    }
}

async function createQuery(queryName) {
    const queryData = {
        name: queryName,
        protocol: "HTTP",
        method: "GET",
        url: "",
        headers: {},
        body: "",
        bearer_token: "",
        collection_id: currentCollectionId
    };
    try {
        const res = await fetch("/queries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(queryData)
        });
        const data = await res.json();
        if (data.error) {
            showFeedbackMessage(`Error: ${data.error}`);
        } else {
            showFeedbackMessage("Query created successfully!");
            await loadAllQueries();
            if (data.id) {
                const newQueryId = data.id;
                const selectedItem = document.querySelector(`.query-item[data-query-id="${newQueryId}"]`);
                if (selectedItem) {
                    await loadQuery(newQueryId, selectedItem);
                }
            }
        }
    } catch (err) {
        console.error("Error creating new query:", err);
        showFeedbackMessage("An error occurred while creating the query.");
    }
}

document.getElementById("new-blank-query-btn").addEventListener("click", showQueryModal);
document.getElementById("toggle-sidebar-btn").addEventListener("click", () => {
    const sidebar = document.querySelector(".queries-sidebar");
    const toggleContainer = document.querySelector(".toggle-container");
    const isHidden = sidebar.classList.toggle("hidden");
    toggleContainer.style.transform = isHidden ? "rotateY(180deg)" : "translateX(0)";
});

async function createCollection(name) {
    const payload = { name: name, variables: {} };
    const res = await fetch('/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
        showFeedbackMessage(`Error: ${data.error}`);
    } else {
        showFeedbackMessage('Collection created');
        currentCollectionId = data.id;
        await loadAllQueries();
    }
}

document.getElementById('new-collection-btn').addEventListener('click', () => {
    const name = prompt('Collection name');
    if (name) { createCollection(name.trim()); }
});

loadAllQueries();
