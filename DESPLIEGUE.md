# 🚀 Guía de despliegue de CasaSwap

Despliegue en producción con:
- **Cloudinary** → almacenamiento de las fotos
- **Railway** → backend PHP + base de datos MySQL
- **Vercel** → frontend Angular

> Sigue los pasos **en orden**. Al final tendrás la app online con una URL pública.

---

## Resumen de la arquitectura

```
  Navegador
     │
     ├──────────────► Vercel  (Angular, frontend)
     │                   │
     │                   ├──► Railway  (PHP + MySQL, API y datos)
     │                   └──► Cloudinary (fotos)
```

---

## PASO 0 · Subir el proyecto a GitHub

Railway y Vercel despliegan desde un repositorio de GitHub.

1. Crea una cuenta en [github.com](https://github.com) si no la tienes.
2. Crea un repositorio nuevo, p. ej. **`casaswap`** (vacío, sin README).
3. En la carpeta del proyecto, abre una terminal y ejecuta:
   ```bash
   git init
   git add .
   git commit -m "CasaSwap - versión para despliegue"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/casaswap.git
   git push -u origin main
   ```
> El `.gitignore` ya excluye `node_modules`, `dist`, `.claude`, etc.

---

## PASO 1 · Cloudinary (fotos)

1. Crea una cuenta gratis en [cloudinary.com](https://cloudinary.com).
2. En el **Dashboard** apunta tu **Cloud name** (algo como `dxxxx123`).
3. Ve a **Settings (⚙️) → Upload → Upload presets → Add upload preset**.
   - **Signing Mode:** cambia a **Unsigned**.
   - **Upload preset name:** ponle `casaswap_unsigned` (o el que quieras).
   - Guarda (**Save**).
4. Anota dos datos:
   - **Cloud name** (p. ej. `dxxxx123`)
   - **Upload preset** (`casaswap_unsigned`)

> Estos dos valores los pondrás en los archivos `environment.ts` del frontend (Paso 4).

---

## PASO 2 · Base de datos MySQL en Railway

1. Crea una cuenta en [railway.app](https://railway.app) (puedes entrar con GitHub).
2. **New Project → Deploy MySQL** (o *Add → Database → MySQL*).
3. Cuando esté creada, abre el servicio **MySQL → pestaña "Connect"** y copia los datos
   de conexión **pública** (host, puerto, usuario, contraseña).
4. **Importa la base de datos.** Desde tu PC, con el archivo
   `BD/instalacion_completa.sql`, ejecuta en una terminal:
   ```bash
   mysql -h HOST_PUBLICO -P PUERTO -u root -pCONTRASEÑA < BD/instalacion_completa.sql
   ```
   *(Sustituye HOST_PUBLICO, PUERTO y CONTRASEÑA por los de Railway.)*

   **Alternativa sin terminal:** abre `BD/instalacion_completa.sql`, copia todo su
   contenido, y pégalo en la pestaña **"Query"** del servicio MySQL en Railway (o en
   MySQL Workbench / HeidiSQL conectado a Railway) y ejecútalo.

> El script crea la base de datos `casaswap` con todas las tablas y datos de ejemplo.

---

## PASO 3 · Backend PHP en Railway

1. En el **mismo proyecto** de Railway: **New → GitHub Repo** y elige tu repo `casaswap`.
2. En la configuración del servicio (**Settings**):
   - **Root Directory:** `backend`  ← importante (ahí está el `Dockerfile`).
   - Railway detectará el `Dockerfile` automáticamente.
3. Ve a la pestaña **Variables** del servicio del backend y añade estas variables
   (usa las referencias al servicio MySQL):
   | Variable | Valor |
   |----------|-------|
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_NAME` | `casaswap` |
   | `DB_USER` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASS` | `${{MySQL.MYSQLPASSWORD}}` |

   *(Al escribir `${{` Railway te autocompleta las variables del servicio MySQL.)*
4. Railway construirá y desplegará el backend. En **Settings → Networking →
   Generate Domain**, genera un dominio público. Quedará algo como:
   ```
   https://casaswap-backend-production.up.railway.app
   ```
5. **Comprueba** que funciona abriendo en el navegador:
   ```
   https://TU-BACKEND.up.railway.app/servicios.php
   ```
   Debe cargar sin error (saldrá en blanco o un JSON — es normal).

> Anota la URL del backend: la necesitas en el Paso 4.

---

## PASO 4 · Configurar el frontend con tus URLs

Edita el archivo **`CasaSwap/src/environments/environment.prod.ts`** y pon tus valores
reales:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-BACKEND.up.railway.app/servicios.php',  // ← URL del Paso 3
  cloudinaryCloud:  'dxxxx123',          // ← Cloud name del Paso 1
  cloudinaryPreset: 'casaswap_unsigned', // ← preset del Paso 1
};
```

Edita también **`CasaSwap/src/environments/environment.ts`** (desarrollo) y rellena solo
los dos valores de Cloudinary (el `apiUrl` de desarrollo se deja como está).

Guarda, y sube los cambios a GitHub:
```bash
git add .
git commit -m "Configurar URLs de producción"
git push
```

---

## PASO 5 · Frontend Angular en Vercel

1. Crea una cuenta en [vercel.com](https://vercel.com) (entra con GitHub).
2. **Add New → Project** y selecciona tu repo `casaswap`.
3. En la configuración del proyecto:
   - **Root Directory:** `CasaSwap`  ← importante.
   - El resto lo detecta del `vercel.json` (build `npm run build`, salida
     `dist/CasaSwap/browser`).
4. Pulsa **Deploy**. En 1-2 minutos tendrás una URL como:
   ```
   https://casaswap.vercel.app
   ```

---

## PASO 6 · Comprobación final

Abre la URL de Vercel y verifica:
- [ ] Cargan las casas (significa que el frontend habla con el backend de Railway).
- [ ] Puedes **iniciar sesión** (p. ej. `carlos@ejemplo.com` / `1234`).
- [ ] Se ve tu **saldo de puntos**.
- [ ] Al **publicar una casa** y subir fotos, estas se guardan en Cloudinary.
- [ ] Puedes **solicitar un alquiler** y, como propietario, **aceptarlo**.

---

## Resumen de valores que debes tener a mano

| Dato | Dónde se obtiene | Dónde se usa |
|------|------------------|--------------|
| Cloud name de Cloudinary | Dashboard de Cloudinary | `environment.ts` y `environment.prod.ts` |
| Upload preset | Cloudinary → Upload presets | `environment.ts` y `environment.prod.ts` |
| URL del backend | Railway → backend → Domain | `environment.prod.ts` |
| Datos MySQL | Railway → MySQL → Connect | Variables del backend en Railway |

---

## Resolución de problemas

| Problema | Solución |
|----------|----------|
| El frontend no carga casas | Revisa que `apiUrl` en `environment.prod.ts` es correcto y termina en `/servicios.php`. Vuelve a hacer push y redeploy en Vercel. |
| Error CORS | El backend ya envía `Access-Control-Allow-Origin: *`. Asegúrate de que la petición va al dominio de Railway, no a localhost. |
| Las fotos no se suben | Revisa el **Cloud name** y que el preset esté en modo **Unsigned**. |
| El backend da error de BD | Revisa las variables `DB_*` en Railway y que importaste `instalacion_completa.sql`. |
| Rutas 404 al recargar en Vercel | El `vercel.json` ya incluye el rewrite a `index.html`; comprueba que el Root Directory es `CasaSwap`. |

---

*CasaSwap · Despliegue: Vercel + Railway + Cloudinary*
