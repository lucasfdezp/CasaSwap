import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege rutas que requieren estar logado (cualquier tipo)
export const authGuard: CanActivateFn = (route) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const sesion = auth.getSesion();
  const logado = auth.estaLogado();

  console.log('[authGuard] ruta:', route.routeConfig?.path, '| logado:', logado, '| sesion:', sesion);

  if (logado) return true;

  console.warn('[authGuard] Sin sesión → redirigiendo a /login');
  router.navigate(['/login']);
  return false;
};

// Protege rutas exclusivas del admin
export const adminGuard: CanActivateFn = (route) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const esAdmin = auth.esAdmin();

  console.log('[adminGuard] ruta:', route.routeConfig?.path, '| esAdmin:', esAdmin);

  if (esAdmin) return true;

  console.warn('[adminGuard] No es admin → redirigiendo a /');
  router.navigate(['/']);
  return false;
};
