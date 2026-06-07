import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { Usuario } from '../models/usuario';

@Component({
  selector: 'app-portada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagina">

      <!-- Fondo animado -->
      <div class="bg-wrap" aria-hidden="true">
        <div class="bg-grid"></div>
        <div class="orb orb1"></div>
        <div class="orb orb2"></div>
        <div class="orb orb3"></div>
        <div class="casitas">
          <span *ngFor="let c of casitas"
                class="casita"
                [style.left.%]="c.left"
                [style.font-size.rem]="c.size"
                [style.animation-duration.s]="c.dur"
                [style.animation-delay.s]="c.delay">{{ c.ico }}</span>
        </div>
      </div>

      <!-- Contenido -->
      <div class="hero-content">

        <!-- Logo y tagline -->
        <div class="hero-logo">
          <div class="hero-logo-icon">🏠</div>
          <div class="hero-logo-text">Casa<span>Swap</span></div>
        </div>
        <p class="hero-tagline">
          Intercambia tu casa con alguien de otra ciudad de España.<br>
          Tú en su casa, ellos en la tuya. Sin coste.
        </p>
        <div class="hero-badges">
          <span class="hbadge">✅ Completamente gratis</span>
          <span class="hbadge">🔒 Intercambios verificados</span>
          <span class="hbadge">🗺️ Toda España</span>
        </div>

        <!-- Paneles login / registro -->
        <div class="paneles">

          <!-- Panel Iniciar sesión -->
          <div class="panel">
            <h2>Iniciar sesión</h2>
            <p class="panel-sub">¿Ya tienes cuenta? Entra aquí.</p>

            <div *ngIf="errorLogin" class="msg error">{{ errorLogin }}</div>

            <form (ngSubmit)="login()" #fLogin="ngForm" novalidate>
              <label>
                Email
                <input name="loginEmail" [(ngModel)]="loginEmail" type="email"
                       required email placeholder="tu@email.com" #le="ngModel" />
                <span class="field-error" *ngIf="le.invalid && le.touched">Email válido obligatorio.</span>
              </label>
              <label>
                Contraseña
                <input name="loginPassword" [(ngModel)]="loginPassword" type="password"
                       required minlength="4" placeholder="••••••••" #lp="ngModel" />
                <span class="field-error" *ngIf="lp.invalid && lp.touched">Mínimo 4 caracteres.</span>
              </label>
              <button type="submit" [disabled]="fLogin.invalid || cargandoLogin">
                {{ cargandoLogin ? 'Entrando...' : 'Entrar →' }}
              </button>
            </form>

            <div class="separador"><span>¿Eres administrador?</span></div>
            <button class="btn-admin" (click)="loginAdmin()">⚙️ Acceso administración</button>
            <div *ngIf="errorAdmin" class="msg error" style="margin-top:10px">{{ errorAdmin }}</div>
            <form *ngIf="mostrarFormAdmin" (ngSubmit)="hacerLoginAdmin()" #fAdmin="ngForm" novalidate style="margin-top:12px">
              <label>
                Email admin
                <input name="adminEmail" [(ngModel)]="adminEmail" type="email" required email #ae="ngModel" />
              </label>
              <label>
                Contraseña admin
                <input name="adminPassword" [(ngModel)]="adminPassword" type="password" required #ap="ngModel" />
              </label>
              <button type="submit" [disabled]="fAdmin.invalid || cargandoAdmin">
                {{ cargandoAdmin ? 'Accediendo...' : 'Entrar como admin' }}
              </button>
            </form>
          </div>

          <!-- Divisor -->
          <div class="divisor"><span>o</span></div>

          <!-- Panel Crear cuenta -->
          <div class="panel">
            <h2>Crear cuenta</h2>
            <p class="panel-sub">Regístrate gratis y publica tu casa.</p>

            <div *ngIf="mensajeRegistro" class="msg ok">{{ mensajeRegistro }}</div>
            <div *ngIf="errorRegistro"   class="msg error">{{ errorRegistro }}</div>

            <form (ngSubmit)="registrar()" #fReg="ngForm" novalidate>
              <div class="fila-2">
                <label>
                  Nombre *
                  <input name="regNombre" [(ngModel)]="regForm.nombre" required minlength="2" maxlength="80" #rn="ngModel" />
                  <span class="field-error" *ngIf="rn.invalid && rn.touched">Obligatorio.</span>
                </label>
                <label>
                  Apellidos *
                  <input name="regApellidos" [(ngModel)]="regForm.apellidos" required minlength="2" maxlength="100" #ra="ngModel" />
                  <span class="field-error" *ngIf="ra.invalid && ra.touched">Obligatorio.</span>
                </label>
              </div>
              <label>
                Email *
                <input name="regEmail" [(ngModel)]="regForm.email" type="email" required email maxlength="150" #re="ngModel" />
                <span class="field-error" *ngIf="re.invalid && re.touched">Email válido obligatorio.</span>
              </label>
              <label>
                Teléfono
                <input name="regTelefono" [(ngModel)]="regForm.telefono" maxlength="20" placeholder="600 000 000" />
              </label>
              <div class="fila-2">
                <label>
                  Ciudad
                  <input name="regCiudad" [(ngModel)]="regForm.ciudad" maxlength="80" />
                </label>
                <label>
                  Provincia
                  <select name="regProvincia" [(ngModel)]="regForm.provincia">
                    <option value="">— Selecciona —</option>
                    <option *ngFor="let p of provincias" [value]="p">{{ p }}</option>
                  </select>
                </label>
              </div>
              <label>
                Contraseña *
                <input name="regPassword" [(ngModel)]="regForm.password" type="password"
                       required minlength="4" maxlength="255" #rpw="ngModel" />
                <span class="field-error" *ngIf="rpw.invalid && rpw.touched">Mínimo 4 caracteres.</span>
              </label>
              <button type="submit" [disabled]="fReg.invalid || cargandoRegistro">
                {{ cargandoRegistro ? 'Creando cuenta...' : 'Crear cuenta gratis →' }}
              </button>
            </form>
          </div>

        </div>

        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat"><div class="stat-n">124</div><div class="stat-l">Casas publicadas</div></div>
          <div class="stat-sep"></div>
          <div class="stat"><div class="stat-n">89</div><div class="stat-l">Intercambios</div></div>
          <div class="stat-sep"></div>
          <div class="stat"><div class="stat-n">50</div><div class="stat-l">Provincias activas</div></div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Base ── */
    .pagina {
      min-height: 100vh; position: relative; overflow: hidden;
      background: linear-gradient(160deg, #EFF4FA 0%, #E4EDF6 55%, #EAF2EF 100%);
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Fondo animado ── */
    .bg-wrap { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

    .bg-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(44,74,110,.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(44,74,110,.06) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(100px); animation: orbPulse 8s ease-in-out infinite;
      pointer-events: none;
    }
    .orb1 { width: 700px; height: 700px; background: rgba(44,74,110,.10); top:-200px; left:-180px; }
    .orb2 { width: 500px; height: 500px; background: rgba(61,139,122,.08); bottom:-120px; right:-100px; animation-delay:-4s; }
    .orb3 { width: 400px; height: 400px; background: rgba(44,74,110,.07); top:35%; left:50%; animation-delay:-2s; }
    @keyframes orbPulse {
      0%,100% { transform: scale(1);   opacity:.6; }
      50%      { transform: scale(1.15); opacity:1; }
    }

    .casitas { position: absolute; inset: 0; }
    .casita {
      position: absolute; bottom: -10vh; opacity: 0;
      animation: casitaFlota linear infinite;
    }
    @keyframes casitaFlota {
      0%   { transform: translateY(0)    rotate(-8deg);  opacity: 0; }
      5%   { opacity: .08; }
      95%  { opacity: .08; }
      100% { transform: translateY(-115vh) rotate(8deg); opacity: 0; }
    }

    /* ── Contenido ── */
    .hero-content {
      position: relative; z-index: 2;
      display: flex; flex-direction: column; align-items: center;
      padding: 72px 24px 60px; width: 100%; max-width: 980px;
    }

    .hero-logo {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 20px;
      animation: fadeDown .7s ease both;
    }
    .hero-logo-icon {
      width: 68px; height: 68px; border-radius: 18px;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
      box-shadow: 0 12px 40px rgba(44,74,110,.35), 0 0 0 1px rgba(44,74,110,.15);
      animation: logoFloat 3s ease-in-out infinite;
    }
    @keyframes logoFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    .hero-logo-text {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 3rem; font-weight: 600; color: #1E3650; letter-spacing: -1px;
    }
    .hero-logo-text span {
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A, #2C4A6E);
      background-size: 200% auto;
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmerGold 3s linear infinite;
    }
    @keyframes shimmerGold {
      0%   { background-position: 0% center; }
      100% { background-position: 200% center; }
    }

    .hero-tagline {
      color: rgba(30,54,80,.58); font-size: 1.05rem; text-align: center;
      line-height: 1.7; margin-bottom: 20px; max-width: 520px;
      animation: fadeDown .7s .1s ease both;
    }

    .hero-badges {
      display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
      margin-bottom: 44px;
      animation: fadeDown .7s .2s ease both;
    }
    .hbadge {
      padding: 6px 16px; border-radius: 100px;
      background: rgba(44,74,110,.08);
      border: 1px solid rgba(44,74,110,.16);
      color: rgba(30,54,80,.65); font-size: .78rem; font-weight: 500;
      letter-spacing: .04em;
    }

    /* ── Paneles ── */
    .paneles {
      display: flex; align-items: stretch; width: 100%;
      background: rgba(255,255,255,.88);
      border: 1px solid rgba(44,74,110,.12);
      border-radius: 24px; overflow: hidden;
      box-shadow: 0 8px 60px rgba(30,54,80,.14), inset 0 1px 0 rgba(255,255,255,.9);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      animation: fadeUp .7s .25s ease both;
    }

    .panel { flex: 1; padding: 36px 32px; }
    .panel:first-child { border-right: 1px solid rgba(44,74,110,.08); }

    .divisor {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 0 4px;
    }
    .divisor::before, .divisor::after {
      content: ''; flex: 1; width: 1px;
      background: linear-gradient(180deg, transparent, rgba(44,74,110,.15), transparent);
    }
    .divisor span {
      padding: 7px; font-size: .72rem; color: rgba(44,74,110,.45);
      background: rgba(44,74,110,.06); border-radius: 50%;
      border: 1px solid rgba(44,74,110,.14);
    }

    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.5rem; font-weight: 500; color: #1E3650; margin-bottom: 4px;
    }
    .panel-sub { font-size: .84rem; color: rgba(30,54,80,.4); margin-bottom: 24px; }

    label {
      display: flex; flex-direction: column;
      font-size: .78rem; color: rgba(30,54,80,.5);
      font-weight: 500; letter-spacing: .05em; margin-bottom: 13px;
      text-transform: uppercase;
    }
    input, select {
      margin-top: 6px; padding: 10px 14px;
      background: #F5F8FD;
      border: 1px solid rgba(44,74,110,.15);
      border-radius: 12px; color: #1E3650; font-size: .92rem;
      transition: all .2s; outline: none; font-family: inherit;
    }
    input::placeholder { color: rgba(30,54,80,.3); }
    input:focus, select:focus {
      background: #fff;
      border-color: #2C4A6E;
      box-shadow: 0 0 0 3px rgba(44,74,110,.1);
    }
    input.ng-invalid.ng-touched { border-color: rgba(192,80,80,.5); }
    select option { background: #fff; color: #1E3650; }
    .field-error { color: #C05050; font-size: .73rem; margin-top: 3px; font-weight: 400; text-transform: none; letter-spacing: 0; }
    .fila-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    button[type=submit] {
      width: 100%; padding: 13px; border: none; border-radius: 100px;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: .9rem; font-weight: 700; cursor: pointer;
      margin-top: 4px;
      box-shadow: 0 6px 24px rgba(44,74,110,.3);
      transition: all .25s; letter-spacing: .05em;
    }
    button[type=submit]:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 36px rgba(44,74,110,.45);
    }
    button[type=submit]:active { transform: translateY(0); }
    button[type=submit]:disabled { opacity: .35; cursor: not-allowed; transform: none; }

    .btn-admin {
      width: 100%; padding: 10px; border-radius: 100px;
      border: 1px solid rgba(44,74,110,.18) !important;
      background: transparent !important; color: rgba(44,74,110,.55) !important;
      font-size: .82rem !important; font-weight: 500 !important; cursor: pointer;
      transition: all .2s; letter-spacing: .04em;
    }
    .btn-admin:hover {
      border-color: rgba(44,74,110,.4) !important;
      color: #2C4A6E !important;
      background: rgba(44,74,110,.06) !important;
    }

    .separador {
      display: flex; align-items: center; gap: 10px;
      margin: 18px 0 12px; font-size: .74rem; color: rgba(30,54,80,.3);
    }
    .separador::before, .separador::after {
      content: ''; flex: 1; height: 1px; background: rgba(44,74,110,.1);
    }
    .separador span { white-space: nowrap; }

    .msg { padding: 10px 14px; border-radius: 10px; font-size: .83rem; margin-bottom: 13px; }
    .msg.ok    { background: rgba(39,102,87,.07);  border: 1px solid rgba(39,102,87,.2);  color: #276657; }
    .msg.error { background: rgba(192,80,80,.07);  border: 1px solid rgba(192,80,80,.2);  color: #C05050; }

    /* ── Stats ── */
    .hero-stats {
      display: flex; align-items: center; gap: 28px; margin-top: 40px;
      animation: fadeUp .7s .4s ease both;
    }
    .stat { text-align: center; }
    .stat-n {
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: #2C4A6E; font-size: 1.8rem; font-weight: 300; line-height: 1;
    }
    .stat-l { color: rgba(30,54,80,.35); font-size: .7rem; margin-top: 4px; letter-spacing: .06em; text-transform: uppercase; }
    .stat-sep { width: 1px; height: 36px; background: linear-gradient(180deg, transparent, rgba(44,74,110,.15), transparent); }

    @keyframes fadeDown {
      from { opacity:0; transform:translateY(-18px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }

    @media (max-width: 680px) {
      .paneles { flex-direction: column; }
      .divisor { flex-direction: row; padding: 0; }
      .divisor::before, .divisor::after { height: 1px; width: auto; flex: 1; }
      .panel:first-child { border-right: none; border-bottom: 1px solid rgba(201,169,110,.1); }
      .hero-logo-text { font-size: 2.2rem; }
      .hero-content { padding: 48px 16px 40px; }
    }
  `]
})
export class PortadaComponent implements OnInit {

  // Casitas flotantes del fondo
  readonly casitas = Array.from({ length: 18 }, (_, i) => ({
    ico:   ['🏠','🏡','🏘️','🏗️','🏙️'][i % 5],
    left:  (i * 6.3) % 100,
    size:  1.1 + (i % 4) * 0.45,
    dur:   14 + (i % 5) * 4,
    delay: -(i * 2.3)
  }));

  // Login usuario
  loginEmail    = '';
  loginPassword = '';
  errorLogin    = '';
  cargandoLogin = false;

  // Login admin (desplegable)
  mostrarFormAdmin = false;
  adminEmail       = '';
  adminPassword    = '';
  errorAdmin       = '';
  cargandoAdmin    = false;

  // Registro
  regForm: Usuario = this.regVacio();
  mensajeRegistro  = '';
  errorRegistro    = '';
  cargandoRegistro = false;

  readonly provincias = [
    'Álava','Albacete','Alicante','Almería','Asturias','Ávila','Badajoz',
    'Barcelona','Burgos','Cáceres','Cádiz','Cantabria','Castellón','Ciudad Real',
    'Córdoba','Cuenca','Girona','Granada','Guadalajara','Guipúzcoa','Huelva',
    'Huesca','Islas Baleares','Jaén','La Coruña','La Rioja','Las Palmas',
    'León','Lleida','Lugo','Madrid','Málaga','Murcia','Navarra','Orense',
    'Palencia','Pontevedra','Salamanca','Santa Cruz de Tenerife','Segovia',
    'Sevilla','Soria','Tarragona','Teruel','Toledo','Valencia','Valladolid',
    'Vizcaya','Zamora','Zaragoza'
  ];

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    // Si ya hay sesión activa, redirigir
    const logado = this.auth.estaLogado();
    console.log('[Portada] ngOnInit | logado:', logado, '| sesion:', this.auth.getSesion());
    if (logado) {
      this.redirigirSegunRol();
    }
  }

  // --- Login usuario ---
  login(): void {
    this.errorLogin   = '';
    this.cargandoLogin = true;
    this.auth.loginUsuario(this.loginEmail, this.loginPassword).subscribe({
      next: res => {
        this.cargandoLogin = false;
        if (res.result === 'OK') {
          this.router.navigate(['/explorar']);
        } else {
          this.errorLogin = res.error ?? 'Credenciales incorrectas.';
        }
      },
      error: () => { this.cargandoLogin = false; this.errorLogin = 'No se pudo conectar con el servidor.'; }
    });
  }

  // --- Login admin ---
  loginAdmin(): void {
    this.mostrarFormAdmin = !this.mostrarFormAdmin;
    this.errorAdmin = '';
  }

  hacerLoginAdmin(): void {
    this.errorAdmin    = '';
    this.cargandoAdmin = true;
    this.auth.loginAdmin(this.adminEmail, this.adminPassword).subscribe({
      next: res => {
        this.cargandoAdmin = false;
        if (res.result === 'OK') {
          this.router.navigate(['/usuarios']);
        } else {
          this.errorAdmin = res.error ?? 'Credenciales incorrectas.';
        }
      },
      error: () => { this.cargandoAdmin = false; this.errorAdmin = 'No se pudo conectar con el servidor.'; }
    });
  }

  // --- Registro ---
  registrar(): void {
    this.mensajeRegistro  = '';
    this.errorRegistro    = '';
    this.cargandoRegistro = true;
    this.api.anadeUsuario(this.regForm).subscribe({
      next: res => {
        this.cargandoRegistro = false;
        if (res.result === 'OK') {
          this.mensajeRegistro = '¡Cuenta creada! Ya puedes iniciar sesión.';
          this.loginEmail    = this.regForm.email;
          this.regForm = this.regVacio();
        } else {
          this.errorRegistro = 'No se pudo crear la cuenta. El email puede estar en uso.';
        }
      },
      error: () => { this.cargandoRegistro = false; this.errorRegistro = 'Error al conectar con el servidor.'; }
    });
  }

  private redirigirSegunRol(): void {
    const destino = this.auth.esAdmin() ? '/usuarios' : '/explorar';
    console.log('[Portada] redirigirSegunRol → ', destino);
    this.router.navigate([destino]);
  }

  private regVacio(): Usuario {
    return { nombre: '', apellidos: '', email: '', telefono: '', ciudad: '', provincia: '', password: '' };
  }
}
