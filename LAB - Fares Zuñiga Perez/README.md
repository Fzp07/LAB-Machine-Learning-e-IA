# 🤖 Sistema de Inscripción — Curso de Inteligencia Artificial

Sistema web completo para gestionar inscripciones a un curso de Inteligencia Artificial. Incluye formulario de registro, autenticación de usuarios, panel de administración y envío automático de correos electrónicos de aceptación.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Flujo de la Aplicación](#-flujo-de-la-aplicación)
- [Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)
- [Páginas y Funcionalidades](#-páginas-y-funcionalidades)
- [Backend — server.py](#-backend--serverpy)
- [API — Endpoints Disponibles](#-api--endpoints-disponibles)
- [Archivos de Datos](#-archivos-de-datos)
- [Configuración del Correo Electrónico](#-configuración-del-correo-electrónico)
- [Diseño y Estilos](#-diseño-y-estilos)
- [Credenciales de Acceso](#-credenciales-de-acceso)
- [Base de Datos SQL (Referencia)](#-base-de-datos-sql-referencia)

---

## 📖 Descripción General

Esta aplicación permite:

1. **Estudiantes** → Registrar una cuenta, iniciar sesión y completar el formulario de inscripción al curso.
2. **Administrador** → Ver todos los inscritos, aceptar o eliminar estudiantes. Al aceptar, se envía automáticamente un correo electrónico de confirmación al estudiante.

El diseño sigue una estética **cyberpunk / IA** con fondo oscuro, partículas animadas en canvas, efecto glassmorphism y animaciones glitch en los títulos.

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| Backend | Python 3 — `http.server`, `smtplib` |
| Almacenamiento | Archivos JSON (`estudiantes.json`, `usuarios.json`) |
| Fuentes | Google Fonts — [Outfit](https://fonts.google.com/specimen/Outfit) |
| Correo | Gmail SMTP con Contraseña de Aplicación |
| Animaciones | Canvas API (partículas neurales), CSS keyframes |

---

## 📁 Estructura del Proyecto

```
LAB - Fares Zuñiga Perez/
│
├── index.html          # Formulario de inscripción (vista del estudiante)
├── login.html          # Página de inicio de sesión
├── registro.html       # Página de creación de cuenta
├── admin.html          # Panel de administración
│
├── script.js           # Lógica del formulario de inscripción
├── login.js            # Lógica del login + animación de partículas
├── registro.js         # Lógica del registro de usuarios
├── admin.js            # Lógica del panel admin (cargar, aceptar, eliminar)
│
├── style.css           # Estilos globales (diseño IA/cyberpunk)
│
├── server.py           # Servidor backend en Python (HTTP + SMTP)
├── guardar.php         # Archivo PHP de referencia (no activo)
│
├── estudiantes.json    # Base de datos de inscripciones al curso
├── inscritos.json      # Archivo alternativo de inscritos
├── usuarios.json       # Base de datos de cuentas de usuario
│
└── database.sql        # Script SQL de referencia (estructura de tabla)
```

---

## 🔄 Flujo de la Aplicación

```
                    ┌─────────────┐
                    │  login.html │  ← Punto de entrada
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │ ¿Credenciales válidas?  │
              └───────┬────────────────┘
                      │
         ┌────────────┴──────────────┐
         ▼                           ▼
   rol = "user"                rol = "admin"
         │                           │
         ▼                           ▼
   index.html                  admin.html
  (Formulario de            (Panel de gestión)
   inscripción)                     │
         │                    ┌─────┴──────────────┐
         │ POST /guardar      │ Aceptar estudiante  │
         ▼                    │ POST /aceptar       │
  estudiantes.json            │         │           │
  (estado: Pendiente)         │         ▼           │
                              │  Envío de correo    │
                              │  (Gmail SMTP)       │
                              │         │           │
                              │  estudiantes.json   │
                              │  (estado: Aceptado) │
                              └─────────────────────┘
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos previos

- **Python 3.x** instalado
- Conexión a Internet (para Google Fonts y SMTP)
- Cuenta Gmail con **Contraseña de Aplicación** configurada

### Pasos

1. **Abrir una terminal** en la carpeta del proyecto:
   ```powershell
   cd "c:\Users\Fares Zuñiga Perez\Desktop\LAB - Fares Zuñiga Perez"
   ```

2. **Iniciar el servidor backend**:
   ```powershell
   python server.py
   ```

3. **Abrir el navegador** en:
   ```
   http://localhost:8000/login.html
   ```

4. **Detener el servidor**: presiona `Ctrl + C` en la terminal.

> ⚠️ El servidor debe estar corriendo siempre que se use la aplicación. Si no está activo, el login, registro e inscripción no funcionarán.

---

## 📄 Páginas y Funcionalidades

### `login.html` + `login.js`
- Formulario con campos **Usuario** y **Contraseña**.
- Envía una petición `POST /login` al backend.
- Redirige según el rol:
  - `admin` → `admin.html`
  - `user` → `index.html`
- Muestra mensajes de error si las credenciales son incorrectas.
- Enlace a `registro.html` para crear cuenta nueva.

---

### `registro.html` + `registro.js`
- Formulario para crear una nueva cuenta de usuario.
- Envía `POST /crear_usuario` al backend.
- Verifica que el nombre de usuario no esté ya registrado.
- Al éxito, redirige automáticamente a `login.html`.

---

### `index.html` + `script.js`
- Formulario de inscripción al Curso de IA con campos:
  - **Nombre Completo**
  - **Correo Electrónico**
  - **Teléfono**
- Envía los datos mediante `POST /guardar`.
- El estudiante queda registrado con `estado: "Pendiente"`.
- Incluye animaciones de barra de progreso y efecto "typewriter" en el subtítulo.
- Botón **Cerrar Sesión** para volver a `login.html`.

---

### `admin.html` + `admin.js`
- Panel exclusivo para el administrador.
- Carga la lista completa de estudiantes desde `GET /estudiantes`.
- Muestra una tabla con: `#`, Nombre, Correo, Teléfono, Estado, Acciones.
- **Botón Aceptar**: cambia el estado a `"Aceptado"` y envía un correo al estudiante.
- **Botón Eliminar**: elimina el registro del estudiante del archivo JSON.
- Botón **Cerrar Sesión** para volver a `login.html`.

---

## ⚙️ Backend — server.py

Servidor HTTP creado con `http.server.HTTPServer` de Python (sin frameworks externos).

### Características principales:

- **Puerto**: `8000`
- **CORS habilitado**: acepta peticiones desde cualquier origen (`*`).
- **Archivos de datos**:
  - `estudiantes.json` — inscripciones al curso
  - `usuarios.json` — cuentas de acceso
- **Envío de correo**: usa `smtplib` con Gmail SMTP + TLS en el puerto `587`.

---

## 🔌 API — Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/estudiantes` | Devuelve la lista completa de estudiantes inscritos |
| `POST` | `/login` | Autentica usuario y devuelve su rol |
| `POST` | `/crear_usuario` | Registra un nuevo usuario en `usuarios.json` |
| `POST` | `/guardar` | Guarda un nuevo estudiante con estado `Pendiente` |
| `POST` | `/aceptar` | Cambia estado a `Aceptado` y envía correo de confirmación |
| `POST` | `/eliminar` | Elimina un estudiante por correo electrónico |

### Ejemplos de cuerpo JSON

**`POST /login`**
```json
{ "usuario": "Fares Zuñiga Perez", "password": "Fzp20032011" }
```

**`POST /guardar`**
```json
{ "nombre": "Juan Pérez", "correo": "juan@ejemplo.com", "telefono": "3001234567" }
```

**`POST /aceptar`** / **`POST /eliminar`**
```json
{ "correo": "juan@ejemplo.com" }
```

---

## 🗂️ Archivos de Datos

### `usuarios.json`
Almacena las cuentas de acceso de los usuarios registrados.

```json
[
    {
        "usuario": "Eduar Quijote",
        "password": "Eduarq",
        "rol": "user"
    },
    {
        "usuario": "Fares Zuñiga Perez",
        "password": "Fzp20032011",
        "rol": "user"
    }
]
```

> El administrador `admin` / `admin123` está definido directamente en el código del servidor y no aparece en este archivo.

---

### `estudiantes.json`
Almacena los datos de cada estudiante inscrito al curso.

```json
[
    {
        "nombre": "Jose Lazcano Perez",
        "correo": "ejemplo@gmail.com",
        "telefono": "3148585913",
        "estado": "Aceptado"
    }
]
```

**Valores posibles de `estado`:** `"Pendiente"` | `"Aceptado"`

---

## 📧 Configuración del Correo Electrónico

El correo de aceptación se envía automáticamente cuando el administrador presiona **"Aceptar"**.

### Configuración en `server.py` (líneas 15–22):

```python
CORREO_ADMIN = "systemenginneer77@gmail.com"
PASSWORD_ADMIN = "xxxxxxxxxxxxxxxxxxxx"  # Contraseña de Aplicación de Google (16 dígitos)
```

### ⚠️ Importante: Contraseña de Aplicación

Google **no permite** usar tu contraseña normal de Gmail por SMTP. Debes generar una **Contraseña de Aplicación**:

1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. La verificación en 2 pasos debe estar **activa**
3. Crea una nueva clave para "Correo" / "Windows"
4. Copia los **16 caracteres** (sin espacios) en `PASSWORD_ADMIN`

### Contenido del correo enviado:

> **Asunto:** ¡Aceptado en el Curso de Inteligencia Artificial!
>
> Hola,
>
> ¡Felicidades! Nos complace informarte que has sido aceptado oficialmente en el Curso de Inteligencia Artificial.
>
> Prepárate para aprender y construir el futuro.
>
> Saludos,
> El Administrador

---

## 🎨 Diseño y Estilos

El archivo `style.css` define un sistema de diseño oscuro con estética de IA:

### Variables CSS (Design Tokens)

| Variable | Valor | Uso |
|----------|-------|-----|
| `--bg-color` | `#050505` | Fondo general |
| `--card-bg` | `rgba(20,20,25,0.6)` | Fondo de tarjetas |
| `--primary-glow` | `#00f0ff` | Cyan — color principal |
| `--secondary-glow` | `#7000ff` | Violeta — color secundario |
| `--text-main` | `#ffffff` | Texto principal |
| `--text-muted` | `#a0a0b0` | Texto secundario |
| `--border-color` | `rgba(255,255,255,0.1)` | Bordes suaves |

### Componentes Visuales

- **Canvas de partículas**: red neuronal animada en todas las páginas (fondo interactivo).
- **Glassmorphism** (`.glass-card`): tarjeta con blur, borde semitransparente y sombra.
- **Glitch effect** (`.glitch`): animación de distorsión en los títulos `h1`.
- **Floating label inputs**: etiquetas que flotan al enfocar el campo.
- **Barra de progreso**: animación `load` durante el envío del formulario.
- **Botones**:
  - `.action-btn` — botón primario con borde cyan y efecto shimmer al pasar el cursor.
  - `.logout-btn` — botón secundario con borde gris que cambia a rojo al pasar el cursor.

---

## 🔑 Credenciales de Acceso

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin123` |
| Usuario | `Eduar Quijote` | `Eduarq` |
| Usuario | `Fares Zuñiga Perez` | `Fzp20032011` |

> ⚠️ Estas credenciales son solo para uso local/educativo. No usar en producción sin implementar hashing de contraseñas.

---

## 🗄️ Base de Datos SQL (Referencia)

El archivo `database.sql` contiene la estructura para una base de datos MySQL equivalente (actualmente el proyecto usa JSON como almacenamiento):

```sql
CREATE DATABASE IF NOT EXISTS Estudiantes_inscritos;

USE Estudiantes_inscritos;

CREATE TABLE IF NOT EXISTS estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 👨‍💻 Autor

**Fares Zuñiga Perez**  
Proyecto de laboratorio — Sistema de Inscripción Curso de IA

---

*Documentación generada el 13 de mayo de 2026*
