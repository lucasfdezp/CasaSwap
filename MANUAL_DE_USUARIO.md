# 🏠 CasaSwap — Manual de Usuario

**Plataforma de intercambio de casas en España mediante un sistema de puntos**

Versión 1.0 · Proyecto Intermodular (PiM)

---

## Índice

1. [¿Qué es CasaSwap?](#1-qué-es-casaswap)
2. [Requisitos e instalación](#2-requisitos-e-instalación)
3. [Puesta en marcha](#3-puesta-en-marcha)
4. [Tipos de usuario](#4-tipos-de-usuario)
5. [El sistema de puntos](#5-el-sistema-de-puntos)
6. [Guía de uso paso a paso](#6-guía-de-uso-paso-a-paso)
7. [Credenciales de prueba](#7-credenciales-de-prueba)
8. [Resolución de problemas](#8-resolución-de-problemas)

---

## 1. ¿Qué es CasaSwap?

CasaSwap es una aplicación web para **intercambiar viviendas entre particulares** sin
dinero de por medio. En lugar de pagar con euros, los usuarios usan **puntos** (una
moneda interna): publicas tu casa, ganas puntos cuando alguien la alquila, y gastas
esos puntos para alojarte en las casas de otros.

**Características principales:**
- Catálogo de viviendas con buscador por provincia, tipo y **fechas disponibles**.
- Ficha detallada de cada casa al estilo Airbnb: galería de fotos, **mapa real**,
  servicios (piscina, patio, mascotas) y disponibilidad.
- **Sistema de puntos** que valora cada casa automáticamente según sus características.
- **Solicitudes de alquiler con aprobación**: el propietario decide a quién acepta.
- Panel de administración para gestionar usuarios y casas.

**Tecnologías:**
- *Frontend:* Angular 21 (standalone components, signals).
- *Backend:* PHP + PDO (API REST sencilla en `servicios.php`).
- *Base de datos:* MySQL / MariaDB.
- *Mapas:* Leaflet + OpenStreetMap.

---

## 2. Requisitos e instalación

### Requisitos previos
- **XAMPP** (Apache + MySQL/MariaDB) instalado.
- **Node.js** y **Angular CLI** (`npm install -g @angular/cli`) para el frontend.

### Estructura del proyecto
```
PiM/
├── CasaSwap/        → Aplicación Angular (frontend)
├── backend/         → Archivos PHP (API)
│   ├── servicios.php
│   ├── modelos.php
│   └── subir-imagen.php
└── BD/              → Scripts SQL de la base de datos
```

### Instalación de la base de datos
Abre **phpMyAdmin** (`http://localhost/phpmyadmin`) e importa los scripts en este orden:

| Orden | Archivo | Qué hace |
|-------|---------|----------|
| 1 | `casaswap.sql` | Crea la base de datos, las tablas y los datos iniciales |
| 2 | `instalar_extras.sql` | Añade puntos, atributos de casa y la tabla de solicitudes |
| 3 | `corregir_datos_casas.sql` | Datos coherentes + fotos + fechas de las 4 casas base |
| 4 | `mas_pisos.sql` | Añade más pisos de ejemplo y el propietario de prueba |
| 5 | `fijar_precio_albaicin.sql` | Deja un piso a 50 créditos para pruebas |

> Para los scripts 2–5, primero haz clic en la base de datos **`casaswap`** en la
> columna izquierda y luego ve a **Importar**.

### Despliegue del backend (PHP)
Copia los archivos de `backend/` dentro de la carpeta de Apache:
```
C:\xampp\htdocs\casaswap\
```
> Cada vez que se modifique un `.php`, hay que volver a copiarlo a esa carpeta.

---

## 3. Puesta en marcha

1. En el **Panel de control de XAMPP**, arranca **Apache** y **MySQL** (deben quedar en verde).
2. Abre una terminal en la carpeta `CasaSwap/` y ejecuta:
   ```
   npm install      (solo la primera vez)
   ng serve -o
   ```
3. La aplicación se abre en **`http://localhost:4200`**.

El frontend habla con el backend a través de `http://localhost/casaswap/servicios.php`.

---

## 4. Tipos de usuario

| Rol | Cómo accede | Qué puede hacer |
|-----|-------------|-----------------|
| **Visitante** (sin registro) | Acceso libre | Explorar casas y ver fichas. No puede contactar ni solicitar. |
| **Usuario registrado** | Email + contraseña | Publicar casas, ganar/gastar puntos, solicitar alquileres y gestionar solicitudes. |
| **Administrador** | Credenciales especiales | Gestionar (ver/editar/borrar) todos los usuarios y casas. |

---

## 5. El sistema de puntos

Los puntos son la **moneda interna** de CasaSwap.

### Saldo inicial
Todo usuario nuevo arranca con **50 puntos**.

### Cómo se calcula el valor de una casa
Cada casa tiene un valor automático según sus características:

| Concepto | Puntos |
|----------|:------:|
| Tipo: piso | 20 |
| Tipo: apartamento | 25 |
| Tipo: casa | 35 |
| Tipo: chalet | 50 |
| Por cada habitación | +8 |
| Por cada persona de capacidad | +4 |
| Tiene piscina | +30 |
| Tiene patio / jardín | +15 |
| Admite mascotas | +5 |
| Ciudad "premium" (Madrid, Barcelona, Sevilla, Bilbao, Valencia, Málaga, San Sebastián) | +20 |

> **Ejemplo:** un piso en Sevilla con 2 habitaciones, capacidad 4 y que admite mascotas:
> `20 + (2×8) + (4×4) + 5 + 20 = 77 puntos`.

El propietario puede **ajustar manualmente** el precio ±30% sobre el valor automático
mediante un control deslizante al publicar la casa.

### Cómo ganar y gastar puntos
- **Ganas** puntos cuando aceptas la solicitud de alguien que quiere tu casa.
- **Gastas** puntos cuando el propietario de otra casa acepta tu solicitud.

Los puntos solo se transfieren **cuando el propietario acepta** la solicitud (no antes).

---

## 6. Guía de uso paso a paso

### 6.1 · Registro e inicio de sesión
1. Pulsa **"Registrarse gratis"** en la barra superior.
2. Rellena tus datos (nombre, email, contraseña…).
3. Inicia sesión con tu email y contraseña.
4. Al entrar verás tu **saldo de puntos** (◈) en la barra de navegación.

### 6.2 · Explorar casas
En la página principal:
- Usa los desplegables para filtrar por **provincia** y **tipo de vivienda**.
- Selecciona un rango de **fechas** (entrada/salida): solo se mostrarán las casas
  disponibles en esas fechas.
- Cada tarjeta muestra el **coste en puntos** (◈) y los servicios (🏊 piscina, 🌳 patio,
  🐾 mascotas).

### 6.3 · Ver la ficha de una casa
Haz clic en cualquier casa para abrir su ficha completa (`/casa/:id`):
- **Galería de fotos** (haz clic para ampliar en pantalla completa).
- Sección **"Lo que ofrece"** con los servicios disponibles.
- **Fechas de disponibilidad** de la vivienda.
- **Mapa real** con la ubicación (barrio + ciudad).
- **Descripción** detallada y datos del propietario.

### 6.4 · Publicar tu casa
1. Ve a **"Mi perfil"** → botón **"+ Añadir casa"**.
2. Rellena los datos: título, descripción, dirección, ciudad, barrio, provincia, tipo,
   habitaciones y capacidad.
3. Marca las **características** (piscina, patio, mascotas) — verás cómo suben los puntos.
4. Indica las **fechas de disponibilidad**.
5. Ajusta el **valor en puntos** con el deslizante (o deja el sugerido).
6. Sube **un mínimo de 3 fotos** y elige una como **portada** (★).
7. Pulsa **"Publicar casa"**.

### 6.5 · Solicitar el alquiler de una casa
1. Entra en la ficha de la casa que te interesa.
2. En la tarjeta de la derecha verás el **coste en puntos** y tu saldo.
3. Pulsa **"Solicitar alquiler"**.
4. Elige las **fechas** y escribe un **mensaje** (opcional) para el propietario.
5. Pulsa **"Confirmar solicitud"**.
   > Los puntos **aún no se descuentan**: quedan reservados hasta que el propietario decida.

### 6.6 · Gestionar solicitudes (propietario)
En **"Mi perfil"**, abajo, hay dos paneles:

- **Solicitudes recibidas:** las peticiones de otros usuarios sobre tus casas.
  Puedes **Aceptar** (se transfieren los puntos y la casa pasa a "no disponible") o
  **Rechazar**.
- **Mis solicitudes enviadas:** el estado de tus peticiones (pendiente, aceptada,
  rechazada). Puedes **Cancelar** las que sigan pendientes.

Al **aceptar** una solicitud:
- Se descuentan los puntos al inquilino y se suman a ti (el propietario).
- La casa se marca como no disponible.
- El resto de solicitudes pendientes de esa casa se rechazan automáticamente.

### 6.7 · Panel de administración
El administrador dispone de dos secciones extra en el menú:
- **Usuarios:** listar, editar y eliminar usuarios.
- **Casas:** listar, editar y eliminar cualquier casa.

---

## 7. Credenciales de prueba

### Administrador
```
Email:       admin@casaswap.es
Contraseña:  admin123
```

### Usuarios de ejemplo (todos con 50 puntos iniciales)
| Nombre | Email | Contraseña | Ciudad |
|--------|-------|------------|--------|
| Carlos García | carlos@ejemplo.com | 1234 | Sevilla |
| María Fernández | maria@ejemplo.com | 1234 | Bilbao |
| Pedro Martínez | pedro@ejemplo.com | 1234 | Madrid |
| Lucía Pérez | lucia@ejemplo.com | 1234 | Barcelona |
| Ana Demo (pruebas) | demo@casaswap.com | 1234 | Granada |

### Cómo probar el sistema de puntos de principio a fin
1. Inicia sesión con un usuario (p. ej. **carlos@ejemplo.com / 1234**, tiene 50 puntos).
2. Busca el **"Estudio luminoso en Zaragoza" (37 pts)** o el
   **"Piso con encanto en el Albaicín" (50 pts)**.
3. Solicita el alquiler eligiendo fechas.
4. Cierra sesión e inicia con el **propietario** de esa casa
   (Pedro para el estudio, demo@casaswap.com para el Albaicín).
5. Ve a **Mi perfil → Solicitudes recibidas** y pulsa **Aceptar**.
6. Comprueba cómo los puntos pasan de un usuario a otro.

---

## 8. Resolución de problemas

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| Las casas no cargan / "Error de conexión" | Apache o MySQL apagados | Arráncalos en el panel de XAMPP |
| El saldo de puntos sale **0** | Sesión antigua en el navegador | Cierra sesión y vuelve a iniciarla |
| Las fechas salen en blanco | Falta el idioma español de fechas | Reinicia `ng serve` (ya viene configurado en `main.ts`) |
| Las fotos subidas no se ven | La carpeta del proyecto no está en `htdocs\casaswap` | Copia el backend a `C:\xampp\htdocs\casaswap` |
| Un cambio en un `.php` no surte efecto | El PHP no se copió a `htdocs` | Vuelve a copiar el archivo modificado |
| "Unknown database casaswap" al importar | No seleccionaste la BD antes de importar | Haz clic en `casaswap` y reintenta |

---

*CasaSwap · Intercambia tu casa, descubre España. Sin pagos. Sin agencias.*
