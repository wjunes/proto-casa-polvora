# Polvorina — Backend (instrucciones de despliegue para cPanel)

Este README contiene los pasos mínimos para desplegar la aplicación en cPanel (Node.js App)

Rutas y datos que me pasaste:

- Código en cPanel: /home/user/algoritmos.uy (raíz del proyecto)
- Root del server (backend): /home/user/algoritmia.uy/backend
- Dominio: https://algoritmia.uy
- App startup: server.js
- Variables de entorno: se configuran desde el panel "Node.js App" en cPanel

Requisitos

- Node.js (versión >= 18 recomendable)
- En cPanel, crea una aplicación Node.js y apunta el "Application Root" al directorio `backend`.
- El "Application startup file" debe ser `server.js`.

Variables de entorno (mínimas)

- DEEPSEEK_API_KEY (obligatorio si quieres usar el proveedor upstream)
- DEEPSEEK_MODEL (obligatorio si usas upstream; ejemplo: `deepseek-chat-4`)
- DEEPSEEK_API_URL (opcional, si tu proveedor requiere una URL distinta)
- PORT (normalmente cPanel gestiona el puerto; no es necesario fijarlo manualmente)
- SERVE_STATIC (opcional) — si la pones a `1`, el servidor Node servirá los archivos
  estáticos (index.html, css, js, img) desde la carpeta padre de `backend`.
  Esto es útil si quieres que Node entregue tanto frontend como backend desde la
  misma app. Por defecto está en `0`.

Pasos de despliegue (resumen)

1. Subir todo el contenido del repositorio a `/home/user/algoritmos.uy` (o la
   ruta que uses).
2. En cPanel -> Node.js App: crea una nueva app o selecciona una existente.
   - Application root: `/home/user/algoritmia.uy/backend` (verifica la ruta exacta)
   - Application startup file: `server.js`
   - Environment variables: pega las variables listadas arriba en el panel.
3. Instalación de dependencias: en cPanel hay una opción para ejecutar `npm install`
   o puedes usar SSH y ejecutar `npm install` dentro de `/home/user/.../backend`.
4. Si prefieres que Node sirva los archivos estáticos (frontend + backend juntos):
   - En el panel de variables de entorno añade `SERVE_STATIC=1` y reinicia la aplicación.
   - Con ello el servidor servirá `index.html` en `/` y los recursos estáticos.
5. Si prefieres servir el frontend con Apache/NGINX y solo exponer la API:
   - No pongas `SERVE_STATIC` o déjalo en `0`.
   - Configura el servidor web para servir la carpeta raíz como sitio público y
     asegúrate de que las llamadas al API apunten a `https://algoritmia.uy/api/chat`.

Notas útiles

- Asegúrate de no subir archivos con secretos (`.env`) al repositorio público.
- El archivo `backend/.env.example` contiene un ejemplo de las variables pero sin
  valores. Copia y modifica a `backend/.env` si quieres ejecutar localmente.
- `server.js` ya tiene soporte para simular respuestas (modo mock) si la API key
  o el upstream no están configurados correctamente; esto facilita pruebas locales.

Verificación local rápida

- Desde la raíz del repo, instala dependencias en `backend`:
  ```powershell
  npm install --prefix .\backend
  ```
- Arrancar backend local:
  ```powershell
  node .\backend\server.js
  ```
- (Opcional) Servir frontend con Python HTTP server desde la raíz:
  ```powershell
  python -m http.server 8080
  ```
  Abrir http://localhost:8080 y probar el launcher de Polvorina.

Si quieres, puedo preparar un ZIP listo para subir a cPanel o ajustar el README
con comandos más específicos según la versión exacta de Node que tengas en cPanel.
