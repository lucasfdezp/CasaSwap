// Entorno de PRODUCCIÓN (Vercel + Railway + Cloudinary)
// ⚠️ Sustituye las 3 constantes por tus valores reales antes de desplegar.
export const environment = {
  production: true,

  // URL pública del backend en Railway (termina en /servicios.php)
  // Ejemplo: 'https://casaswap-backend-production.up.railway.app/servicios.php'
  apiUrl: 'https://TU-BACKEND.up.railway.app/servicios.php',

  // Cloudinary
  cloudinaryCloud:  'TU_CLOUD_NAME',
  cloudinaryPreset: 'casaswap_unsigned',
};
