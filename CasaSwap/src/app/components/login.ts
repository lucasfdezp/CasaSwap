import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fondo">
      <div class="tarjeta">

        <div class="logo">🏠 CasaSwap</div>
        <h1>Panel de administración</h1>
        <p class="sub">Accede con tus credenciales de administrador</p>

        <div *ngIf="error" class="msg error">{{ error }}</div>

        <form (ngSubmit)="entrar()" #f="ngForm" novalidate>

          <label>
            Email
            <input name="email" [(ngModel)]="email" type="email"
                   required email placeholder="admin@casaswap.es"
                   #em="ngModel" />
            <span class="field-error" *ngIf="em.invalid && em.touched">Email válido obligatorio.</span>
          </label>

          <label>
            Contraseña
            <input name="password" [(ngModel)]="password" type="password"
                   required minlength="4" placeholder="••••••••"
                   #pw="ngModel" />
            <span class="field-error" *ngIf="pw.invalid && pw.touched">Contraseña obligatoria.</span>
          </label>

          <button type="submit" [disabled]="f.invalid || cargando">
            {{ cargando ? 'Accediendo...' : 'Entrar' }}
          </button>

        </form>

        <a class="volver" routerLink="/">← Volver a la web</a>

      </div>
    </div>
  `,
  styles: [`
    .fondo {
      min-height: 100vh;
      background: #080B12;
      display: flex; align-items: center; justify-content: center;
      padding: 24px; position: relative; overflow: hidden;
    }
    .fondo::before {
      content: '';
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(201,169,110,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,.04) 1px, transparent 1px);
      background-size: 56px 56px; pointer-events: none;
    }
    .fondo::after {
      content: '';
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(ellipse, rgba(201,169,110,.08) 0%, transparent 65%);
      pointer-events: none;
    }

    .tarjeta {
      position: relative; z-index: 1;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(201,169,110,.18);
      backdrop-filter: blur(24px);
      border-radius: 24px;
      padding: 42px 38px; width: 100%; max-width: 420px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 32px 80px rgba(0,0,0,.5);
      text-align: center;
    }

    .logo {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.7rem; font-weight: 400;
      background: linear-gradient(135deg, #b8924d, #C9A96E, #f0d898, #C9A96E, #b8924d);
      background-size: 200% auto;
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmerGold 3s linear infinite;
      margin-bottom: 10px;
    }
    @keyframes shimmerGold {
      0%   { background-position: 0% center; }
      100% { background-position: 200% center; }
    }

    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.3rem; font-weight: 400; color: #F5F0E8; margin-bottom: 6px;
    }
    .sub { font-size: .83rem; color: rgba(245,240,232,.4); margin-bottom: 30px; }

    label {
      display: flex; flex-direction: column;
      text-align: left; font-size: .75rem;
      color: rgba(245,240,232,.45); margin-bottom: 15px;
      font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
    }

    input {
      margin-top: 6px; padding: 11px 14px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(201,169,110,.15); border-radius: 12px;
      font-size: .94rem; color: #F5F0E8; font-family: inherit;
      transition: all .2s; outline: none;
    }
    input::placeholder { color: rgba(245,240,232,.22); }
    input:focus { border-color: rgba(201,169,110,.5); background: rgba(255,255,255,.07); box-shadow: 0 0 0 3px rgba(201,169,110,.1); }
    input.ng-invalid.ng-touched { border-color: rgba(212,160,160,.5); }

    .field-error { color: #D4A0A0; font-size: .74rem; margin-top: 3px; text-transform: none; letter-spacing: 0; }

    button {
      width: 100%; padding: 13px;
      background: linear-gradient(135deg, #C9A96E, #D4A574, #b8924d);
      color: #080B12;
      border: none; border-radius: 100px;
      font-size: .92rem; font-weight: 700;
      cursor: pointer; margin-top: 4px;
      box-shadow: 0 6px 24px rgba(201,169,110,.35);
      transition: all .25s;
    }
    button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(201,169,110,.5); }
    button:disabled { opacity: .35; cursor: not-allowed; transform: none; }

    .msg.error {
      background: rgba(212,160,160,.1); border: 1px solid rgba(212,160,160,.25); color: #D4A0A0;
      padding: 10px 14px; border-radius: 10px;
      font-size: .87rem; margin-bottom: 16px;
    }

    .volver {
      display: block; margin-top: 24px;
      font-size: .83rem; color: rgba(245,240,232,.3); text-decoration: none;
      transition: color .2s;
    }
    .volver:hover { color: rgba(201,169,110,.7); }
  `]
})
export class LoginComponent {

  email    = '';
  password = '';
  error    = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  entrar(): void {
    this.error   = '';
    this.cargando = true;

    this.auth.loginAdmin(this.email, this.password).subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.result === 'OK') {
          this.router.navigate(['/usuarios']);
        } else {
          this.error = res.error ?? 'Credenciales incorrectas.';
        }
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo conectar con el servidor.';
      }
    });
  }
}
