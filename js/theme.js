               document.addEventListener('DOMContentLoaded', function () {
                    const themeToggle = document.getElementById('theme-toggle');
                    const themeIcon = themeToggle.querySelector('i');
                    const htmlElement = document.documentElement;

                    // Verificar si hay tema guardado en localStorage
                    const currentTheme = localStorage.getItem('theme');
                    if (currentTheme) {
                        htmlElement.setAttribute('data-theme', currentTheme);
                        updateIcon(currentTheme);
                    }

                    // Función para actualizar el icono
                    function updateIcon(theme) {
                        if (theme === 'dark') {
                            themeIcon.classList.remove('fa-moon');
                            themeIcon.classList.add('fa-sun');
                        } else {
                            themeIcon.classList.remove('fa-sun');
                            themeIcon.classList.add('fa-moon');
                        }
                    }

                    // Event listener para el botón
                    themeToggle.addEventListener('click', function () {
                        const currentTheme = htmlElement.getAttribute('data-theme');
                        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                        // Cambiar tema
                        if (newTheme === 'dark') {
                            htmlElement.setAttribute('data-theme', 'dark');
                        } else {
                            htmlElement.removeAttribute('data-theme');
                        }

                        // Guardar preferencia en localStorage
                        localStorage.setItem('theme', newTheme);

                        // Actualizar icono
                        updateIcon(newTheme);

                        // Animación del botón
                        themeToggle.style.transform = 'rotate(360deg)';
                        setTimeout(() => {
                            themeToggle.style.transform = '';
                        }, 300);
                    });
                });