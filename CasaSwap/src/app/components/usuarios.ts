import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { Usuario } from '../models/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <div class="panel-list">
        <div class="panel-header">
          <h2>Usuarios</h2>
          <button (click)="nuevoUsuario()">+ Nuevo</button>
        </div>

        <div *ngIf="error" class="msg error">{{ error }}</div>

        <ul class="lista">
          <li *ngFor="let u of usuarios"
              (click)="seleccionar(u)"
              [class.seleccionado]="u.id === seleccionado?.id">
            <strong>{{ u.nombre }} {{ u.apellidos }}</strong>
            <span class="sub">{{ u.email }}</span>
            <span class="badge">{{ u.provincia || '—' }}</span>
          </li>
          <li *ngIf="usuarios.length === 0" class="vacio">No hay usuarios registrados.</li>
        </ul>
      </div>

      <div class="panel-form">
        <div class="form-titulo">
          {{ seleccionado?.id ? 'Editar usuario' : 'Nuevo usuario' }}
          <span class="form-tag" *ngIf="seleccionado?.id">ID #{{ seleccionado?.id }}</span>
        </div>

        <form (ngSubmit)="guardar()" #f="ngForm" novalidate>

          <label>
            Nombre *
            <input name="nombre" [(ngModel)]="form.nombre" required minlength="2" maxlength="80"
                   autocomplete="given-name" #nom="ngModel" />
            <span class="field-error" *ngIf="nom.invalid && nom.touched">Obligatorio (2–80 caracteres).</span>
          </label>

          <label>
            Apellidos *
            <input name="apellidos" [(ngModel)]="form.apellidos" required minlength="2" maxlength="100"
                   autocomplete="family-name" #ape="ngModel" />
            <span class="field-error" *ngIf="ape.invalid && ape.touched">Obligatorio (2–100 caracteres).</span>
          </label>

          <label>
            Email *
            <input name="email" [(ngModel)]="form.email" required email maxlength="150" type="email"
                   autocomplete="email" #ema="ngModel" />
            <span class="field-error" *ngIf="ema.invalid && ema.touched">Email válido obligatorio.</span>
          </label>

          <label>
            Teléfono
            <input name="telefono" [(ngModel)]="form.telefono" maxlength="20" pattern="[0-9+\\s\\-]+"
                   autocomplete="tel" #tel="ngModel" />
            <span class="field-error" *ngIf="tel.invalid && tel.touched">Solo números y guiones.</span>
          </label>

          <div class="fila-2">
            <label>
              Ciudad
              <input name="ciudad" [(ngModel)]="form.ciudad" maxlength="80" autocomplete="address-level2" />
            </label>
            <label>
              Provincia
              <select name="provincia" [(ngModel)]="form.provincia">
                <option value="">— Selecciona —</option>
                <option *ngFor="let p of provincias" [value]="p">{{ p }}</option>
              </select>
            </label>
          </div>

          <label *ngIf="!seleccionado?.id">
            Contraseña *
            <div class="pwd-wrap">
              <input name="password" [(ngModel)]="form.password"
                     [type]="showPwd ? 'text' : 'password'"
                     [required]="!seleccionado?.id" minlength="4" maxlength="255"
                     autocomplete="new-password" #pwd="ngModel" />
              <button type="button" class="pwd-toggle" (click)="showPwd = !showPwd"
                      [attr.aria-label]="showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <!-- Eye icon -->
                <svg *ngIf="!showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Eye-off icon -->
                <svg *ngIf="showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <span class="field-error" *ngIf="pwd.invalid && pwd.touched">Mínimo 4 caracteres.</span>
          </label>

          <div class="botones">
            <button type="submit" [disabled]="f.invalid">Guardar</button>
            <button type="button" class="peligro" (click)="borrar()" [disabled]="!seleccionado?.id">Eliminar</button>
            <button type="button" class="secundario" (click)="nuevoUsuario()">Limpiar</button>
          </div>

        </form>
      </div>

    </div>
  `,
  styles: [`
    .page { display: grid; grid-template-columns: 330px 1fr; gap: 0; min-height: calc(100vh - 64px); }

    @media (max-width: 768px) {
      .page { grid-template-columns: 1fr; }
      .panel-list { max-height: 240px; overflow-y: auto; border-right: none; border-bottom: 1px solid rgba(201,169,110,.1); }
      .panel-form { padding: 24px 18px; }
    }

    /* ── Sidebar ── */
    .panel-list {
      background: #0d1020; border-right: 1px solid rgba(201,169,110,.1);
      padding: 24px 14px; overflow-y: auto;
    }
    .panel-form { background: #080B12; padding: 36px 44px; overflow-y: auto; }

    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    h2 {
      font-size: .68rem; font-weight: 600; color: rgba(201,169,110,.5);
      text-transform: uppercase; letter-spacing: .12em;
      margin: 0 0 14px; padding: 0 6px;
    }
    .panel-header h2 { margin: 0; }

    .lista { list-style: none; padding: 0; margin: 0; }
    .lista li {
      padding: 11px 13px; border-radius: 12px; cursor: pointer;
      border: 1px solid transparent; margin-bottom: 4px;
      transition: all .18s;
    }
    .lista li:hover { background: rgba(201,169,110,.05); border-color: rgba(201,169,110,.18); }
    .lista li.seleccionado { background: rgba(201,169,110,.09); border-color: rgba(201,169,110,.3); }
    .lista li strong { display: block; font-size: .92rem; color: #F5F0E8; font-weight: 600; }
    .lista li .sub { font-size: .77rem; color: rgba(245,240,232,.35); display: block; margin-top: 2px; }
    .lista li.vacio { color: rgba(245,240,232,.25); font-size: .87rem; text-align: center; padding: 24px; cursor: default; }

    .badge {
      display: inline-block;
      background: rgba(201,169,110,.1); border: 1px solid rgba(201,169,110,.2);
      color: rgba(201,169,110,.7);
      font-size: .65rem; font-weight: 600;
      padding: 2px 9px; border-radius: 100px; margin-top: 5px;
      letter-spacing: .04em;
    }

    /* ── Panel formulario ── */
    .form-titulo {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.5rem; font-weight: 400; color: #F5F0E8;
      margin-bottom: 24px; display: flex; align-items: center; gap: 12px;
    }
    .form-tag {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: .68rem; font-weight: 600; padding: 3px 11px; border-radius: 100px;
      background: rgba(201,169,110,.1); color: #C9A96E; border: 1px solid rgba(201,169,110,.25);
      letter-spacing: .04em;
    }

    label {
      display: flex; flex-direction: column; font-size: .75rem;
      color: rgba(245,240,232,.45); margin-bottom: 14px;
      font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
    }
    input, select {
      margin-top: 6px; padding: 10px 14px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(201,169,110,.15);
      border-radius: 12px; color: #F5F0E8; font-size: .91rem;
      transition: all .2s; font-family: inherit; outline: none;
    }
    input::placeholder { color: rgba(245,240,232,.22); }
    input:focus, select:focus {
      border-color: rgba(201,169,110,.5);
      background: rgba(255,255,255,.07);
      box-shadow: 0 0 0 3px rgba(201,169,110,.1);
    }
    input.ng-invalid.ng-touched { border-color: rgba(212,160,160,.5); }
    select option { background: #0d1020; color: #F5F0E8; }

    /* ── Password toggle ── */
    .pwd-wrap { position: relative; margin-top: 6px; }
    .pwd-wrap input { margin-top: 0; width: 100%; padding-right: 44px; }
    .pwd-toggle {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: rgba(245,240,232,.35); cursor: pointer;
      padding: 4px; display: flex; align-items: center; justify-content: center;
      box-shadow: none; transform: translateY(-50%) !important;
      transition: color .2s;
    }
    .pwd-toggle:hover { color: rgba(245,240,232,.7); transform: translateY(-50%) !important; }
    .pwd-toggle svg { width: 17px; height: 17px; }

    .fila-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-error { color: #D4A0A0; font-size: .73rem; margin-top: 3px; font-weight: 400; text-transform: none; letter-spacing: 0; }
    .botones { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }

    button {
      padding: 10px 22px; border: none; border-radius: 100px;
      cursor: pointer; font-size: .87rem; font-weight: 700;
      background: linear-gradient(135deg, #C9A96E, #D4A574, #b8924d);
      color: #080B12; transition: all .2s;
      box-shadow: 0 4px 16px rgba(201,169,110,.3);
    }
    button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,169,110,.45); }
    button:active { transform: translateY(0); }
    button:disabled { opacity: .35; cursor: not-allowed; transform: none; box-shadow: none; }
    button.peligro {
      background: rgba(212,160,160,.12) !important;
      border: 1px solid rgba(212,160,160,.3) !important;
      color: #D4A0A0 !important; box-shadow: none !important;
    }
    button.peligro:hover:not(:disabled) { background: rgba(212,160,160,.2) !important; box-shadow: none !important; }
    button.secundario {
      background: rgba(255,255,255,.06) !important;
      border: 1px solid rgba(255,255,255,.1) !important;
      color: rgba(245,240,232,.45) !important; box-shadow: none !important;
    }
    button.secundario:hover:not(:disabled) {
      background: rgba(255,255,255,.1) !important;
      color: rgba(245,240,232,.7) !important;
      transform: none !important;
    }

    .msg { padding: 10px 14px; border-radius: 10px; font-size: .85rem; margin-bottom: 16px; }
    .msg.error { background: rgba(212,160,160,.1); border: 1px solid rgba(212,160,160,.25); color: #D4A0A0; }
  `]
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  seleccionado: Usuario | null = null;
  form: Usuario = this.vacio();

  error   = '';
  showPwd = false;

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

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.error = '';
    this.api.listarUsuarios().subscribe({
      next: data => this.usuarios = data,
      error: () => this.error = 'No se pudo conectar con el servidor.'
    });
  }

  seleccionar(u: Usuario): void {
    this.seleccionado = u;
    this.form = { ...u, password: '' };
    this.showPwd = false;
  }

  nuevoUsuario(): void {
    this.seleccionado = null;
    this.form = this.vacio();
    this.showPwd = false;
  }

  guardar(): void {
    const op = this.seleccionado?.id
      ? this.api.modificaUsuario(this.form)
      : this.api.anadeUsuario(this.form);

    op.subscribe({
      next: res => {
        if (res.result === 'OK') {
          this.toast.show('Usuario guardado correctamente.');
          this.cargar();
          this.nuevoUsuario();
        } else {
          this.toast.show('No se pudo guardar el usuario.', 'error');
        }
      },
      error: () => this.toast.show('Error al conectar con el servidor.', 'error')
    });
  }

  borrar(): void {
    if (!this.seleccionado?.id) return;
    if (!confirm(`¿Eliminar al usuario "${this.seleccionado.nombre} ${this.seleccionado.apellidos}"? Se eliminarán también sus casas.`)) return;
    this.api.borraUsuario(this.seleccionado.id).subscribe({
      next: res => {
        if (res.result === 'OK') {
          this.toast.show('Usuario eliminado.');
          this.nuevoUsuario();
          this.cargar();
        } else {
          this.toast.show('No se pudo eliminar el usuario.', 'error');
        }
      },
      error: () => this.toast.show('Error al conectar con el servidor.', 'error')
    });
  }

  private vacio(): Usuario {
    return { nombre: '', apellidos: '', email: '', telefono: '', ciudad: '', provincia: '', password: '' };
  }
}
