# 🏛️ Casa de la Pólvora - Sitio Web

Sitio web oficial de la Casa de la Pólvora, un espacio cultural dedicado a rescatar la memoria histórica de la comunidad y ofrecer actividades artísticas, talleres y propuestas culturales para todas las edades.

## 📋 Descripción

Este proyecto es un sitio web responsive diseñado para promover las actividades culturales de la Casa de la Pólvora. El sitio presenta información sobre eventos, el espacio cultural, galería de imágenes, colaboradores y múltiples opciones de contacto con integración de mapas.

## ✨ Características

- **Diseño Responsive**: Adaptado para dispositivos móviles, tablets y escritorio
- **Navegación intuitiva**: Menú de navegación fijo con scroll suave a secciones
- **Menú hamburguesa optimizado**: Funcionamiento correcto en dispositivos móviles con fondo oscuro
- **Carrusel de eventos**: Slider automático con eventos destacados en la página principal
- **Iconografía moderna**: Iconos Font Awesome en botones y enlaces para mejor UX
- **Modal de ubicación**: Mapa interactivo de Google Maps integrado
- **Secciones principales**:
  - 🏠 **Inicio**: Carrusel con eventos destacados
  - 📅 **Agenda**: Próximos eventos y actividades
  - 🏛️ **El Espacio**: Información sobre la Casa de la Pólvora
  - 🖼️ **Galería**: Imágenes del espacio y eventos
  - 👥 **Amigos**: Asociación de Amigos de la Casa de la Pólvora
  - 🤝 **Colaboradores**: Organizaciones y personas colaboradoras
  - 📞 **Contacto**: Email, teléfono, WhatsApp y ubicación con mapa

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica del sitio
- **CSS3**: Estilos personalizados con variables y diseño moderno
- **Bootstrap 5.3.3**: Framework CSS para componentes, grid system y modales
- **Font Awesome 6.4.2**: Iconos para redes sociales, botones y elementos visuales
- **JavaScript**: Bootstrap Bundle para interactividad y componentes dinámicos
- **Google Maps Embed API**: Integración de mapas para ubicación

## 📁 Estructura del Proyecto


```
proto-casa-polvora/
│
├── index.html              # Página principal (con launcher de Polvorina)
├── README.md               # Documentación del proyecto
├── LICENSE                 # Licencia del proyecto
│
├── css/
│   ├── styles.css          # Estilos principales
│   ├── responsive.css      # Estilos responsive (mobile-first)
│   └── launcher.css        # Estilos del launcher y modal de Polvorina
│
├── img/
│   ├── ...
│
├── js/
│   ├── launcher.js         # Lógica de apertura/cierre del modal Polvorina
│   └── ...
│
├── pages/
│   └── chat-bot/
│       ├── polvorina.html      # UI del chat embebido (iframe)
│       ├── chatbot.css         # Estilos del chat Polvorina
│       ├── polvorina.js        # Lógica de UI y streaming del chat
│       ├── polvorina-api.js    # API client para backend/chat
│       ├── PROMPT-BOT.md       # Prompt base (personalidad y reglas)
│       └── faqs.json           # Preguntas frecuentes para grounding
│
├── server.js               # Servidor Node.js (proxy seguro para chat)
├── package.json            # Dependencias backend
├── .env                    # Variables de entorno (API key, modelo)
└── ...
```

## 🎨 Paleta de Colores

El sitio utiliza una paleta de colores cálida y cultural:

- **Principal**: `#f06529` (Naranja terracota)
- **Secundario**: `#b7410e` (Marrón rojizo)
- **Fondo**: `#f5f0e6` (Beige claro)
- **Texto**: `#2c2c2c` (Gris oscuro)
- **Header/Footer**: `#2f2f2f` (Gris carbón)

## 📱 Diseño Responsive

### Breakpoints

- **Mobile**: 320px - 1200px

  - Oculta logos del header
  - Muestra sección de identidad con logos
  - Ajusta tamaño de carrusel
  - Botones de contacto en columna
  - Simplifica footer

- **Desktop**: 1201px en adelante
  - Logos fijos en header
  - Oculta sección de identidad
  - Footer completo con logos

## 🚀 Instalación y Uso

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para CDN de Bootstrap y Font Awesome)

## 📝 Secciones del Sitio

### Header

- Navegación fija con scroll suave
- Logos de Casa de la Pólvora y Asociación de Amigos
- Menú hamburguesa responsive en móviles con fondo oscuro optimizado
- z-index correctamente configurado para superposición de elementos

### Hero / Carrusel

- Slider automático con eventos destacados
- Botones de navegación anterior/siguiente
- Llamadas a la acción con enlaces
- Formato responsive con altura ajustable

### Agenda

- Cards con próximos eventos
- Imágenes, títulos, fechas y enlaces
- Grid responsive de 3 columnas en desktop, 1 columna en móvil
- Botones con estilos personalizados

### El Espacio

- Descripción de la Casa de la Pólvora
- Imagen representativa del edificio histórico
- Layout de 2 columnas responsive
- Botón de más información

### Galería

- Grid de imágenes responsive
- 3 columnas en desktop, 2 columnas en móvil
- Imágenes optimizadas con formato WebP

### Amigos

- Sección dedicada a la Asociación de Amigos
- Cards informativos
- Grid de 3 columnas responsive

### Colaboradores

- Muestra organizaciones colaboradoras
- Formato de cards similar a la sección de Agenda
- Enlaces a más información

### Contacto

