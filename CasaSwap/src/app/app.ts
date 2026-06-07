import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <a class="logo" routerLink="/">
        <!-- Two-house exchange logo -->
        <svg class="logo-svg" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- House 1 (navy/left) -->
          <path d="M2 12.5L9.5 5L17 12.5V22.5H13.5V17.5H5.5V22.5H2V12.5Z"
                stroke="#2C4A6E" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
          <!-- House 2 (teal/right) -->
          <path d="M39 12.5L46.5 5L54 12.5V22.5H50.5V17.5H42.5V22.5H39V12.5Z"
                stroke="#3D8B7A" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
          <!-- Exchange arrow: left→right (top arc) -->
          <path d="M19 10C22 6.5 26 6.5 28 7L26.2 5" stroke="#2C4A6E"
                stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <!-- Exchange arrow: right→left (bottom arc) -->
          <path d="M37 18C34 21.5 30 21.5 28 21L29.8 23" stroke="#3D8B7A"
                stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
        <span class="logo-text">Casa<strong>Swap</strong></span>
      </a>

      <div class="nav-links">

        <!-- Usuario normal logado -->
        <ng-container *ngIf="auth.esUsuario()">
          <a routerLink="/explorar" routerLinkActive="activo">Explorar casas</a>
          <a routerLink="/perfil"   routerLinkActive="activo">Mi perfil</a>
          <a routerLink="/perfil" class="puntos-chip" title="Tus puntos CasaSwap">
            <span class="puntos-chip-ico" aria-hidden="true">◈</span>
            {{ auth.puntos() }}
            <span class="puntos-chip-lbl">pts</span>
          </a>
          <span class="bienvenida">
            <span class="avatar-xs">{{ auth.getNombre() | slice:0:1 }}</span>
            {{ auth.getNombre() }}
          </span>
          <button class="btn-logout" (click)="auth.logout()">Salir</button>
        </ng-container>

        <!-- Admin logado -->
        <ng-container *ngIf="auth.esAdmin()">
          <a routerLink="/explorar" routerLinkActive="activo">Explorar</a>
          <a routerLink="/usuarios" routerLinkActive="activo">Usuarios</a>
          <a routerLink="/casas"    routerLinkActive="activo">Casas</a>
          <span class="bienvenida admin-badge">
            <svg class="ico-admin" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
            </svg>
            Admin
          </span>
          <button class="btn-logout" (click)="auth.logout()">Salir</button>
        </ng-container>

        <!-- Sin sesión -->
        <ng-container *ngIf="!auth.estaLogado()">
          <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{exact:true}">Explorar casas</a>
          <a class="btn-nav-login" routerLink="/login">Iniciar sesión</a>
          <a class="btn-nav-register" routerLink="/login">Registrarse gratis</a>
        </ng-container>

      </div>
    </nav>

    <router-outlet />

    <!-- ── Toast host (global) ── -->
    <div class="toast-host" aria-live="polite" aria-atomic="false">
      <div *ngFor="let t of toast.toasts()"
           class="toast"
           [class.toast-ok]="t.type === 'ok'"
           [class.toast-error]="t.type === 'error'">
        <svg *ngIf="t.type === 'ok'" class="toast-ico" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg *ngIf="t.type === 'error'" class="toast-ico" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span class="toast-msg">{{ t.msg }}</span>
        <button class="toast-close" (click)="toast.dismiss(t.id)" aria-label="Cerrar notificación">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      height: 66px; padding: 0 32px;
      background: rgba(255,255,255,0.90);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(44,74,110,0.10);
      box-shadow: 0 2px 20px rgba(30,54,80,0.08);
      position: sticky; top: 0; z-index: 100;
    }

    /* ── Logo ── */
    .logo {
      display: flex; align-items: center; gap: 11px;
      text-decoration: none;
    }
    .logo-svg {
      width: 52px; height: 26px;
      filter: drop-shadow(0 2px 4px rgba(44,74,110,0.15));
    }
    .logo-text {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.45rem; font-weight: 500; color: #1E3650;
      letter-spacing: .01em;
    }
    .logo-text strong {
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
    }

    /* ── Nav links ── */
    .nav-links { display: flex; align-items: center; gap: 4px; }
    .nav-links a {
      padding: 7px 15px; border-radius: 100px;
      text-decoration: none; font-size: .86rem; font-weight: 500;
      color: rgba(30,54,80,.55);
      transition: all .2s; letter-spacing: .01em;
    }
    .nav-links a:hover { background: rgba(44,74,110,.07); color: #1E3650; }
    .nav-links a.activo {
      background: rgba(44,74,110,.08);
      border: 1px solid rgba(44,74,110,.15);
      color: #2C4A6E; font-weight: 600;
    }

    /* ── Chip de puntos ── */
    .puntos-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 14px !important; border-radius: 100px;
      background: linear-gradient(135deg, rgba(44,74,110,.1), rgba(61,139,122,.12)) !important;
      border: 1px solid rgba(61,139,122,.3);
      color: #276657 !important; font-weight: 800 !important; font-size: .85rem !important;
    }
    .puntos-chip:hover { background: linear-gradient(135deg, rgba(44,74,110,.16), rgba(61,139,122,.2)) !important; }
    .puntos-chip-ico { color: #3D8B7A; font-size: .9rem; }
    .puntos-chip-lbl { font-size: .68rem; font-weight: 600; opacity: .7; }

    .bienvenida {
      display: flex; align-items: center; gap: 8px;
      font-size: .82rem; color: rgba(30,54,80,.45); padding: 0 6px;
    }
    .avatar-xs {
      width: 26px; height: 26px; border-radius: 50%;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: .7rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .admin-badge {
      background: rgba(44,74,110,.08);
      border: 1px solid rgba(44,74,110,.18);
      color: #2C4A6E; padding: 4px 13px; border-radius: 100px;
      font-size: .78rem; font-weight: 600; letter-spacing: .06em;
    }
    .ico-admin { width: 14px; height: 14px; }

    .btn-nav-login {
      padding: 7px 16px; border-radius: 100px;
      border: 1px solid rgba(44,74,110,.22);
      background: transparent; color: rgba(44,74,110,.75);
      font-size: .83rem; font-weight: 500; cursor: pointer;
      text-decoration: none; transition: all .2s;
    }
    .btn-nav-login:hover {
      border-color: rgba(44,74,110,.45);
      color: #2C4A6E;
      background: rgba(44,74,110,.05);
    }
    .btn-nav-register {
      padding: 7px 16px; border-radius: 100px;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: .83rem; font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(44,74,110,.3);
      transition: all .2s;
    }
    .btn-nav-register:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 22px rgba(44,74,110,.45);
    }

    .btn-logout {
      padding: 7px 16px; border-radius: 100px;
      border: 1px solid rgba(30,54,80,.14);
      background: transparent; color: rgba(30,54,80,.45);
      font-size: .83rem; font-weight: 500; cursor: pointer;
      transition: all .2s;
    }
    .btn-logout:hover {
      border-color: rgba(180,60,60,.3);
      color: #C05050;
      background: rgba(180,60,60,.06);
    }

    /* ── Toast ── */
    .toast-host {
      position: fixed; bottom: 28px; right: 28px; z-index: 1000;
      display: flex; flex-direction: column; gap: 10px;
      max-width: 360px; width: calc(100% - 32px); pointer-events: none;
    }
    .toast {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 16px; border-radius: 14px;
      font-size: .88rem; font-family: 'DM Sans', system-ui, sans-serif;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,.14);
      animation: toastIn .28s cubic-bezier(.34,1.56,.64,1);
      pointer-events: all;
    }
    @keyframes toastIn {
      from { transform: translateY(14px) scale(.94); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }
    .toast-ok {
      background: rgba(255,255,255,.95);
      border: 1px solid rgba(61,139,122,.3);
      color: #276657;
    }
    .toast-error {
      background: rgba(255,255,255,.95);
      border: 1px solid rgba(192,80,80,.3);
      color: #C05050;
    }
    .toast-ico { width: 18px; height: 18px; flex-shrink: 0; }
    .toast-msg { flex: 1; line-height: 1.4; color: #1E3650; }
    .toast-close {
      background: none; border: none; color: rgba(30,54,80,.35); opacity: 1;
      cursor: pointer; font-size: .85rem; padding: 0; line-height: 1;
      width: auto; box-shadow: none; transform: none !important;
      min-width: 0; transition: opacity .15s;
    }
    .toast-close:hover { opacity: .8; transform: none !important; }
  `]
})
export class App {
  constructor(
    public auth:  AuthService,
    public toast: ToastService
  ) {}
}
