import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de acceso para rutas que exigen sesion iniciada (cualquier tipo de
 * usuario). Si no hay sesion, redirige a la pantalla de login.
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogado()) return true;

  // Sin sesion no se permite el acceso: se manda al login
  router.navigate(['/login']);
  return false;
};

/**
 * Guard exclusivo del administrador. Protege las secciones de gestion
 * (usuarios y casas) frente a usuarios normales o visitantes.
 */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdmin()) return true;

  // Si no es administrador se devuelve al inicio
  router.navigate(['/']);
  return false;
};
