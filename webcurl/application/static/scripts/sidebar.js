// Função para carregar todas as queries do backend
function loadAllQueries() {
    fetch("/queries")
        .then((res) => res.json())
        .then((queries) => {
            const queriesList = document.getElementById("queries-list");
            queriesList.innerHTML = ""; // Limpa a lista antes de preencher
            queries.forEach((query) => {
                addQueryToSidebar(query.name, query._id, formatMethod(query.method));
            });
        })
        .catch((err) => {
            console.error("Error loading queries:", err);
        });
}

// Função para adicionar query na sidebar
function addQueryToSidebar(queryName, queryId, method) {
    const queriesList = document.getElementById("queries-list");
    const newItem = document.createElement("li");

    newItem.innerHTML = `
        <div class="queries-label">
            <span class="queries-method ${method.toLowerCase()}">${method}</span>
            <span class="queries-name">${queryName}</span>
            <span class="menu-button" id="sidebar-item-menu"><i class="bi bi-three-dots-vertical"></i></span>
        </div>
    `;
    newItem.dataset.queryId = queryId;
    newItem.classList.add("query-item");

    // Evento de clique para carregar a query selecionada
    newItem.addEventListener("click", () => {
        loadQuery(queryId, newItem);
    });

    queriesList.appendChild(newItem);
}

// Função para formatar o método para no máximo 4 caracteres
function formatMethod(method) {
    const methodMap = {
        GET: "GET",
        POST: "POST",
        PUT: "PUT",
        DELETE: "DEL",
        COPY: "COPY",
        HEAD: "HEAD",
        OPTIONS: "OPT",
        LINK: "LINK",
        UNLINK: "UNLK",
        PURGE: "PURG",
        LOCK: "LOCK",
        UNLOCK: "UNLK",
        PROPFIND: "PFND",
        VIEW: "VIEW",
    };
    return methodMap[method.toUpperCase()] || method.toUpperCase();
}

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

// Função para carregar dados da query no editor
function loadQuery(queryId, selectedItem) {
    fetch(`/queries/${queryId}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                showFeedbackMessage(`Error loading query: ${data.error}`);
                return;
            }

            // Preencher os campos com os dados da query
            document.getElementById("query-url").value = data.url || "";
            document.getElementById("query-method").value = data.method || "GET";

            // Converter o body para JSON formatado antes de exibir
            document.getElementById("query-body").value = data.body
                ? JSON.stringify(data.body, null, 2)
                : "";

            // Preencher os headers
            setHeadersToTable(data.headers || {});

            document.getElementById("bearer-token").value = data.bearer_token || "";
            protocolBtn.textContent = data.protocol || "HTTP";

            // Atualizar o ID e o nome da query carregada
            currentQueryId = data._id; // Atualiza o ID da query carregada
            currentQueryName = data.name; // Atualiza o nome da query carregada

            console.log(`Query loaded: ${currentQueryName} (${currentQueryId})`);

            // Alterar estilo de seleção
            document.querySelectorAll(".query-item").forEach((item) => {
                item.classList.remove("selected");
            });
            selectedItem.classList.add("selected");
        })
        .catch((err) => {
            console.error("Error loading query:", err);
        });
}

// Função para mostrar o modal de entrada de query
function showQueryModal() {
    const modal = document.getElementById("query-modal");
    const inputField = document.getElementById("query-name-input");
    const submitBtn = document.getElementById("submit-query-btn");
    const cancelBtn = document.getElementById("cancel-query-btn");

    modal.classList.remove("hidden");
    inputField.focus();

    // Limitar entrada no campo de texto
    inputField.addEventListener("input", () => {
        if (inputField.value.length > 23) {
            inputField.value = inputField.value.slice(0, 23);
        }
    });

    // Evento para criar query
    submitBtn.addEventListener("click", () => {
        const queryName = inputField.value.trim();
        if (queryName.length < 3) {
            showFeedbackMessage("Query name must be at least 3 characters!");
            return;
        }

        createQuery(queryName);
        closeModal();
    });

    // Evento para cancelar modal
    cancelBtn.addEventListener("click", closeModal);

    // Evento para fechar modal com tecla ESC
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById("query-modal");
    const inputField = document.getElementById("query-name-input");
    modal.classList.add("hidden");
    inputField.value = ""; // Limpa o campo de entrada
    document.removeEventListener("keydown", closeModal); // Remove o evento ESC
}

// Função para criar uma query
function createQuery(queryName) {
    const queryData = {
        name: queryName,
        protocol: "HTTP",
        method: "GET",
        url: "",
        headers: {},
        body: "",
        bearer_token: ""
    };

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
                loadAllQueries(); // Recarregar o sidebar
            }
        })
        .catch((err) => {
            console.error("Error creating new query:", err);
            showFeedbackMessage("An error occurred while creating the query.");
        });
}

// Alternar visibilidade da barra lateral
const sidebar = document.querySelector(".queries-sidebar");
const toggleContainer = document.querySelector(".toggle-lingueta");

document.getElementById("toggle-sidebar-btn").addEventListener("click", () => {
    if (sidebar.classList.contains("hidden")) {
        sidebar.classList.remove("hidden"); // Expande a barra
        toggleContainer.style.transform = "translateX(0)";
    } else {
        sidebar.classList.add("hidden"); // Minimiza a barra
        toggleContainer.style.transform = "rotateY(180deg)";
    }
});

// Evento para abrir modal
document.getElementById("new-blank-query-btn").addEventListener("click", showQueryModal);

// Carregar queries ao iniciar a página
loadAllQueries();
