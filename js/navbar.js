        document.addEventListener('DOMContentLoaded', function () {
            // Seleccionar todos los enlaces del menú de navegación
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
            const navbarCollapse = document.getElementById('menu');

            // Agregar evento click a cada enlace
            navLinks.forEach(link => {
                link.addEventListener('click', function () {
                    // Verificar si el menú está expandido (visible en móvil)
                    if (navbarCollapse.classList.contains('show')) {
                        // Crear instancia de Bootstrap Collapse y cerrar el menú
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                            toggle: false
                        });
                        bsCollapse.hide();
                    }
                });
            });
        });