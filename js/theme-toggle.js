// theme-toggle.js
// Aplica el tema oscuro automáticamente en toda la web
(function() {
  // Lee el tema guardado en localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Permite escuchar cambios de storage para sincronizar entre pestañas/iframes
  window.addEventListener('storage', function(e) {
    if (e.key === 'theme') {
      if (e.newValue === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  });
})();
