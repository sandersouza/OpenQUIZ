document.addEventListener('DOMContentLoaded', function () {
    const importBtn = document.getElementById('import-query-btn');
    if (importBtn) {
        // Cria um input do tipo file de forma dinâmica (e oculta-o)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        importBtn.addEventListener('click', function () {
            fileInput.click();
        });

        fileInput.addEventListener('change', async function (event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async function (e) {
                try {
                    const text = e.target.result;
                    const data = JSON.parse(text);
                    if (Array.isArray(data) && data.length && data[0].queries) {
                        for (let col of data) {
                            const colPayload = { name: col.name, variables: col.variables || {} };
                            const colRes = await fetch('/collections', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(colPayload)
                            });
                            const colData = await colRes.json();
                            const colId = colData.id;
                            if (Array.isArray(col.queries)) {
                                for (let query of col.queries) {
                                    if (query._id) delete query._id;
                                    query.collection_id = colId;
                                    const res = await fetch('/queries', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(query)
                                    });
                                    if (!res.ok) {
                                        const error = await res.json();
                                        console.error("Erro ao importar query:", error.message);
                                    }
                                }
                            }
                        }
                    } else if (Array.isArray(data)) {
                        for (let query of data) {
                            if (query._id) { delete query._id; }
                            const res = await fetch('/queries', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(query)
                            });
                            if (!res.ok) {
                                const error = await res.json();
                                console.error("Erro ao importar query:", error.message);
                            }
                        }
                    } else {
                        alert('Formato de arquivo inválido.');
                        return;
                    }
                    alert("Queries importadas com sucesso!");
                    // Atualiza a sidebar (se loadAllQueries estiver disponível globalmente)
                    if (typeof loadAllQueries === 'function') {
                        loadAllQueries();
                    }
                } catch (err) {
                    console.error("Erro ao processar o arquivo importado:", err);
                    alert("Erro ao importar as queries. Verifique se o arquivo está correto.");
                }
            };
            reader.readAsText(file);
        });
    }
});
