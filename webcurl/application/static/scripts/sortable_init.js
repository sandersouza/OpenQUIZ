document.addEventListener('DOMContentLoaded', function () {
    const el = document.getElementById('queries-list');
    if (el) {
        Sortable.create(el, {
            animation: 150,
            onEnd: function (evt) {
                console.log('Item moved to index:', evt.newIndex);
                // Aqui você pode capturar a nova ordem e enviar para o backend, se necessário.
            }
        });
    }
});
