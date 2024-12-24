const defaultHeaders = { "Content-Type": "application/json" };

document.getElementById("execute-query-btn").addEventListener("click", () => {
    const url = document.getElementById("query-url").value;
    const method = document.getElementById("query-method").value;
    const body = document.getElementById("query-body").value;
    const additionalHeaders = JSON.parse(document.getElementById("query-headers").value || "{}");
    const token = document.getElementById("bearer-token").value;

    const headers = { ...defaultHeaders, ...additionalHeaders };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    if (!url) {
        console.error("URL is required");
        document.getElementById("response-output").innerHTML = "<span class='error'>Error: URL is required.</span>";
        return;
    }

    const payload = { url, method, headers, body, bearer_token: token };

    fetch("/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then((res) => res.json())
        .then((data) => {
            const responseContainer = document.getElementById("response-output");
            const headersContainer = document.getElementById("response-headers");

            if (data.error) {
                console.error("Backend Error:", data.error);
                responseContainer.innerHTML = `<span class='error'>Error: ${data.error}</span>`;
                headersContainer.innerHTML = "<span class='error'>No headers available.</span>";
            } else {
                responseContainer.innerHTML = highlightJSON(data.output);
                headersContainer.innerHTML = data.headers
                    .map((header) => `<div class="header-line">${header}</div>`)
                    .join("");
            }
        })
        .catch((err) => {
            console.error("Fetch error:", err);
            document.getElementById("response-output").innerHTML =
                "<span class='error'>An error occurred while executing the request.</span>";
            document.getElementById("response-headers").innerHTML =
                "<span class='error'>No headers available.</span>";
        });
});
