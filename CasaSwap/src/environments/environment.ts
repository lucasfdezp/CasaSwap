// Entorno de DESARROLLO (local con XAMPP + ng serve)
// El proxy.conf.json reenvía /casaswap -> http://localhost:80
export const environment = {
  production: false,

  // API PHP (en local va por el proxy de Angular)
  apiUrl: '/casaswap/servicios.php',

  // Cloudinary (subida de imágenes) — rellena con tus datos
  cloudinaryCloud:  'TU_CLOUD_NAME',
  cloudinaryPreset: 'casaswap_unsigned',
};
