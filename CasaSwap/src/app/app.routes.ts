import { Routes } from '@angular/router';
import { PortadaComponent }     from './components/portada';
import { ExplorarComponent }    from './components/explorar';
import { DetalleCasaComponent } from './components/detalle-casa';
import { PerfilComponent }      from './components/perfil';
import { UsuariosComponent }    from './components/usuarios';
import { CasasComponent }       from './components/casas';
import { authGuard, adminGuard } from './guards/auth.guard';

/**
 * Tabla de rutas de la aplicacion. Las rutas de perfil y de administracion
 * estan protegidas por guards. La ruta comodin redirige al inicio.
 */
export const routes: Routes = [
  { path: '',         component: ExplorarComponent },   // pagina principal (catalogo)
  { path: 'explorar', component: ExplorarComponent },
  { path: 'login',    component: PortadaComponent },
  { path: 'casa/:id', component: DetalleCasaComponent }, // ficha detallada de una casa
  { path: 'perfil',   component: PerfilComponent,   canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'casas',    component: CasasComponent,    canActivate: [adminGuard] },
  { path: '**',       redirectTo: '' }                  // cualquier ruta no definida vuelve al inicio
];
