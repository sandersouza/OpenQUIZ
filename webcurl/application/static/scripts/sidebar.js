async function loadAllQueries() {
    try {
        const res = await fetch("/queries");
        const queries = await res.json();
        const queriesList = document.getElementById("queries-list");
        queriesList.innerHTML = "";
        queries.forEach((query) => {
            addQueryToSidebar(query.name, query._id, formatMethod(query.method));
        });
    } catch (err) {
        console.error("Error loading queries:", err);
    }
}

async function loadQuery(queryId, selectedItem) {
    try {
        const res = await fetch(`/queries/${queryId}`);
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

        console.log(`Query loaded: ${currentQueryName} (${currentQueryId})`);

        // Atualizar estilo visual para a query selecionada
        document.querySelectorAll(".query-item").forEach((item) => item.classList.remove("selected"));
        selectedItem.classList.add("selected");
    } catch (err) {
        console.error("Error loading query:", err);
    }
}

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

async function duplicateQuery(queryId) {
    try {
        const res = await fetch(`/queries/${queryId}`);
        const originalQuery = await res.json();

        if (originalQuery.error) {
            showFeedbackMessage(`Error loading query for duplication: ${originalQuery.error}`);
            return;
        }

        // Modificar o nome da query para indicar duplicação
        const duplicatedQuery = {
            ...originalQuery,
            name: `${originalQuery.name}`
        };
        delete duplicatedQuery._id; // Remover ID para evitar conflito no banco

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

function addQueryToSidebar(queryName, queryId, method) {
    const queriesList = document.getElementById("queries-list");
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
    newItem.classList.add("query-item");
    queriesList.appendChild(newItem);

    const menuButton = newItem.querySelector("#sidebar-item-menu");
    const menuOptions = newItem.querySelector(".menu-options");

    menuButton.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".menu-options.visible").forEach((menu) => {
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

function formatMethod(method) {
    if (!method || typeof method !== "string") {
        return "UNKNOWN"; // Valor padrão se o campo `method` estiver ausente ou inválido
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

async function renameQuery(queryId) {
    try {
        // Exibir o modal com o nome atual da query
        const modal = document.getElementById("query-modal");
        const inputField = document.getElementById("query-name-input");
        const submitBtn = document.getElementById("submit-query-btn");
        const cancelBtn = document.getElementById("cancel-query-btn");

        // Buscar o nome atual da query no banco
        const res = await fetch(`/queries/${queryId}`);
        const queryData = await res.json();

        if (queryData.error) {
            showFeedbackMessage(`Error loading query for renaming: ${queryData.error}`);
            return;
        }

        modal.classList.remove("hidden");
        inputField.value = queryData.name;

        // Função para salvar a alteração
        const handleRename = async () => {
            const newName = inputField.value.trim();
            if (newName.length < 3) {
                showFeedbackMessage("Query name must be at least 3 characters!");
                return;
            }

            try {
                const payload = { name: newName }; // Apenas o campo `name`
                const updateRes = await fetch(`/queries/${queryId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload), // Enviar o payload correto
                });

                if (!updateRes.ok) {
                    const error = await updateRes.json();
                    showFeedbackMessage(`Error: ${error.message}`);
                    return;
                }

                showFeedbackMessage("Query renamed successfully!");
                loadAllQueries(); // Atualizar a sidebar
                closeModal();
            } catch (err) {
                console.error("Error renaming query:", err);
                showFeedbackMessage("An error occurred while renaming the query.");
            }
        };

        // Associar eventos ao modal
        submitBtn.onclick = handleRename;
        cancelBtn.onclick = closeModal;

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        });
    } catch (err) {
        console.error("Error loading query for renaming:", err);
        showFeedbackMessage("An error occurred while preparing to rename the query.");
    }
}

function showQueryModal() {
    const modal = document.getElementById("query-modal");
    const inputField = document.getElementById("query-name-input");
    const submitBtn = document.getElementById("submit-query-btn");
    const cancelBtn = document.getElementById("cancel-query-btn");
    modal.classList.remove("hidden");
    inputField.focus();
    inputField.addEventListener("input", () => {
        if (inputField.value.length > 23) {
            inputField.value = inputField.value.slice(0, 23);
        }
    });
    submitBtn.addEventListener("click", () => {
        const queryName = inputField.value.trim();
        if (queryName.length < 3) {
            showFeedbackMessage("Query name must be at least 3 characters!");
            return;
        }
        createQuery(queryName);
        closeModal();
    });
    cancelBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById("query-modal");
    const inputField = document.getElementById("query-name-input");
    modal.classList.add("hidden");
    inputField.value = "";
    document.removeEventListener("keydown", closeModal);
}

async function createQuery(queryName) {
    const queryData = {
        name: queryName,
        protocol: "HTTP",
        method: "GET",
        url: "",
        headers: {},
        body: "",
        bearer_token: ""
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
            loadAllQueries();
        }
    } catch (err) {
        console.error("Error creating new query:", err);
        showFeedbackMessage("An error occurred while creating the query.");
    }
}

document.getElementById("new-blank-query-btn").addEventListener("click", showQueryModal);
document.getElementById("toggle-sidebar-btn").addEventListener("click", () => {
    const isHidden = sidebar.classList.toggle("hidden");
    toggleContainer.style.transform = isHidden ? "rotateY(180deg)" : "translateX(0)";
});

loadAllQueries();
