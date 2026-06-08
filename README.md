# CasaSwap

Plataforma web de intercambio de viviendas en España mediante un sistema de puntos.
En lugar de pagar con dinero, los usuarios ganan puntos cuando alguien alquila su casa
y los gastan para alojarse en las casas de otros.

**Aplicación desplegada:** https://casa-swap.vercel.app

> Proyecto Intermodular (PiM) — Ciclo de Desarrollo de Aplicaciones Web (DAW).

---

## Descripción

CasaSwap permite a los usuarios publicar su vivienda, explorar un catálogo de casas
disponibles y solicitar intercambios usando una moneda interna de puntos. Cada casa
recibe un valor en puntos calculado automáticamente según sus características
(tipo, habitaciones, capacidad, piscina, patio, ubicación, etc.). Las solicitudes de
alquiler funcionan con un flujo de aprobación: el propietario decide a quién acepta, y
solo entonces se transfieren los puntos.

## Características principales

- Catálogo de viviendas con filtros por provincia, tipo y fechas disponibles.
- Ficha detallada de cada casa: galería de fotos, mapa real, servicios y disponibilidad.
- Sistema de puntos como moneda interna, con cálculo automático y ajuste manual.
- Solicitudes de alquiler con aprobación del propietario y transferencia de puntos.
- Autenticación de usuarios y panel de administración (gestión de usuarios y casas).
- Subida de imágenes a la nube (Cloudinary).

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 (TypeScript) |
| Backend | PHP 8.2 + PDO |
| Base de datos | MySQL 8 |
| Mapas | Leaflet + OpenStreetMap |
| Imágenes | Cloudinary |
| Despliegue | Vercel (frontend) · Railway (backend + BD) |

## Arquitectura

```
Navegador
   |
   |--> Vercel ........... Frontend Angular (SPA)
            |
            |--> Railway ...... API PHP + base de datos MySQL
            |--> Cloudinary ... almacenamiento de fotos
```

## Estructura del proyecto

```
CasaSwap/   Frontend Angular (componentes, servicios, modelos, guards)
backend/    API PHP (servicios.php, modelos.php) y Dockerfile
BD/         Scripts SQL de la base de datos
```

## Instalación en local

Requisitos: XAMPP (Apache + MySQL) y Node.js con Angular CLI.

1. **Base de datos**: importar `BD/instalacion_completa.sql` en phpMyAdmin.
2. **Backend**: copiar los archivos de `backend/` a `C:\xampp\htdocs\casaswap`.
3. **Frontend**:
   ```bash
   cd CasaSwap
   npm install
   ng serve -o
   ```
4. Abrir `http://localhost:4200`.

Para el despliegue en producción, consultar `DESPLIEGUE.md`.

## Credenciales de prueba

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Administrador | admin@casaswap.es | admin123 |
| Usuario | carlos@ejemplo.com | 1234 |
| Usuario (demo) | demo@casaswap.com | 1234 |

El resto de usuarios de ejemplo (maria, pedro, lucia @ejemplo.com) también usan `1234`.

## Documentación

- `DOCUMENTACION_TECNICA.pdf` — memoria técnica del proyecto.
- `MANUAL_DE_USUARIO.pdf` — manual de uso de la aplicación.
- `DESPLIEGUE.md` — guía de despliegue (Vercel + Railway + Cloudinary).

## Autor

Lucas Fernández — Proyecto Intermodular DAW.
