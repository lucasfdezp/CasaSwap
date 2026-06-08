import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Configuracion global de la aplicacion: enrutado, cliente HTTP y
 * deteccion de cambios. Se inyecta al arrancar en main.ts.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Agrupa eventos para reducir ciclos de deteccion de cambios
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};
