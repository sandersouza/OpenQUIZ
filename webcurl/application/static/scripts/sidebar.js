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
    newItem.addEventListener("click", () => loadQuery(queryId, newItem));
    queriesList.appendChild(newItem);
}

function formatMethod(method) {
    const methodMap = {
        GET: "GET", POST: "POST", PUT: "PUT",
        DELETE: "DEL", COPY: "COPY", HEAD: "HEAD",
        OPTIONS: "OPT", LINK: "LINK", UNLINK: "UNLK",
        PURGE: "PURG", LOCK: "LOCK", UNLOCK: "UNLK",
        PROPFIND: "PFND", VIEW: "VIEW"
    };
    return methodMap[method.toUpperCase()] || method.toUpperCase();
}

function showFeedbackMessage(message) {
    const feedbackElement = document.getElementById("feedback-message");
    feedbackElement.textContent = message;
    feedbackElement.classList.toggle("hidden", false);
    feedbackElement.classList.toggle("visible", true);
    setTimeout(() => {
        feedbackElement.classList.toggle("visible", false);
        feedbackElement.classList.toggle("hidden", true);
    }, 2000);
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
        document.querySelectorAll(".query-item").forEach((item) => item.classList.remove("selected"));
        selectedItem.classList.add("selected");
    } catch (err) {
        console.error("Error loading query:", err);
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