- **Email**: Botón con icono de sobre para enviar correo
- **Teléfono**: Botón con icono de teléfono para llamadas directas
- **WhatsApp**: Botón verde con icono de WhatsApp (apertura en nueva pestaña)
- **Cómo llegar**: Modal con mapa de Google Maps embebido
  - Dirección completa
  - Mapa interactivo responsive (ratio 16:9)
  - Botón para abrir en Google Maps
- Botones con iconos Font Awesome para mejor UX
- Layout responsive en columna para móviles

### Footer

- Logos institucionales (Asociación de Amigos y Casa de la Pólvora)
- Dirección física: Bulgaria esq Pasaje de la Pólvora, Montevideo, Uruguay
- Enlaces a redes sociales (Facebook, Instagram, YouTube) con iconos
- Copyright con símbolo ©
- Créditos de desarrollo
- Enlace a Algoritmos.uy con estilos optimizados
- Diseño responsive con elementos que se ocultan en móviles

## 🆕 Últimas Actualizaciones

### Versión 2.0 (Marzo 2026)

#### 🧠 Integración de Asistente Virtual "Polvorina"

- 🚀 **Asistente cultural Polvorina**: Chatbot accesible desde cualquier página mediante un botón flotante (launcher) y modal embebido.
- 💬 **Interfaz de chat moderna**: UI responsive, con soporte para tema claro/oscuro, spinner de carga, envío con Enter, y burbuja de ayuda en móviles.
- 🔒 **Backend seguro**: Proxy Node.js/Express que protege la API key y permite desarrollo local sin exponer secretos.
- 🔗 **Streaming de respuestas**: Soporte para respuestas en tiempo real (simulado si el proveedor no soporta streaming nativo).
- 📚 **RAG/FAQs**: El bot utiliza un prompt base y recupera automáticamente respuestas relevantes de un archivo de preguntas frecuentes (`faqs.json`).
- 🌓 **Soporte de tema claro/oscuro**: El launcher, el modal y el chat se adaptan automáticamente al modo de color del sitio.
- 🛡️ **Fallback local**: Si la API upstream no responde, el bot puede simular respuestas para desarrollo offline.
- 🧩 **Integración no invasiva**: Todo el código del bot está bajo `pages/chat-bot/` y los cambios en `index.html` son mínimos.

#### Cómo usar Polvorina en desarrollo

1. Instala dependencias backend:
  ```bash
  npm install
  ```
2. Crea un archivo `.env` en la raíz con:
  ```env
  DEEPSEEK_API_KEY=tu_api_key
  DEEPSEEK_MODEL=deepseek-chat
  # Opcional:
  # DEEPSEEK_TEMPERATURE=0.7
  # DEEPSEEK_MAX_TOKENS=1024
  ```
3. Inicia el servidor backend:
  ```bash
  npm start
  # o
  node server.js
  ```
4. Abre `index.html` en tu navegador. El botón de Polvorina aparecerá en la esquina inferior derecha.

#### Endpoints disponibles

- `POST /api/chat` — Respuesta completa (JSON)
- `POST /api/chat/stream` — Respuesta en streaming (texto plano, chunked)

#### Personalización

- Modifica `pages/chat-bot/PROMPT-BOT.md` para cambiar la personalidad y reglas del bot.
- Agrega o edita preguntas en `pages/chat-bot/faqs.json` para mejorar el grounding de respuestas.

---

### Versión 1.1 (Noviembre 2025)

#### Mejoras de UX/UI

- ✅ Iconos agregados a todos los botones de contacto
- ✅ Modal de ubicación con Google Maps integrado
- ✅ Botón "Cómo llegar" con mapa interactivo
- ✅ Mejora en estilos de enlaces del footer con `!important` para sobrescribir Bootstrap
- ✅ Transiciones suaves en hover de enlaces

#### Correcciones Técnicas

- ✅ Fix del menú hamburguesa en móviles (fondo negro funcionando correctamente)
- ✅ z-index optimizado para superposición correcta de elementos
- ✅ Estilos CSS específicos para el menú colapsado en pantallas pequeñas
- ✅ Mejora en `text-decoration` de enlaces con mayor especificidad

#### Contenido

- ✅ Sección "Amigos" agregada al menú de navegación
- ✅ Dirección actualizada en footer
- ✅ Enlaces reales a redes sociales
- ✅ Información de contacto actualizada (info@casadelapolvora.uy)

### Versión 1.0 (Inicial)

- Estructura base del sitio web
- Diseño responsive
- Secciones principales implementadas
- Integración de Bootstrap y Font Awesome

## 🌐 Navegadores Compatibles

- ✅ Chrome (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)
- ✅ Safari (últimas 2 versiones)
- ✅ Edge (últimas 2 versiones)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu función (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia especificada en el archivo [LICENSE](LICENSE).

## 👥 Autores

- **Willans Junes** - _Desarrollo Web_ - [GitHub](https://github.com/wjunes) | [Algoritmos.uy](https://algoritmos.uy)

## 📞 Contacto

Para más información sobre la Casa de la Pólvora:

- 📧 Email: <info@casadelapolvora.uy>
- 📱 WhatsApp: +598 91 941 935
- 📍 Dirección: Bulgaria esq Pasaje de la Pólvora, Montevideo, Uruguay
- 🌐 Redes Sociales:
  - [Facebook](https://www.facebook.com/profile.php?id=100069845740620)
  - [Instagram](https://www.instagram.com/casadelapolvorauruguay)
  - [YouTube](https://www.youtube.com/@casadelapolvorauruguay)

---

**Casa de la Pólvora** - Rescatando la memoria histórica de nuestra comunidad 🏛️

Prototipo de aplicación web desarrollado con ❤️ para la Casa de la Pólvora_
