import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { Casa } from '../models/casa';
import { Usuario } from '../models/usuario';

@Component({
  selector: 'app-casas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <div class="panel-list">
        <div class="panel-header">
          <h2>Casas</h2>
          <button (click)="nuevaCasa()">+ Nueva</button>
        </div>

        <div *ngIf="error" class="msg error">{{ error }}</div>

        <ul class="lista">
          <li *ngFor="let c of casas"
              (click)="seleccionar(c)"
              [class.seleccionado]="c.id === seleccionada?.id">
            <strong>{{ c.titulo }}</strong>
            <span class="sub">{{ c.ciudad }}, {{ c.provincia }}</span>
            <div class="meta">
              <span class="badge tipo">{{ c.tipo_vivienda }}</span>
              <span class="badge" [class.verde]="c.disponible == 1" [class.gris]="c.disponible != 1">
                {{ c.disponible == 1 ? 'Disponible' : 'No disponible' }}
              </span>
            </div>
          </li>
          <li *ngIf="casas.length === 0" class="vacio">No hay casas registradas.</li>
        </ul>
      </div>

      <div class="panel-form">
        <div class="form-titulo">
          {{ seleccionada?.id ? 'Editar casa' : 'Nueva casa' }}
          <span class="form-tag" *ngIf="seleccionada?.id">ID #{{ seleccionada?.id }}</span>
        </div>

        <form (ngSubmit)="guardar()" #f="ngForm" novalidate>

          <label>
            Propietario *
            <select name="usuario_id" [(ngModel)]="form.usuario_id" required #uid="ngModel">
              <option [value]="0">— Selecciona propietario —</option>
              <option *ngFor="let u of usuarios" [value]="u.id">{{ u.nombre }} {{ u.apellidos }}</option>
            </select>
            <span class="field-error" *ngIf="uid.invalid && uid.touched">Selecciona un propietario.</span>
          </label>

          <label>
            Título *
            <input name="titulo" [(ngModel)]="form.titulo" required minlength="5" maxlength="150" #tit="ngModel" />
            <span class="field-error" *ngIf="tit.invalid && tit.touched">Obligatorio (5–150 caracteres).</span>
          </label>

          <label>
            Descripción
            <textarea name="descripcion" [(ngModel)]="form.descripcion" rows="3" maxlength="500"></textarea>
          </label>

          <label>
            Dirección
            <input name="direccion" [(ngModel)]="form.direccion" maxlength="255" />
          </label>

          <div class="fila-2">
            <label>
              Ciudad *
              <input name="ciudad" [(ngModel)]="form.ciudad" required maxlength="80" #ciu="ngModel" />
              <span class="field-error" *ngIf="ciu.invalid && ciu.touched">Obligatorio.</span>
            </label>
            <label>
              Provincia *
              <select name="provincia" [(ngModel)]="form.provincia" required #prov="ngModel">
                <option value="">— Selecciona —</option>
                <option *ngFor="let p of provincias" [value]="p">{{ p }}</option>
              </select>
              <span class="field-error" *ngIf="prov.invalid && prov.touched">Obligatorio.</span>
            </label>
          </div>

          <div class="fila-2">
            <label>
              Tipo de vivienda *
              <select name="tipo_vivienda" [(ngModel)]="form.tipo_vivienda" required>
                <option value="piso">Piso</option>
                <option value="casa">Casa</option>
                <option value="chalet">Chalet</option>
                <option value="apartamento">Apartamento</option>
              </select>
            </label>
            <label>
              Disponible
              <select name="disponible" [(ngModel)]="form.disponible">
                <option [value]="1">Sí</option>
                <option [value]="0">No</option>
              </select>
            </label>
          </div>

          <div class="fila-2">
            <label>
              Habitaciones *
              <input name="num_habitaciones" [(ngModel)]="form.num_habitaciones"
                     type="number" min="1" max="20" required #hab="ngModel" />
              <span class="field-error" *ngIf="hab.invalid && hab.touched">Entre 1 y 20.</span>
            </label>
            <label>
              Capacidad (personas) *
              <input name="capacidad" [(ngModel)]="form.capacidad"
                     type="number" min="1" max="30" required #cap="ngModel" />
              <span class="field-error" *ngIf="cap.invalid && cap.touched">Entre 1 y 30.</span>
            </label>
          </div>

          <!-- Subida de imagen -->
          <label>Imagen de la casa</label>
          <div class="upload-area" (click)="inputFile.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <input #inputFile type="file" accept="image/*" style="display:none" (change)="onFileChange($event)" />
            <div *ngIf="!previewUrl" class="upload-placeholder">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <p>Haz clic o arrastra una imagen aquí</p>
              <p class="upload-sub">JPG, PNG, GIF o WEBP · máx. 5 MB</p>
            </div>
            <div *ngIf="previewUrl" class="upload-preview" [style.background-image]="'url(' + previewUrl + ')'">
              <button type="button" class="btn-quitar" (click)="quitarImagen($event)">✕ Quitar</button>
            </div>
          </div>
          <div *ngIf="subiendoImagen" class="msg-subiendo">Subiendo imagen...</div>
          <div *ngIf="errorImagen" class="msg error">{{ errorImagen }}</div>

          <div class="botones">
            <button type="submit" [disabled]="f.invalid || form.usuario_id == 0">Guardar</button>
            <button type="button" class="peligro" (click)="borrar()" [disabled]="!seleccionada?.id">Eliminar</button>
            <button type="button" class="secundario" (click)="nuevaCasa()">Limpiar</button>
          </div>

        </form>
      </div>

    </div>
  `,
  styles: [`
    .page { display: grid; grid-template-columns: 350px 1fr; gap: 0; min-height: calc(100vh - 64px); }

    @media (max-width: 768px) {
      .page { grid-template-columns: 1fr; }
      .panel-list {
        max-height: 240px; overflow-y: auto;
        border-right: none; border-bottom: 1px solid rgba(201,169,110,.1);
      }
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
      text-transform: uppercase; letter-spacing: .12em; margin: 0 0 14px; padding: 0 6px;
    }
    .panel-header h2 { margin: 0; }

    .lista { list-style: none; padding: 0; margin: 0; }
    .lista li {
      padding: 11px 13px; border-radius: 12px; cursor: pointer;
      border: 1px solid transparent; margin-bottom: 4px; transition: all .18s;
    }
    .lista li:hover { background: rgba(201,169,110,.05); border-color: rgba(201,169,110,.18); }
    .lista li.seleccionado { background: rgba(201,169,110,.09); border-color: rgba(201,169,110,.3); }
    .lista li strong { display: block; font-size: .9rem; color: #F5F0E8; font-weight: 600; }
    .lista li .sub { font-size: .76rem; color: rgba(245,240,232,.35); display: block; margin-bottom: 5px; }
    .lista li.vacio { color: rgba(245,240,232,.25); font-size: .87rem; text-align: center; padding: 24px; cursor: default; }

    .meta { display: flex; gap: 5px; flex-wrap: wrap; }
    .badge {
      display: inline-block;
      background: rgba(201,169,110,.1); border: 1px solid rgba(201,169,110,.2);
      color: rgba(201,169,110,.8);
      font-size: .65rem; font-weight: 600; padding: 2px 9px; border-radius: 100px;
      letter-spacing: .04em;
    }
    .badge.tipo  { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1); color: rgba(245,240,232,.5); }
    .badge.verde { background: rgba(56,161,105,.15); border-color: rgba(56,161,105,.3); color: #68d391; }
    .badge.gris  { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.08); color: rgba(245,240,232,.3); }

    /* ── Panel form ── */
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
    input, select, textarea {
      margin-top: 6px; padding: 10px 14px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(201,169,110,.15);
      border-radius: 12px; color: #F5F0E8; font-size: .91rem;
      transition: all .2s; font-family: inherit; outline: none;
    }
    input::placeholder { color: rgba(245,240,232,.22); }
    input:focus, select:focus, textarea:focus {
      border-color: rgba(201,169,110,.5);
      background: rgba(255,255,255,.07);
      box-shadow: 0 0 0 3px rgba(201,169,110,.1);
    }
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched { border-color: rgba(212,160,160,.5); }
    select option { background: #0d1020; color: #F5F0E8; }
    textarea { resize: vertical; }
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

    .upload-area {
      border: 1px dashed rgba(201,169,110,.25); border-radius: 14px;
      cursor: pointer; margin-bottom: 14px; overflow: hidden;
      transition: all .2s; background: rgba(255,255,255,.02);
    }
    .upload-area:hover { border-color: rgba(201,169,110,.5); background: rgba(201,169,110,.04); }
    .upload-placeholder { padding: 28px 16px; text-align: center; color: rgba(245,240,232,.3); }
    .upload-icon { width: 2rem; height: 2rem; display: block; margin: 0 auto 10px; opacity: .4; }
    .upload-placeholder p { font-size: .83rem; margin-bottom: 4px; }
    .upload-sub { font-size: .74rem !important; color: rgba(245,240,232,.2); }
    .upload-preview { height: 180px; background: center/cover no-repeat; position: relative; }
    .btn-quitar {
      position: absolute; top: 8px; right: 8px;
      background: rgba(8,11,18,.75); color: rgba(245,240,232,.8);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 8px; padding: 5px 10px; font-size: .77rem; cursor: pointer;
      transition: all .15s;
    }
    .btn-quitar:hover { background: rgba(212,160,160,.2); color: #D4A0A0; border-color: rgba(212,160,160,.3); }
    .msg-subiendo { font-size: .82rem; color: rgba(201,169,110,.6); margin-bottom: 10px; }
  `]
})
/**
 * Panel de administracion de casas. Permite al administrador listar, editar
 * y eliminar cualquier vivienda publicada en la plataforma.
 */
export class CasasComponent implements OnInit {

  @ViewChild('inputFile') inputFileRef!: ElementRef<HTMLInputElement>;

  casas: Casa[] = [];
  usuarios: Usuario[] = [];
  seleccionada: Casa | null = null;
  form: Casa = this.vacio();

  error          = '';
  errorImagen    = '';
  previewUrl     = '';
  subiendoImagen = false;
  archivoSeleccionado: File | null = null;

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

  ngOnInit(): void {
    this.cargar();
    this.cargarUsuarios();
  }

  cargar(): void {
    this.error = '';
    this.api.listarCasas().subscribe({
      next: data => this.casas = data,
      error: () => this.error = 'No se pudo conectar con el servidor.'
    });
  }

  cargarUsuarios(): void {
    this.api.listarUsuarios().subscribe({
      next: data => this.usuarios = data
    });
  }

  seleccionar(c: Casa): void {
    this.seleccionada = c;
    this.form = { ...c };
    this.previewUrl = c.imagen_url || '';
    this.archivoSeleccionado = null;
  }

  nuevaCasa(): void {
    this.seleccionada = null;
    this.form = this.vacio();
    this.previewUrl = '';
    this.archivoSeleccionado = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) this.procesarArchivo(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.procesarArchivo(file);
  }

  private procesarArchivo(file: File): void {
    this.errorImagen = '';
    const permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!permitidos.includes(file.type)) {
      this.errorImagen = 'Formato no válido. Usa JPG, PNG, GIF o WEBP.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorImagen = 'La imagen supera los 5 MB.';
      return;
    }
    this.archivoSeleccionado = file;
    const reader = new FileReader();
    reader.onload = e => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  quitarImagen(event: MouseEvent): void {
    event.stopPropagation();
    this.previewUrl = '';
    this.archivoSeleccionado = null;
    this.form.imagen_url = '';
    if (this.inputFileRef) this.inputFileRef.nativeElement.value = '';
  }

  guardar(): void {
    if (this.archivoSeleccionado) {
      this.subiendoImagen = true;
      this.api.subirImagen(this.archivoSeleccionado).subscribe({
        next: res => {
          this.subiendoImagen = false;
          if (res.result === 'OK' && res.url) {
            this.form.imagen_url = res.url;
            this.guardarCasa();
          } else {
            this.errorImagen = res.error || 'No se pudo subir la imagen.';
          }
        },
        error: () => { this.subiendoImagen = false; this.errorImagen = 'Error al subir la imagen.'; }
      });
    } else {
      this.guardarCasa();
    }
  }

  private guardarCasa(): void {
    const op = this.seleccionada?.id
      ? this.api.modificaCasa(this.form)
      : this.api.anadeCasa(this.form);

    op.subscribe({
      next: res => {
        if (res.result === 'OK') {
          this.toast.show('Casa guardada correctamente.');
          this.cargar();
          this.nuevaCasa();
        } else {
          this.toast.show('No se pudo guardar la casa.', 'error');
        }
      },
      error: () => this.toast.show('Error al conectar con el servidor.', 'error')
    });
  }

  borrar(): void {
    if (!this.seleccionada?.id) return;
    if (!confirm(`¿Eliminar la casa "${this.seleccionada.titulo}"?`)) return;
    this.api.borraCasa(this.seleccionada.id).subscribe({
      next: res => {
        if (res.result === 'OK') {
          this.toast.show('Casa eliminada.');
          this.nuevaCasa();
          this.cargar();
        } else {
          this.toast.show('No se pudo eliminar la casa.', 'error');
        }
      },
      error: () => this.toast.show('Error al conectar con el servidor.', 'error')
    });
  }

  private vacio(): Casa {
    return {
      usuario_id: 0, titulo: '', descripcion: '', direccion: '',
      ciudad: '', provincia: '', tipo_vivienda: 'piso',
      num_habitaciones: 1, capacidad: 2, disponible: 1, imagen_url: ''
    };
  }
}
