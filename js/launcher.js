// Launcher behavior: prefer modal iframe if present, fallback to opening a new tab.
(function (){
    var btn = document.getElementById('polvorina-launcher-btn');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
        // If a Bootstrap modal + iframe exists we use it (lazy-load iframe src).
        var modalEl = document.getElementById('polvorinaModal');
        var iframe = document.getElementById('polvorina-iframe');
        if (modalEl && iframe && typeof bootstrap !== 'undefined') {
            try {
                var bsModal = new bootstrap.Modal(modalEl, { focus: true });
                if (!iframe.getAttribute('src') || iframe.getAttribute('src') === '') {
                    // Pass the backend URL as a query parameter so the iframe can call the correct API
                    var backend = (window.POLVORINA_API_URL) ? window.POLVORINA_API_URL : 'http://localhost:3000/api/chat';
                    var src = 'pages/chat-bot/polvorina.html';
                    // Only append param if it's not the default relative path
                    src += '?api=' + encodeURIComponent(backend);
                    iframe.setAttribute('src', src);
                }
                bsModal.show();
                return;
            } catch (err) {
                // ignore and fallback to opening a new tab
                console.warn('Polvorina modal open failed, falling back to new tab', err);
            }
        }

        // Si no hay modal o ocurre un error, no abrimos pestañas nuevas automáticamente.
        // Simplemente avisamos en la consola para evitar comportamiento inesperado.
        console.warn('Polvorina modal no disponible y no se abrirá nueva pestaña de forma automática.');
    });
})();