document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('export-query-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async function () {
            try {
                const res = await fetch("/queries");
                const queries = await res.json();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(queries, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "queries_export.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            } catch (err) {
                console.error("Error exporting queries:", err);
            }
        });
    }
});
