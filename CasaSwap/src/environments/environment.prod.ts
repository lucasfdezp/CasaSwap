// Entorno de PRODUCCIÓN (Vercel + Railway + Cloudinary)
// ⚠️ Sustituye las 3 constantes por tus valores reales antes de desplegar.
export const environment = {
  production: true,

  // URL pública del backend en Railway (termina en /servicios.php)
  apiUrl: 'https://casaswap-production.up.railway.app/servicios.php',

  // Cloudinary
  cloudinaryCloud:  'dagoywcaj',
  cloudinaryPreset: 'casaswap_unsigned',
};
