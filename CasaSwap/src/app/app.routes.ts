import { Routes } from '@angular/router';
import { PortadaComponent }     from './components/portada';
import { ExplorarComponent }    from './components/explorar';
import { DetalleCasaComponent } from './components/detalle-casa';
import { PerfilComponent }      from './components/perfil';
import { UsuariosComponent }    from './components/usuarios';
import { CasasComponent }       from './components/casas';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',         component: ExplorarComponent },
  { path: 'explorar', component: ExplorarComponent },
  { path: 'login',    component: PortadaComponent },
  { path: 'casa/:id', component: DetalleCasaComponent },
  { path: 'perfil',   component: PerfilComponent,   canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'casas',    component: CasasComponent,    canActivate: [adminGuard] },
  { path: '**',       redirectTo: '' }
];
