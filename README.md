# 🏛️ Casa de la Pólvora - Sitio Web

Sitio web oficial de la Casa de la Pólvora, un espacio cultural dedicado a rescatar la memoria histórica de la comunidad y ofrecer actividades artísticas, talleres y propuestas culturales para todas las edades.

## 📋 Descripción

Este proyecto es un sitio web responsive diseñado para promover las actividades culturales de la Casa de la Pólvora. El sitio presenta información sobre eventos, el espacio cultural, galería de imágenes, colaboradores y opciones de contacto.

## ✨ Características

- **Diseño Responsive**: Adaptado para dispositivos móviles, tablets y escritorio
- **Navegación intuitiva**: Menú de navegación fijo con scroll suave a secciones
- **Carrusel de eventos**: Slider de imágenes destacadas en la página principal
- **Secciones principales**:
  - 🏠 **Inicio**: Carrusel con eventos destacados
  - 📅 **Agenda**: Próximos eventos y actividades
  - 🏛️ **El Espacio**: Información sobre la Casa de la Pólvora
  - 🖼️ **Galería**: Imágenes del espacio y eventos
  - 🤝 **Colaboradores**: Organizaciones y personas colaboradoras
  - 📞 **Contacto**: Múltiples opciones de comunicación

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica del sitio
- **CSS3**: Estilos personalizados con variables y diseño moderno
- **Bootstrap 5.3.3**: Framework CSS para componentes y grid system
- **Font Awesome 6.4.2**: Iconos para redes sociales y elementos visuales
- **JavaScript**: Bootstrap Bundle para interactividad

## 📁 Estructura del Proyecto

```
proto-casa-polvora/
│
├── index.html              # Página principal
├── README.md              # Documentación del proyecto
├── LICENSE                # Licencia del proyecto
│
├── css/
│   ├── styles.css         # Estilos principales
│   └── responsive.css     # Estilos responsive (mobile-first)
│
├── img/
│   ├── banner-prov-1.png  # Banner para carrusel
│   ├── banner-prov.png    # Banner alternativo
│   ├── POLVORA-1.webp     # Imagen de eventos
│   ├── POLVORA-2.jpg      # Imagen del espacio
│   └── logos/
│       ├── asoc-logo.jpg           # Logo Asociación de Amigos
│       ├── circ-logo-cp.png        # Logo circular
│       ├── large-logo.png          # Logo principal grande
│       └── polvora-logo-sf.png     # Logo sin fondo
│
└── js/                    # Directorio para scripts (vacío actualmente)
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

### Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/wjunes/proto-casa-polvora.git
```

2. Navega al directorio del proyecto:

```bash
cd proto-casa-polvora
```

3. Abre el archivo `index.html` en tu navegador:
   - Doble clic en el archivo
   - O arrastra el archivo al navegador
   - O usa un servidor local (recomendado):

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server
```

4. Accede a `http://localhost:8000` en tu navegador

## 🔧 Personalización

### Cambiar Colores

Edita las variables de color en `css/styles.css`:

```css
/* Colores principales */
#b7410e  /* Color de títulos */
#f06529  /* Color de botones y acentos */
#f5f0e6  /* Color de fondo */
#2c2c2c  /* Color de texto */
```

### Agregar Eventos

Modifica la sección de Agenda en `index.html`:

```html
<div class="col-md-4">
  <div class="card">
    <img src="img/tu-imagen.jpg" class="card-img-top" alt="Tu evento" />
    <div class="card-body">
      <h5 class="card-title">Nombre del Evento</h5>
      <p class="card-text">Fecha y hora</p>
      <a href="#" class="btn">Más info</a>
    </div>
  </div>
</div>
```

### Actualizar Información de Contacto

En la sección de contacto, modifica los enlaces:

```html
<a href="mailto:tu-email@ejemplo.com" class="btn btn-primary">Enviar email</a>
<a href="tel:+598XXXXXXXX" class="btn btn-secondary">Llamar</a>
<a
  href="https://api.whatsapp.com/send?phone=598XXXXXXXX"
  class="btn btn-success"
  >WhatsApp</a
>
```

## 📝 Secciones del Sitio

### Header

- Navegación fija con scroll suave
- Logos de Casa de la Pólvora y Asociación de Amigos
- Menú hamburguesa en móviles

### Hero / Carrusel

- Slider automático con eventos destacados
- Botones de navegación
- Llamadas a la acción

### Agenda

- Cards con próximos eventos
- Imágenes, títulos, fechas y enlaces
- Grid responsive de 3 columnas

### El Espacio

- Descripción de la Casa de la Pólvora
- Imagen representativa
- Botón de más información

### Galería

- Grid de imágenes responsive
- 3 columnas en desktop, 2 en móvil

### Colaboradores

- Muestra organizaciones asociadas
- Similar a la sección de Agenda

### Contacto

- Email, teléfono y WhatsApp
- Botones coloridos y accesibles

### Footer

- Redes sociales (Facebook, Instagram, YouTube)
- Logos institucionales
- Información de ubicación

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

- **wjunes** - _Desarrollo inicial_ - [GitHub](https://github.com/wjunes)

## 📞 Contacto

Para más información sobre la Casa de la Pólvora:

- 📧 Email: info@casadelapolvora.uy
- 📱 WhatsApp: +598 00000000
- 🌐 Sitio Web: [En construcción]

---

**Casa de la Pólvora** - Rescatando la memoria histórica de nuestra comunidad 🏛️

Prototipo inicial de proyecto de aplicación web para Casa de la pólvora.
