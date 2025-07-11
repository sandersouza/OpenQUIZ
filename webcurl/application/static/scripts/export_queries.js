document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('export-query-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async function () {
            try {
                const res = await fetch("/collections");
                const collections = await res.json();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(collections, null, 2));
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
