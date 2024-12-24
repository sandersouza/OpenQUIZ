function loadAllQueries() {
    fetch("/queries")
        .then((res) => res.json())
        .then((queries) => {
            queries.forEach((query) => {
                addQueryToSidebar(query.name, query._id, query.method);
            });
        })
        .catch((err) => {
            console.error("Error loading queries:", err);
        });
}

document.getElementById("new-query-btn").addEventListener("click", () => {
    const queryName = prompt("Enter a name for the new query:");
    if (!queryName) {
        alert("Query name is required!");
        return;
    }

    const queryData = { name: queryName, method: "GET", url: "", headers: {}, body: "" };

    fetch("/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryData)
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                alert("Query created successfully!");
                addQueryToSidebar(queryName, data.id, "GET");
            }
        })
        .catch((err) => {
            console.error("Error saving query:", err);
        });
});

function addQueryToSidebar(queryName, queryId, method) {
    const queriesList = document.getElementById("queries-list");
    const newItem = document.createElement("li");
    newItem.innerHTML = `<strong>[ ${method} ]</strong> ${queryName}`;
    newItem.dataset.queryId = queryId;
    newItem.classList.add("query-item");

    // Eventos de mouseover e mouseout para trocar cor
    newItem.addEventListener("mouseover", () => {
        if (!newItem.classList.contains("selected")) {
            newItem.style.backgroundColor = "#1E1E1E"; // Cor ao passar o mouse
        }
    });
    newItem.addEventListener("mouseout", () => {
        if (!newItem.classList.contains("selected")) {
            newItem.style.backgroundColor = ""; // Remove a cor ao retirar o mouse
        }
    });

    // Evento de clique para carregar a query selecionada
    newItem.addEventListener("click", () => loadQuery(queryId, newItem));

    queriesList.appendChild(newItem);
}

function loadQuery(queryId, selectedItem) {
    fetch(`/queries/${queryId}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                alert(`Error loading query: ${data.error}`);
                return;
            }

            // Preencher os campos com os dados da query
            document.getElementById("query-url").value = data.url || "";
            document.getElementById("query-method").value = data.method || "GET";
            document.getElementById("query-body").value = data.body || "";
            document.getElementById("query-headers").value = JSON.stringify(data.headers || {}, null, 2);
            document.getElementById("bearer-token").value = data.bearer_token || "";

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

// Ocultar barra lateral
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

loadAllQueries();
