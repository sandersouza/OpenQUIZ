// Carregar todas as queries do backend
function loadAllQueries() {
    fetch("/queries")
        .then((res) => res.json())
        .then((queries) => {
            const queriesList = document.getElementById("queries-list");
            queriesList.innerHTML = ""; // Limpa a lista antes de preencher
            queries.forEach((query) => {
                addQueryToSidebar(query.name, query._id, query.method);
            });
        })
        .catch((err) => {
            console.error("Error loading queries:", err);
        });
}

// Adicionar query na sidebar
function addQueryToSidebar(queryName, queryId, method) {
    const queriesList = document.getElementById("queries-list");
    const newItem = document.createElement("li");

    newItem.innerHTML = `
        <div class="queries-label">
            <span class="queries-method">[${method}]</span>&nbsp;${queryName}
        </div>
    `;
    newItem.dataset.queryId = queryId;
    newItem.classList.add("query-item");

    // Evento de clique para carregar a query selecionada
    newItem.addEventListener("click", () => loadQuery(queryId, newItem));

    queriesList.appendChild(newItem);
}

// Exibir mensagem de feedback
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

// Carregar dados da query no editor
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
            document.getElementById("query-body").value = data.body || "";
            document.getElementById("query-headers").value = Object.entries(data.headers || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n");
            document.getElementById("bearer-token").value = data.bearer_token || "";
            protocolBtn.textContent = data.protocol || "HTTP";

            // Atualizar o ID e o nome da query carregada
            currentQueryId = data._id; // Atualiza o ID da query carregada
            currentQueryName = data.name; // Atualiza o nome da query carregada

            console.log(`Query loaded: ${currentQueryName} (${currentQueryId})`);

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

// Alternar visibilidade da barra lateral
const sidebar = document.querySelector(".queries-sidebar");
const toggleBtn = document.getElementById("toggle-sidebar-btn");

toggleBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("hidden")) {
        sidebar.classList.remove("hidden"); // Expande a barra
        toggleBtn.textContent = "⮘"; // Ícone para ocultar
    } else {
        sidebar.classList.add("hidden"); // Minimiza a barra
        toggleBtn.textContent = "⮚"; // Ícone para exibir
    }
});

// Evento para criar uma nova query em branco com nome personalizado
document.getElementById("new-blank-query-btn").addEventListener("click", () => {
    const queryName = prompt("Enter a name for the new query:");
    if (!queryName || queryName.trim() === "") {
        showFeedbackMessage("Query name is required!");
        return;
    }

    const queryData = {
        name: queryName.trim(),
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
});

// Carregar queries ao iniciar a página
loadAllQueries();
