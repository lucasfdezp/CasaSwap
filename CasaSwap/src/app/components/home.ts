import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Casa } from '../models/casa';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hero">
      <h1>Intercambia tu casa en España</h1>
      <p>Viaja sin gastar en alojamiento. Tú en su casa, ellos en la tuya.</p>

      <div class="buscador">
        <select [(ngModel)]="filtroProvincia" (change)="filtrar()">
          <option value="">Todas las provincias</option>
          <option *ngFor="let p of provincias" [value]="p">{{ p }}</option>
        </select>
        <select [(ngModel)]="filtroTipo" (change)="filtrar()">
          <option value="">Cualquier tipo</option>
          <option value="piso">Piso</option>
          <option value="casa">Casa</option>
          <option value="chalet">Chalet</option>
          <option value="apartamento">Apartamento</option>
        </select>
        <button (click)="limpiarFiltros()">Limpiar filtros</button>
      </div>
    </div>

    <div class="contenido">
      <p class="contador" *ngIf="casasFiltradas.length > 0">
        {{ casasFiltradas.length }} {{ casasFiltradas.length === 1 ? 'casa disponible' : 'casas disponibles' }}
      </p>

      <div *ngIf="error" class="msg error">{{ error }}</div>

      <div class="grid" *ngIf="casasFiltradas.length > 0">
        <div class="tarjeta" *ngFor="let c of casasFiltradas" (click)="verDetalle(c)">
          <div class="tarjeta-img" [style.background-image]="c.imagen_url ? 'url(' + c.imagen_url + ')' : 'none'">
            <div class="tarjeta-img-placeholder" *ngIf="!c.imagen_url">🏠</div>
            <span class="badge-tipo">{{ c.tipo_vivienda }}</span>
          </div>
          <div class="tarjeta-body">
            <h3>{{ c.titulo }}</h3>
            <p class="lugar">📍 {{ c.ciudad }}, {{ c.provincia }}</p>
            <p class="info">
              🛏 {{ c.num_habitaciones }} hab. &nbsp;·&nbsp; 👥 {{ c.capacidad }} personas
            </p>
            <p class="descripcion" *ngIf="c.descripcion">{{ c.descripcion | slice:0:90 }}{{ c.descripcion!.length > 90 ? '…' : '' }}</p>
            <p class="propietario">Propietario: <strong>{{ c.propietario }}</strong></p>
          </div>
        </div>
      </div>

      <div class="vacio" *ngIf="casasFiltradas.length === 0 && !error">
        <span>🏡</span>
        <p>No hay casas disponibles con esos filtros.</p>
      </div>
    </div>

    <!-- Modal detalle -->
    <div class="overlay" *ngIf="detalle" (click)="cerrarDetalle()">
      <div class="modal" (click)="$event.stopPropagation()">
        <button class="cerrar" (click)="cerrarDetalle()">✕</button>

        <div class="modal-img" [style.background-image]="detalle.imagen_url ? 'url(' + detalle.imagen_url + ')' : 'none'">
          <div class="modal-img-placeholder" *ngIf="!detalle.imagen_url">🏠</div>
        </div>

        <div class="modal-body">
          <span class="badge-tipo grande">{{ detalle.tipo_vivienda }}</span>
          <h2>{{ detalle.titulo }}</h2>
          <p class="lugar">📍 {{ detalle.direccion ? detalle.direccion + ', ' : '' }}{{ detalle.ciudad }}, {{ detalle.provincia }}</p>

          <div class="modal-info">
            <span>🛏 {{ detalle.num_habitaciones }} habitaciones</span>
            <span>👥 {{ detalle.capacidad }} personas</span>
          </div>

          <p class="descripcion-completa" *ngIf="detalle.descripcion">{{ detalle.descripcion }}</p>

          <div class="contacto">
            <p><strong>Propietario:</strong> {{ detalle.propietario }}</p>
            <p *ngIf="detalle.telefono_propietario">
              <strong>Teléfono:</strong>
              <a [href]="'tel:' + detalle.telefono_propietario">{{ detalle.telefono_propietario }}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Hero */
    .hero {
      background: linear-gradient(135deg, #080B12 0%, #0d1020 50%, #080B12 100%);
      position: relative; overflow: hidden;
      color: #F5F0E8; text-align: center; padding: 72px 24px 56px;
      border-bottom: 1px solid rgba(201,169,110,.1);
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(201,169,110,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }
    .hero h1 {
      position: relative;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.6rem; font-weight: 400; margin-bottom: 12px; color: #F5F0E8;
    }
    .hero p  { position: relative; font-size: 1rem; color: rgba(245,240,232,.55); margin-bottom: 32px; }

    .buscador { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; position: relative; }
    .buscador select {
      padding: 10px 20px; border-radius: 100px;
      background: rgba(255,255,255,.05); border: 1px solid rgba(201,169,110,.2);
      color: #F5F0E8; min-width: 180px; font-size: .88rem; cursor: pointer;
      font-family: inherit; outline: none; transition: all .2s;
    }
    .buscador select:hover { background: rgba(255,255,255,.08); border-color: rgba(201,169,110,.4); }
    .buscador select option { color: #F5F0E8; background: #0d1020; }
    .buscador button {
      padding: 10px 22px; border-radius: 100px;
      border: 1px solid rgba(245,240,232,.2); background: transparent;
      color: rgba(245,240,232,.6); font-weight: 500; cursor: pointer;
      transition: all .2s; font-size: .88rem; font-family: inherit;
    }
    .buscador button:hover { background: rgba(255,255,255,.05); border-color: rgba(245,240,232,.4); color: #F5F0E8; }

    /* Contenido */
    .contenido { max-width: 1200px; margin: 0 auto; padding: 36px 24px; }
    .contador { color: rgba(245,240,232,.35); font-size: .86rem; margin-bottom: 22px; letter-spacing: .04em; }

    /* Grid */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 24px; }

    .tarjeta {
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(201,169,110,.12);
      border-radius: 20px; overflow: hidden; cursor: pointer;
      backdrop-filter: blur(16px);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 8px 32px rgba(0,0,0,.3);
      transition: all .3s cubic-bezier(.4,0,.2,1);
    }
    .tarjeta:hover {
      transform: translateY(-5px);
      border-color: rgba(201,169,110,.28);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 20px 56px rgba(0,0,0,.45);
    }

    .tarjeta-img {
      height: 185px; background: rgba(255,255,255,.03) center/cover no-repeat;
      position: relative; display: flex; align-items: center; justify-content: center;
    }
    .tarjeta-img-placeholder { font-size: 3rem; opacity: .3; }
    .badge-tipo {
      position: absolute; top: 11px; left: 11px;
      background: rgba(8,11,18,.7); color: rgba(245,240,232,.8);
      font-size: .66rem; font-weight: 700;
      padding: 3px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: .06em;
      border: 1px solid rgba(201,169,110,.2);
    }
    .badge-tipo.grande {
      position: static; display: inline-block;
      background: rgba(201,169,110,.12); border: 1px solid rgba(201,169,110,.25);
      color: #C9A96E; margin-bottom: 10px; font-size: .72rem;
    }

    .tarjeta-body { padding: 18px 18px 16px; }
    .tarjeta-body h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.15rem; font-weight: 500; color: #F5F0E8; margin-bottom: 6px; }
    .lugar { font-size: .8rem; color: rgba(245,240,232,.45); margin-bottom: 3px; }
    .info  { font-size: .78rem; color: rgba(245,240,232,.3); margin-bottom: 7px; }
    .descripcion { font-size: .79rem; color: rgba(245,240,232,.4); margin-bottom: 8px; line-height: 1.5; }
    .propietario { font-size: .78rem; color: rgba(245,240,232,.3); }
    .propietario strong { color: rgba(245,240,232,.55); font-weight: 500; }

    /* Vacío */
    .vacio { text-align: center; padding: 72px 0; color: rgba(245,240,232,.3); }
    .vacio span { font-size: 3rem; display: block; margin-bottom: 16px; opacity: .3; }

    /* Mensajes */
    .msg.error { background: rgba(212,160,160,.1); border: 1px solid rgba(212,160,160,.25); color: #D4A0A0;
      padding: 10px 14px; border-radius: 10px; font-size: .87rem; margin-bottom: 20px; }

    /* Modal */
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.75);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; padding: 16px;
      backdrop-filter: blur(8px);
    }
    .modal {
      background: #0d1020; border: 1px solid rgba(201,169,110,.18);
      border-radius: 24px;
      max-width: 560px; width: 100%; max-height: 90vh;
      overflow-y: auto; position: relative;
      box-shadow: 0 40px 100px rgba(0,0,0,.6);
    }
    .cerrar {
      position: absolute; top: 14px; right: 16px; z-index: 1;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); color: rgba(245,240,232,.7);
      width: 32px; height: 32px; border-radius: 50%;
      cursor: pointer; font-size: .9rem; display: flex; align-items: center; justify-content: center;
      transition: all .18s;
    }
    .cerrar:hover { background: rgba(212,160,160,.15); border-color: rgba(212,160,160,.3); color: #D4A0A0; }
    .modal-img {
      height: 230px; background: rgba(255,255,255,.03) center/cover no-repeat;
      border-radius: 24px 24px 0 0;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-img-placeholder { font-size: 4rem; opacity: .2; }
    .modal-body { padding: 26px; }
    .modal-body h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.6rem; font-weight: 400; color: #F5F0E8; margin-bottom: 8px; }
    .modal-info { display: flex; gap: 16px; margin: 14px 0; font-size: .86rem; color: rgba(245,240,232,.5); }
    .descripcion-completa { color: rgba(245,240,232,.5); font-size: .9rem; line-height: 1.7; margin: 14px 0; }
    .contacto { background: rgba(255,255,255,.04); border-radius: 12px; padding: 14px; margin-top: 16px; border: 1px solid rgba(201,169,110,.1); }
    .contacto p { font-size: .89rem; color: rgba(245,240,232,.5); margin-bottom: 6px; }
    .contacto strong { color: rgba(245,240,232,.75); font-weight: 500; }
    .contacto a { color: #C9A96E; text-decoration: none; font-weight: 500; }
    .contacto a:hover { text-decoration: underline; }
  `]
})
export class HomeComponent implements OnInit {

  casas: Casa[] = [];
  casasFiltradas: Casa[] = [];
  detalle: Casa | null = null;
  error = '';

  filtroProvincia = '';
  filtroTipo = '';

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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.listarCasasDisponibles().subscribe({
      next: data => { this.casas = data; this.filtrar(); },
      error: () => this.error = 'No se pudo cargar el listado. Comprueba que el servidor está activo.'
    });
  }

  filtrar(): void {
    this.casasFiltradas = this.casas.filter(c => {
      const prov = !this.filtroProvincia || c.provincia === this.filtroProvincia;
      const tipo = !this.filtroTipo || c.tipo_vivienda === this.filtroTipo;
      return prov && tipo;
    });
  }

  limpiarFiltros(): void {
    this.filtroProvincia = '';
    this.filtroTipo = '';
    this.filtrar();
  }

  verDetalle(c: Casa): void { this.detalle = c; }
  cerrarDetalle(): void { this.detalle = null; }
}
