import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Usuario } from '../models/usuario';
import { Casa } from '../models/casa';
import { Solicitud, EstadoSolicitud } from '../models/solicitud';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pagina">

      <!-- Cargando -->
      @if (cargando()) {
        <div class="estado-carga">
          <span class="spinner"></span>
          <p>Cargando perfil...</p>
        </div>
      }

      <!-- Error -->
      @if (errorGeneral() && !cargando()) {
        <div class="estado-error">
          <div class="error-ico" aria-hidden="true">⚠️</div>
          <p>{{ errorGeneral() }}</p>
          <a routerLink="/" class="btn-primary">Volver al inicio</a>
        </div>
      }

      <!-- Contenido -->
      @if (!cargando() && !errorGeneral()) {

        <!-- Cabecera -->
        <div class="cabecera">
          <div class="cabecera-bg" aria-hidden="true"></div>
          <div class="avatar">{{ iniciales() }}</div>
          <div class="cabecera-info">
            <h1>{{ usuario()?.nombre }} {{ usuario()?.apellidos }}</h1>
            <p class="cab-email">{{ usuario()?.email }}</p>
            <div class="cab-badges">
              @if (usuario()?.provincia) {
                <span class="badge-provincia">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       style="width:12px;height:12px" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ usuario()?.provincia }}
                </span>
              }
            </div>
          </div>

          <!-- Saldo de puntos -->
          <div class="puntos-saldo" aria-label="Tu saldo de puntos">
            <span class="puntos-saldo-ico" aria-hidden="true">◈</span>
            <div>
              <span class="puntos-saldo-num">{{ auth.puntos() }}</span>
              <span class="puntos-saldo-lbl">puntos disponibles</span>
            </div>
          </div>
        </div>

        <div class="contenido">

          <!-- Panel izquierdo: datos personales -->
          <div class="panel">
            <h2 class="panel-title">
              <span class="h2-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              Mis datos
            </h2>

            @if (formUsuario) {
              <form (ngSubmit)="guardarPerfil()" #fPerfil="ngForm" novalidate>

                <label class="campo">
                  Nombre *
                  <input name="nombre" [(ngModel)]="formUsuario.nombre" required minlength="2" maxlength="80"
                         autocomplete="given-name" #pn="ngModel" />
                  @if (pn.invalid && pn.touched) {
                    <span class="field-error">Obligatorio (2–80 caracteres).</span>
                  }
                </label>

                <label class="campo">
                  Apellidos *
                  <input name="apellidos" [(ngModel)]="formUsuario.apellidos" required minlength="2" maxlength="100"
                         autocomplete="family-name" #pa="ngModel" />
                  @if (pa.invalid && pa.touched) {
                    <span class="field-error">Obligatorio.</span>
                  }
                </label>

                <label class="campo">
                  Email *
                  <input name="email" [(ngModel)]="formUsuario.email" type="email" required email maxlength="150"
                         autocomplete="email" #pe="ngModel" />
                  @if (pe.invalid && pe.touched) {
                    <span class="field-error">Email válido obligatorio.</span>
                  }
                </label>

                <label class="campo">
                  Teléfono
                  <input name="telefono" [(ngModel)]="formUsuario.telefono" maxlength="20"
                         autocomplete="tel" placeholder="600 000 000" />
                </label>

                <div class="fila-2">
                  <label class="campo">
                    Ciudad
                    <input name="ciudad" [(ngModel)]="formUsuario.ciudad" maxlength="80"
                           autocomplete="address-level2" />
                  </label>
                  <label class="campo">
                    Provincia
                    <select name="provincia" [(ngModel)]="formUsuario.provincia">
                      <option value="">— Selecciona —</option>
                      @for (p of provincias; track p) {
                        <option [value]="p">{{ p }}</option>
                      }
                    </select>
                  </label>
                </div>

                <button type="submit" class="btn-primary" [disabled]="fPerfil.invalid || guardandoPerfil()">
                  {{ guardandoPerfil() ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </form>

              <div class="zona-peligro">
                <hr class="separador-peligro" />
                <p class="peligro-aviso">Zona peligrosa: esta acción es irreversible.</p>
                <button type="button" class="btn-danger" (click)="borrarCuenta()">
                  Eliminar mi cuenta
                </button>
              </div>
            }
          </div>

          <!-- Panel derecho: mis casas -->
          <div class="panel">
            <div class="casas-header">
              <h2 class="panel-title" style="margin:0">
                <span class="h2-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </span>
                Mis casas
              </h2>
              @if (!editandoCasa()) {
                <button (click)="nuevaCasa()" class="btn-primary btn-sm">+ Añadir casa</button>
              }
            </div>

            <!-- Listado -->
            @if (!editandoCasa()) {
              <div class="casas-lista">
                @if (casas().length === 0) {
                  <div class="vacio">
                    <div class="vacio-ico" aria-hidden="true">🏠</div>
                    <p>Aún no tienes ninguna casa publicada.</p>
                    <p class="vacio-sub">Añade tu primera casa para empezar a intercambiar.</p>
                  </div>
                }
                @for (c of casas(); track c.id) {
                  <div class="tarjeta-casa" (click)="editarCasa(c)">
                    <div class="tarjeta-img"
                         [style.background-image]="(c.imagen_url || (c.fotos && c.fotos[0])) ? 'url(' + (c.imagen_url || c.fotos![0]) + ')' : 'none'">
                      @if (!c.imagen_url && !(c.fotos && c.fotos[0])) {
                        <div class="img-placeholder" aria-hidden="true">🏠</div>
                      }
                      @if (c.fotos && c.fotos.length > 1) {
                        <span class="badge-n-fotos">{{ c.fotos.length }} fotos</span>
                      }
                      <span class="badge-tipo">{{ c.tipo_vivienda }}</span>
                      <span class="badge-estado" [class.verde]="c.disponible == 1" [class.gris]="c.disponible != 1">
                        {{ c.disponible == 1 ? 'Disponible' : 'No disponible' }}
                      </span>
                    </div>
                    <div class="tarjeta-info">
                      <strong>{{ c.titulo }}</strong>
                      <span class="info-row">
                        <svg style="width:11px;height:11px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {{ c.barrio ? c.barrio + ', ' : '' }}{{ c.ciudad }}, {{ c.provincia }}
                      </span>
                      <span class="info-row">
                        {{ c.num_habitaciones }} hab · {{ c.capacidad }} personas
                      </span>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Formulario añadir/editar -->
            @if (editandoCasa()) {
              <div class="form-casa">
                <div class="form-casa-header">
                  <h3>{{ formCasa.id ? 'Editar casa' : 'Nueva casa' }}</h3>
                  <button type="button" class="btn-back" (click)="cancelarCasa()">← Volver</button>
                </div>

                <form (ngSubmit)="guardarCasa()" #fCasa="ngForm" novalidate>

                  <label class="campo">
                    Título *
                    <input name="titulo" [(ngModel)]="formCasa.titulo" required minlength="5" maxlength="150" #ct="ngModel" />
                    @if (ct.invalid && ct.touched) {
                      <span class="field-error">Obligatorio (5–150 caracteres).</span>
                    }
                  </label>

                  <label class="campo">
                    Descripción
                    <textarea name="descripcion" [(ngModel)]="formCasa.descripcion" rows="3" maxlength="500"></textarea>
                  </label>

                  <label class="campo">
                    Dirección
                    <input name="direccion" [(ngModel)]="formCasa.direccion" maxlength="255" />
                  </label>

                  <div class="fila-3">
                    <label class="campo">
                      Ciudad *
                      <input name="ciudad" [(ngModel)]="formCasa.ciudad" required maxlength="80" #cc="ngModel" />
                      @if (cc.invalid && cc.touched) {
                        <span class="field-error">Obligatorio.</span>
                      }
                    </label>
                    <label class="campo">
                      Barrio / zona
                      <input name="barrio" [(ngModel)]="formCasa.barrio" maxlength="100"
                             placeholder="ej. Malasaña, Gràcia..." />
                    </label>
                    <label class="campo">
                      Provincia *
                      <select name="provincia" [(ngModel)]="formCasa.provincia" required #cprov="ngModel">
                        <option value="">— Selecciona —</option>
                        @for (p of provincias; track p) {
                          <option [value]="p">{{ p }}</option>
                        }
                      </select>
                      @if (cprov.invalid && cprov.touched) {
                        <span class="field-error">Obligatorio.</span>
                      }
                    </label>
                  </div>

                  <div class="fila-2">
                    <label class="campo">
                      Tipo de vivienda
                      <select name="tipo_vivienda" [(ngModel)]="formCasa.tipo_vivienda">
                        <option value="piso">Piso</option>
                        <option value="casa">Casa</option>
                        <option value="chalet">Chalet</option>
                        <option value="apartamento">Apartamento</option>
                      </select>
                    </label>
                    <label class="campo">
                      Disponible
                      <select name="disponible" [(ngModel)]="formCasa.disponible">
                        <option [value]="1">Sí, disponible</option>
                        <option [value]="0">No disponible</option>
                      </select>
                    </label>
                  </div>

                  <div class="fila-2">
                    <label class="campo">
                      Habitaciones *
                      <input name="num_habitaciones" [(ngModel)]="formCasa.num_habitaciones"
                             type="number" min="1" max="20" required #ch="ngModel" />
                      @if (ch.invalid && ch.touched) {
                        <span class="field-error">Entre 1 y 20.</span>
                      }
                    </label>
                    <label class="campo">
                      Capacidad (personas) *
                      <input name="capacidad" [(ngModel)]="formCasa.capacidad"
                             type="number" min="1" max="30" required #cap="ngModel" />
                      @if (cap.invalid && cap.touched) {
                        <span class="field-error">Entre 1 y 30.</span>
                      }
                    </label>
                  </div>

                  <!-- ── Características (afectan a los puntos) ── -->
                  <span class="bloque-label">Características</span>
                  <div class="checks-row">
                    <label class="check-chip" [class.on]="!!formCasa.tiene_piscina">
                      <input type="checkbox" name="tiene_piscina"
                             [ngModel]="!!formCasa.tiene_piscina"
                             (ngModelChange)="formCasa.tiene_piscina = $event ? 1 : 0" />
                      <span class="chip-ico">🏊</span> Piscina
                      <span class="chip-pts">+30</span>
                    </label>
                    <label class="check-chip" [class.on]="!!formCasa.tiene_patio">
                      <input type="checkbox" name="tiene_patio"
                             [ngModel]="!!formCasa.tiene_patio"
                             (ngModelChange)="formCasa.tiene_patio = $event ? 1 : 0" />
                      <span class="chip-ico">🌳</span> Patio / jardín
                      <span class="chip-pts">+15</span>
                    </label>
                    <label class="check-chip" [class.on]="!!formCasa.acepta_mascotas">
                      <input type="checkbox" name="acepta_mascotas"
                             [ngModel]="!!formCasa.acepta_mascotas"
                             (ngModelChange)="formCasa.acepta_mascotas = $event ? 1 : 0" />
                      <span class="chip-ico">🐾</span> Admite mascotas
                      <span class="chip-pts">+5</span>
                    </label>
                  </div>

                  <!-- ── Fechas disponibles ── -->
                  <span class="bloque-label">Disponibilidad</span>
                  <div class="fila-2">
                    <label class="campo">
                      Disponible desde
                      <input name="fecha_disponible_inicio" type="date"
                             [(ngModel)]="formCasa.fecha_disponible_inicio" />
                    </label>
                    <label class="campo">
                      Disponible hasta
                      <input name="fecha_disponible_fin" type="date"
                             [(ngModel)]="formCasa.fecha_disponible_fin"
                             [min]="formCasa.fecha_disponible_inicio || null" />
                    </label>
                  </div>

                  <!-- ── Valor en puntos ── -->
                  <div class="puntos-box">
                    <div class="puntos-box-head">
                      <span class="bloque-label" style="margin:0">Valor en puntos</span>
                      <span class="puntos-auto">Sugerido: <strong>{{ puntosBase() }}</strong> pts</span>
                    </div>
                    <p class="puntos-help-text">
                      Es el coste que pagará quien alquile tu casa (y los puntos que ganarás tú).
                      Se calcula automáticamente, pero puedes ajustarlo ±30%.
                    </p>
                    <div class="puntos-ajuste">
                      <input type="range" class="puntos-range"
                             name="valor_puntos"
                             [min]="valorMin()" [max]="valorMax()" step="1"
                             [(ngModel)]="formCasa.valor_puntos" />
                      <div class="puntos-valor-actual">
                        <strong>{{ formCasa.valor_puntos }}</strong> pts
                        <button type="button" class="btn-reset-pts" (click)="resetPuntos()"
                                title="Volver al valor sugerido">↺</button>
                      </div>
                    </div>
                    <div class="puntos-rango">
                      <span>mín {{ valorMin() }}</span>
                      <span>máx {{ valorMax() }}</span>
                    </div>
                  </div>

                  <!-- ── Multi-photo upload ── -->
                  <div class="fotos-section">
                    <div class="fotos-header">
                      <span class="fotos-label">
                        Fotos de la casa
                        <span class="fotos-req">(mínimo 3 para publicar)</span>
                      </span>
                      <span class="fotos-counter"
                            [class.ok]="fotosSubidas().length >= 3"
                            [class.warn]="fotosSubidas().length > 0 && fotosSubidas().length < 3">
                        {{ fotosSubidas().length }}/3 mínimo
                      </span>
                    </div>

                    <!-- Drop zone -->
                    <div class="upload-zone"
                         [class.uploading]="subiendoFoto()"
                         (click)="inputFotos.click()"
                         (dragover)="$event.preventDefault()"
                         (drop)="onDropFotos($event)">
                      <input #inputFotos type="file" accept="image/*" multiple
                             style="display:none" (change)="onFilesChange($event)" />
                      @if (subiendoFoto()) {
                        <div class="upload-spinner">
                          <span class="spinner sm"></span>
                          <span>Subiendo foto...</span>
                        </div>
                      } @else {
                        <div class="upload-hint">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                               style="width:28px;height:28px;stroke:#2C4A6E;opacity:.5" aria-hidden="true">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                          <p>Haz clic o arrastra imágenes</p>
                          <p class="upload-sub">JPG, PNG, WEBP · máx. 5 MB cada una</p>
                        </div>
                      }
                    </div>

                    @if (errorFotos()) {
                      <div class="msg-error-fotos">⚠️ {{ errorFotos() }}</div>
                    }

                    <!-- Grid de fotos subidas -->
                    @if (fotosSubidas().length > 0) {
                      <div class="fotos-grid">
                        @for (url of fotosSubidas(); track url; let i = $index) {
                          <div class="foto-item" [class.portada]="url === fotoPortada()">
                            <div class="foto-thumb"
                                 [style.background-image]="'url(' + url + ')'">
                              <!-- Badge portada -->
                              <span class="portada-badge" *ngIf="url === fotoPortada()">
                                ★ Portada
                              </span>
                            </div>
                            <div class="foto-actions">
                              <button type="button" class="btn-portada"
                                      [class.active]="url === fotoPortada()"
                                      (click)="setPortada(url)"
                                      [attr.aria-label]="url === fotoPortada() ? 'Foto de portada' : 'Usar como portada'">
                                {{ url === fotoPortada() ? '★ Portada' : '☆ Portada' }}
                              </button>
                              <button type="button" class="btn-quitar-foto"
                                      (click)="quitarFoto(url)"
                                      aria-label="Eliminar esta foto">
                                ✕
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                      <p class="fotos-help" *ngIf="fotosSubidas().length >= 3">
                        ✅ Listo. La foto marcada como portada es la que verán los visitantes en el listado.
                      </p>
                    }
                  </div>

                  <div class="botones-form">
                    <button type="submit" class="btn-primary"
                            [disabled]="fCasa.invalid || subiendoFoto()">
                      {{ formCasa.id ? 'Guardar cambios' : 'Publicar casa' }}
                    </button>
                    @if (formCasa.id) {
                      <button type="button" class="btn-danger" (click)="borrarCasa()">
                        Eliminar casa
                      </button>
                    }
                  </div>

                </form>
              </div>
            }
          </div>

        </div>

        <!-- ══ SOLICITUDES ══ -->
        <div class="solicitudes-wrap">

          <!-- Recibidas -->
          <div class="panel">
            <h2 class="panel-title">
              <span class="h2-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </span>
              Solicitudes recibidas
              @if (pendientesRecibidas() > 0) {
                <span class="badge-pendientes">{{ pendientesRecibidas() }}</span>
              }
            </h2>

            @if (solicitudesRecibidas().length === 0) {
              <div class="vacio">
                <div class="vacio-ico" aria-hidden="true">📭</div>
                <p>Nadie ha solicitado alquilar tus casas todavía.</p>
              </div>
            }

            <div class="sol-lista">
              @for (s of solicitudesRecibidas(); track s.id) {
                <div class="sol-card" [class.resuelta]="s.estado !== 'pendiente'">
                  <div class="sol-thumb"
                       [style.background-image]="s.casa_imagen ? 'url(' + s.casa_imagen + ')' : 'none'">
                    @if (!s.casa_imagen) { <span aria-hidden="true">🏠</span> }
                  </div>
                  <div class="sol-info">
                    <strong>{{ s.casa_titulo }}</strong>
                    <span class="sol-sub">
                      <b>{{ s.inquilino_nombre }}</b> quiere alquilarla
                    </span>
                    @if (s.fecha_inicio) {
                      <span class="sol-fechas">
                        📅 {{ s.fecha_inicio | date:'d MMM':'':'es' }}
                        @if (s.fecha_fin) { → {{ s.fecha_fin | date:'d MMM yyyy':'':'es' }} }
                      </span>
                    }
                    @if (s.mensaje) { <span class="sol-mensaje">“{{ s.mensaje }}”</span> }
                    <span class="sol-puntos">+{{ s.puntos }} pts si aceptas</span>
                  </div>
                  <div class="sol-acciones">
                    @if (s.estado === 'pendiente') {
                      <button class="btn-aceptar" (click)="aceptar(s)"
                              [disabled]="procesando()">Aceptar</button>
                      <button class="btn-rechazar" (click)="rechazar(s)"
                              [disabled]="procesando()">Rechazar</button>
                    } @else {
                      <span class="sol-estado" [attr.data-estado]="s.estado">{{ estadoLabel(s.estado) }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Enviadas -->
          <div class="panel">
            <h2 class="panel-title">
              <span class="h2-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </span>
              Mis solicitudes enviadas
            </h2>

            @if (solicitudesEnviadas().length === 0) {
              <div class="vacio">
                <div class="vacio-ico" aria-hidden="true">✈️</div>
                <p>No has solicitado alquilar ninguna casa todavía.</p>
                <p class="vacio-sub">Explora casas y solicita un intercambio con tus puntos.</p>
              </div>
            }

            <div class="sol-lista">
              @for (s of solicitudesEnviadas(); track s.id) {
                <div class="sol-card" [class.resuelta]="s.estado !== 'pendiente'">
                  <div class="sol-thumb"
                       [style.background-image]="s.casa_imagen ? 'url(' + s.casa_imagen + ')' : 'none'">
                    @if (!s.casa_imagen) { <span aria-hidden="true">🏠</span> }
                  </div>
                  <div class="sol-info">
                    <strong>{{ s.casa_titulo }}</strong>
                    <span class="sol-sub">de <b>{{ s.propietario_nombre }}</b> · {{ s.casa_ciudad }}</span>
                    @if (s.fecha_inicio) {
                      <span class="sol-fechas">
                        📅 {{ s.fecha_inicio | date:'d MMM':'':'es' }}
                        @if (s.fecha_fin) { → {{ s.fecha_fin | date:'d MMM yyyy':'':'es' }} }
                      </span>
                    }
                    <span class="sol-puntos gasto">−{{ s.puntos }} pts</span>
                  </div>
                  <div class="sol-acciones">
                    <span class="sol-estado" [attr.data-estado]="s.estado">{{ estadoLabel(s.estado) }}</span>
                    @if (s.estado === 'pendiente') {
                      <button class="btn-rechazar btn-cancelar" (click)="cancelar(s)"
                              [disabled]="procesando()">Cancelar</button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .pagina { min-height: 100vh; background: #EFF4FA; }

    /* ── Carga / error ── */
    .estado-carga, .estado-error {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 60vh; gap: 16px; color: rgba(30,54,80,.4);
    }
    .error-ico { font-size: 2.5rem; }
    .estado-error p { font-size: 1rem; color: #C05050; font-weight: 500; }
    .spinner {
      width: 42px; height: 42px; border-radius: 50%;
      border: 2px solid rgba(44,74,110,.15); border-top-color: #2C4A6E;
      animation: spin .75s linear infinite;
    }
    .spinner.sm { width: 22px; height: 22px; border-width: 2px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Cabecera ── */
    .cabecera {
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #2C4A6E 0%, #1E3650 60%, #276657 100%);
      padding: 44px 48px; display: flex; align-items: center; gap: 28px;
    }
    .cabecera-bg {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }
    .avatar {
      position: relative; z-index: 1;
      width: 86px; height: 86px; border-radius: 50%;
      background: rgba(255,255,255,.18);
      border: 2px solid rgba(255,255,255,.3);
      color: #fff; font-size: 2rem; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 8px 32px rgba(0,0,0,.2);
      animation: avatarPop .5s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes avatarPop {
      from { transform: scale(.7); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    .cabecera-info { position: relative; z-index: 1; }
    .cabecera-info h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2rem; font-weight: 400; color: #fff; margin-bottom: 4px;
    }
    .cab-email { color: rgba(255,255,255,.6); font-size: .9rem; margin-bottom: 10px; }
    .cab-badges { display: flex; flex-wrap: wrap; gap: 8px; }
    .badge-provincia {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
      color: rgba(255,255,255,.8); font-size: .78rem;
      padding: 4px 14px; border-radius: 100px;
    }

    /* ── Saldo de puntos (cabecera) ── */
    .puntos-saldo {
      position: relative; z-index: 1; margin-left: auto;
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,.13); border: 1px solid rgba(255,255,255,.25);
      padding: 14px 22px; border-radius: 18px; backdrop-filter: blur(8px);
      flex-shrink: 0;
    }
    .puntos-saldo-ico {
      font-size: 1.8rem; color: #9FE5D0; line-height: 1;
      text-shadow: 0 2px 12px rgba(159,229,208,.5);
    }
    .puntos-saldo div { display: flex; flex-direction: column; }
    .puntos-saldo-num {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2rem; font-weight: 600; color: #fff; line-height: 1;
    }
    .puntos-saldo-lbl { font-size: .72rem; color: rgba(255,255,255,.65); margin-top: 3px; }

    /* ── Layout dos columnas ── */
    .contenido {
      display: grid; grid-template-columns: 380px 1fr;
      gap: 24px; max-width: 1200px; margin: 32px auto; padding: 0 24px;
    }

    /* ── Paneles ── */
    .panel {
      background: #FFFFFF;
      border: 1px solid rgba(44,74,110,.10);
      border-radius: 20px; padding: 28px 24px;
      box-shadow: 0 2px 16px rgba(30,54,80,.07);
      align-self: start;
    }
    .panel-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.3rem; font-weight: 400; color: #1E3650;
      margin-bottom: 24px;
      display: flex; align-items: center; gap: 10px;
    }
    .h2-icon {
      width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
      background: rgba(44,74,110,.07); border: 1px solid rgba(44,74,110,.12);
      display: flex; align-items: center; justify-content: center;
    }
    .h2-icon svg { width: 15px; height: 15px; stroke: #2C4A6E; }

    .casas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }

    /* ── Tarjetas de casa (listado perfil) ── */
    .casas-lista { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
    .tarjeta-casa {
      border-radius: 14px; overflow: hidden; cursor: pointer;
      border: 1px solid rgba(44,74,110,.10);
      background: #F5F8FD;
      box-shadow: 0 2px 10px rgba(30,54,80,.06);
      transition: all .25s cubic-bezier(.4,0,.2,1);
    }
    .tarjeta-casa:hover {
      border-color: rgba(44,74,110,.22);
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(30,54,80,.12);
    }
    .tarjeta-img {
      height: 130px; background: #EFF4FA center/cover no-repeat;
      position: relative; display: flex; align-items: center; justify-content: center;
    }
    .img-placeholder {
      font-size: 2.5rem; opacity: .25;
    }
    .badge-tipo, .badge-estado, .badge-n-fotos {
      position: absolute; font-size: .64rem; font-weight: 700;
      padding: 2px 9px; border-radius: 100px; letter-spacing: .05em;
    }
    .badge-tipo  { top: 8px; left: 8px; background: rgba(255,255,255,.9); color: #2C4A6E;
                   text-transform: uppercase; border: 1px solid rgba(44,74,110,.15); }
    .badge-estado { top: 8px; right: 8px; }
    .badge-estado.verde { background: rgba(39,102,87,.1); border: 1px solid rgba(39,102,87,.3); color: #276657; }
    .badge-estado.gris  { background: rgba(44,74,110,.08); border: 1px solid rgba(44,74,110,.15); color: rgba(30,54,80,.45); }
    .badge-n-fotos { bottom: 8px; right: 8px; background: rgba(0,0,0,.4); color: #fff; font-size: .62rem; border-radius: 100px; }
    .tarjeta-info { padding: 11px 13px; }
    .tarjeta-info strong { display: block; font-size: .87rem; color: #1E3650; margin-bottom: 5px; font-weight: 600; }
    .info-row { display: flex; align-items: center; gap: 4px; font-size: .75rem; color: rgba(30,54,80,.4); margin-bottom: 2px; }

    /* ── Vacío ── */
    .vacio { text-align: center; padding: 40px 0; }
    .vacio-ico { font-size: 2.5rem; margin-bottom: 10px; opacity: .3; }
    .vacio p    { font-size: .9rem; color: rgba(30,54,80,.4); }
    .vacio-sub  { font-size: .82rem; color: rgba(30,54,80,.3); margin-top: 4px; }

    /* ── Form casa ── */
    .form-casa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
    h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 400; color: #1E3650; margin: 0; }

    /* ── Campos ── */
    .campo {
      display: flex; flex-direction: column; font-size: .73rem;
      color: rgba(30,54,80,.55); margin-bottom: 14px;
      font-weight: 600; letter-spacing: .05em; text-transform: uppercase;
    }
    input, select, textarea {
      margin-top: 6px; padding: 10px 14px;
      background: #F5F8FD;
      border: 1px solid rgba(44,74,110,.15);
      border-radius: 12px; color: #1E3650; font-size: .91rem;
      transition: all .2s; font-family: inherit; outline: none;
      width: 100%; min-width: 0; box-sizing: border-box;
    }
    select {
      appearance: none; -webkit-appearance: none; -moz-appearance: none;
      cursor: pointer; padding-right: 38px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232C4A6E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      text-overflow: ellipsis;
    }
    /* Las celdas del grid no deben desbordarse por el contenido */
    .campo { min-width: 0; }
    .fila-2 > *, .fila-3 > * { min-width: 0; }
    input::placeholder { color: rgba(30,54,80,.3); }
    input:focus, select:focus, textarea:focus {
      border-color: #2C4A6E;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(44,74,110,.1);
    }
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched { border-color: rgba(192,80,80,.45); }
    select option { background: #fff; color: #1E3650; }
    textarea { resize: vertical; }
    .fila-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .fila-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .field-error { color: #C05050; font-size: .71rem; margin-top: 3px; font-weight: 400; text-transform: none; letter-spacing: 0; }

    /* ── Multi-photo upload ── */
    .fotos-section {
      margin-bottom: 18px;
      padding: 18px;
      background: rgba(44,74,110,.03);
      border: 1px solid rgba(44,74,110,.10);
      border-radius: 16px;
    }
    .fotos-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
    }
    .fotos-label {
      font-size: .73rem; font-weight: 600; letter-spacing: .05em;
      text-transform: uppercase; color: rgba(30,54,80,.55);
    }
    .fotos-req { font-size: .68rem; color: rgba(30,54,80,.35); text-transform: none; letter-spacing: 0; font-weight: 400; }
    .fotos-counter {
      font-size: .72rem; font-weight: 700; padding: 3px 10px;
      border-radius: 100px; background: rgba(44,74,110,.08); color: rgba(30,54,80,.5);
    }
    .fotos-counter.ok   { background: rgba(39,102,87,.1);  color: #276657; }
    .fotos-counter.warn { background: rgba(201,169,110,.12); color: #8A6A2E; }

    .upload-zone {
      border: 1.5px dashed rgba(44,74,110,.22); border-radius: 14px;
      cursor: pointer; padding: 22px 16px; text-align: center;
      background: #F5F8FD; transition: all .2s; margin-bottom: 14px;
    }
    .upload-zone:hover:not(.uploading) {
      border-color: #2C4A6E; background: rgba(44,74,110,.04);
    }
    .upload-zone.uploading { cursor: default; }
    .upload-hint { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .upload-hint p { font-size: .82rem; color: rgba(30,54,80,.45); margin: 0; }
    .upload-sub { font-size: .72rem !important; color: rgba(30,54,80,.3) !important; }
    .upload-spinner { display: flex; align-items: center; gap: 10px; justify-content: center;
                      color: rgba(30,54,80,.5); font-size: .85rem; }

    .msg-error-fotos {
      background: rgba(192,80,80,.07); border: 1px solid rgba(192,80,80,.2);
      color: #C05050; padding: 9px 13px; border-radius: 10px; font-size: .83rem;
      margin-bottom: 12px;
    }

    /* Grid de fotos */
    .fotos-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;
    }
    .foto-item { border-radius: 12px; overflow: hidden; border: 2px solid transparent;
                 transition: all .2s; }
    .foto-item.portada { border-color: #2C4A6E; box-shadow: 0 0 0 1px rgba(44,74,110,.3); }
    .foto-thumb {
      height: 90px; background: #EFF4FA center/cover no-repeat;
      position: relative;
    }
    .portada-badge {
      position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);
      background: #2C4A6E; color: #fff;
      font-size: .62rem; font-weight: 700;
      padding: 2px 9px; border-radius: 100px; white-space: nowrap;
    }
    .foto-actions {
      display: flex; background: #F5F8FD;
    }
    .btn-portada {
      flex: 1; padding: 5px 4px; border: none;
      background: transparent; color: rgba(30,54,80,.5);
      font-size: .67rem; font-weight: 600; cursor: pointer;
      transition: all .15s; text-align: center;
      box-shadow: none; border-radius: 0;
    }
    .btn-portada.active { color: #2C4A6E; }
    .btn-portada:hover:not(.active) { background: rgba(44,74,110,.06); color: #2C4A6E; transform: none; box-shadow: none; }
    .btn-quitar-foto {
      width: 28px; padding: 5px 0; border: none; border-left: 1px solid rgba(44,74,110,.1);
      background: transparent; color: rgba(30,54,80,.3); font-size: .72rem;
      cursor: pointer; transition: all .15s; box-shadow: none; border-radius: 0;
    }
    .btn-quitar-foto:hover { background: rgba(192,80,80,.08); color: #C05050; transform: none; box-shadow: none; }

    .fotos-help {
      font-size: .78rem; color: #276657; margin-top: 10px;
      background: rgba(39,102,87,.07); border: 1px solid rgba(39,102,87,.18);
      padding: 8px 12px; border-radius: 8px;
    }

    /* ── Botones ── */
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 24px; border: none; border-radius: 100px;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: .87rem; font-weight: 700; cursor: pointer;
      transition: all .2s; box-shadow: 0 4px 16px rgba(44,74,110,.25);
      font-family: inherit; text-decoration: none;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 8px 28px rgba(44,74,110,.4);
    }
    .btn-primary:disabled { opacity: .35; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-sm { padding: 7px 16px; font-size: .81rem; }

    .btn-back {
      background: none; border: none; color: rgba(44,74,110,.7);
      cursor: pointer; font-size: .86rem; font-weight: 500; padding: 0;
      display: flex; align-items: center; gap: 5px; transition: color .2s;
      box-shadow: none; transform: none !important;
    }
    .btn-back:hover { color: #2C4A6E; transform: none !important; box-shadow: none; }

    .btn-danger {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 24px; border-radius: 100px;
      background: transparent;
      border: 1px solid rgba(192,80,80,.3) !important;
      color: #C05050 !important; font-size: .87rem; font-weight: 600; cursor: pointer;
      transition: all .2s; box-shadow: none !important; font-family: inherit;
    }
    .btn-danger:hover:not(:disabled) {
      background: rgba(192,80,80,.08) !important;
      border-color: rgba(192,80,80,.5) !important;
      box-shadow: none !important; transform: none;
    }

    .botones-form { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }

    .zona-peligro { margin-top: 28px; }
    .separador-peligro {
      border: none; border-top: 1px solid rgba(192,80,80,.18); margin-bottom: 14px;
    }
    .peligro-aviso {
      font-size: .76rem; color: rgba(192,80,80,.6); margin-bottom: 12px;
    }

    /* ── Bloques de características / disponibilidad ── */
    .bloque-label {
      display: block; font-size: .73rem; font-weight: 700; letter-spacing: .06em;
      text-transform: uppercase; color: rgba(30,54,80,.5);
      margin: 6px 0 10px;
    }
    .checks-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .check-chip {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 14px; border-radius: 100px; cursor: pointer;
      background: #F5F8FD; border: 1.5px solid rgba(44,74,110,.14);
      font-size: .82rem; color: rgba(30,54,80,.6); font-weight: 600;
      transition: all .18s; text-transform: none; letter-spacing: 0;
    }
    .check-chip:hover { border-color: rgba(44,74,110,.3); }
    .check-chip.on {
      background: rgba(61,139,122,.1); border-color: #3D8B7A; color: #276657;
    }
    .check-chip input { display: none; }
    .check-chip .chip-ico { font-size: 1rem; }
    .check-chip .chip-pts {
      font-size: .68rem; font-weight: 800; color: #3D8B7A;
      background: rgba(61,139,122,.14); padding: 1px 7px; border-radius: 100px;
    }

    /* ── Caja de puntos ── */
    .puntos-box {
      margin-bottom: 18px; padding: 16px 18px;
      background: linear-gradient(135deg, rgba(44,74,110,.05), rgba(61,139,122,.05));
      border: 1px solid rgba(44,74,110,.14); border-radius: 16px;
    }
    .puntos-box-head { display: flex; justify-content: space-between; align-items: center; }
    .puntos-auto { font-size: .8rem; color: rgba(30,54,80,.55); }
    .puntos-auto strong { color: #2C4A6E; font-size: .95rem; }
    .puntos-help-text { font-size: .76rem; color: rgba(30,54,80,.45); line-height: 1.5; margin: 8px 0 14px; }
    .puntos-ajuste { display: flex; align-items: center; gap: 16px; }
    .puntos-range { flex: 1; margin: 0; padding: 0; accent-color: #3D8B7A; height: 6px; cursor: pointer; }
    .puntos-valor-actual {
      display: flex; align-items: center; gap: 8px;
      font-size: .82rem; color: rgba(30,54,80,.6); white-space: nowrap;
    }
    .puntos-valor-actual strong {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.6rem; font-weight: 600; color: #2C4A6E; line-height: 1;
    }
    .btn-reset-pts {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      border: 1px solid rgba(44,74,110,.2); background: #fff; color: #2C4A6E;
      cursor: pointer; font-size: .9rem; line-height: 1; padding: 0;
      box-shadow: none; transition: all .15s;
    }
    .btn-reset-pts:hover { background: rgba(44,74,110,.07); transform: rotate(-90deg); box-shadow: none; }
    .puntos-rango {
      display: flex; justify-content: space-between;
      font-size: .68rem; color: rgba(30,54,80,.35); margin-top: 4px;
    }

    /* ── Solicitudes ── */
    .solicitudes-wrap {
      max-width: 1200px; margin: 0 auto 40px; padding: 0 24px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    }
    .badge-pendientes {
      margin-left: 8px; background: #C9A96E; color: #fff;
      font-size: .7rem; font-weight: 800; padding: 2px 9px; border-radius: 100px;
      min-width: 20px; text-align: center;
    }
    .sol-lista { display: flex; flex-direction: column; gap: 12px; }
    .sol-card {
      display: flex; gap: 14px; padding: 12px;
      background: #F5F8FD; border: 1px solid rgba(44,74,110,.1);
      border-radius: 14px; transition: all .2s;
    }
    .sol-card.resuelta { opacity: .65; }
    .sol-thumb {
      width: 72px; height: 72px; border-radius: 10px; flex-shrink: 0;
      background: #EFF4FA center/cover no-repeat;
      display: flex; align-items: center; justify-content: center; font-size: 1.8rem;
    }
    .sol-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .sol-info strong { font-size: .92rem; color: #1E3650; }
    .sol-sub { font-size: .8rem; color: rgba(30,54,80,.5); }
    .sol-sub b { color: #2C4A6E; }
    .sol-fechas { font-size: .76rem; color: rgba(30,54,80,.45); }
    .sol-mensaje { font-size: .78rem; color: rgba(30,54,80,.55); font-style: italic; }
    .sol-puntos {
      font-size: .76rem; font-weight: 800; color: #276657; margin-top: 2px;
    }
    .sol-puntos.gasto { color: #B06A3A; }
    .sol-acciones {
      display: flex; flex-direction: column; gap: 6px; justify-content: center;
      flex-shrink: 0; align-items: flex-end;
    }
    .btn-aceptar, .btn-rechazar {
      padding: 7px 16px; border-radius: 100px; font-size: .8rem; font-weight: 700;
      cursor: pointer; border: none; transition: all .18s; font-family: inherit;
      white-space: nowrap;
    }
    .btn-aceptar {
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A); color: #fff;
      box-shadow: 0 3px 12px rgba(44,74,110,.25);
    }
    .btn-aceptar:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(44,74,110,.4); }
    .btn-rechazar {
      background: transparent; border: 1px solid rgba(192,80,80,.3);
      color: #C05050; box-shadow: none;
    }
    .btn-rechazar:hover:not(:disabled) { background: rgba(192,80,80,.07); }
    .btn-aceptar:disabled, .btn-rechazar:disabled { opacity: .4; cursor: not-allowed; }
    .btn-cancelar { padding: 5px 12px; font-size: .74rem; }
    .sol-estado {
      font-size: .72rem; font-weight: 800; padding: 4px 12px; border-radius: 100px;
      text-transform: uppercase; letter-spacing: .04em;
    }
    .sol-estado[data-estado="aceptada"]  { background: rgba(39,102,87,.12);  color: #276657; }
    .sol-estado[data-estado="rechazada"] { background: rgba(192,80,80,.1);   color: #C05050; }
    .sol-estado[data-estado="cancelada"] { background: rgba(44,74,110,.08);  color: rgba(30,54,80,.5); }
    .sol-estado[data-estado="pendiente"] { background: rgba(201,169,110,.16); color: #8A6A2E; }

    @media (max-width: 900px) {
      .solicitudes-wrap { grid-template-columns: 1fr; padding: 0 14px; }
      .puntos-saldo { margin-left: 0; }
      .cabecera { flex-wrap: wrap; }
    }

    @media (max-width: 900px) {
      .contenido { grid-template-columns: 1fr; padding: 0 14px; }
      .cabecera { padding: 28px 20px; gap: 18px; }
      .avatar { width: 64px; height: 64px; font-size: 1.5rem; }
      .fila-3 { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 540px) {
      .fila-3 { grid-template-columns: 1fr; }
    }
  `]
})
/**
 * Perfil del usuario. Permite editar los datos personales, publicar y
 * gestionar las casas propias (con subida de fotos y calculo de puntos) y
 * administrar las solicitudes de alquiler recibidas y enviadas.
 */
export class PerfilComponent implements OnInit {

  // ── Signals ─────────────────────────────────────────────────────────────
  cargando        = signal(true);
  errorGeneral    = signal('');
  usuario         = signal<Usuario | null>(null);
  casas           = signal<Casa[]>([]);
  editandoCasa    = signal(false);
  guardandoPerfil = signal(false);

  // Multi-photo
  fotosSubidas  = signal<string[]>([]);
  fotoPortada   = signal('');
  subiendoFoto  = signal(false);
  errorFotos    = signal('');

  // Solicitudes
  solicitudesRecibidas = signal<Solicitud[]>([]);
  solicitudesEnviadas  = signal<Solicitud[]>([]);
  procesando           = signal(false);

  pendientesRecibidas = computed(() =>
    this.solicitudesRecibidas().filter(s => s.estado === 'pendiente').length);

  private readonly premium = ['Madrid','Barcelona','Sevilla','Bilbao','Valencia','Málaga','San Sebastián','Donostia'];

  // ── Non-reactive ─────────────────────────────────────────────────────────
  formUsuario: Usuario | null = null;
  formCasa!: Casa;

  // ── Computed ─────────────────────────────────────────────────────────────
  iniciales = computed(() => {
    const u = this.usuario();
    const nombre = `${u?.nombre ?? ''} ${u?.apellidos ?? ''}`.trim();
    const partes = nombre.split(/\s+/).filter(p => p.length > 0);
    return partes.slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
  });

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

  constructor(
    public  auth:   AuthService,
    private api:    ApiService,
    private router: Router,
    private toast:  ToastService
  ) {}

  ngOnInit(): void {
    this.formCasa = this.casaVacia();
    const sesion = this.auth.getSesion();
    const id = sesion?.id;
    if (!id) { this.auth.logout(); return; }

    this.api.obtenerUsuario(id).subscribe({
      next: u => {
        if (!u || !(u as any).nombre) {
          this.cargando.set(false);
          this.errorGeneral.set('No se encontraron tus datos. Contacta con el administrador.');
          return;
        }
        this.usuario.set(u);
        this.formUsuario = { ...u };
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorGeneral.set('No se pudo cargar el perfil. Comprueba que XAMPP está activo.');
      }
    });

    this.api.listarCasasUsuario(id).subscribe({
      next: data => this.casas.set(data ?? []),
      error: ()   => this.casas.set([])
    });

    // Puntos + solicitudes
    this.auth.refrescarPuntos();
    this.cargarSolicitudes();
  }

  private cargarSolicitudes(): void {
    const id = this.auth.getIdUsuario();
    if (!id) return;
    this.api.solicitudesRecibidas(id).subscribe({
      next: d => this.solicitudesRecibidas.set(d ?? []),
      error: () => this.solicitudesRecibidas.set([])
    });
    this.api.solicitudesEnviadas(id).subscribe({
      next: d => this.solicitudesEnviadas.set(d ?? []),
      error: () => this.solicitudesEnviadas.set([])
    });
  }

  // ── Puntos / valor casa ────────────────────────────────────────────────────

  /** Cálculo automático (espejo del backend PHP calcularPuntosBase). */
  puntosBase(): number {
    const c = this.formCasa;
    if (!c) return 0;
    const base: Record<string, number> = { piso: 20, apartamento: 25, casa: 35, chalet: 50 };
    let p = base[c.tipo_vivienda] ?? 20;
    p += (Number(c.num_habitaciones) || 0) * 8;
    p += (Number(c.capacidad) || 0) * 4;
    if (c.tiene_piscina)   p += 30;
    if (c.tiene_patio)     p += 15;
    if (c.acepta_mascotas) p += 5;
    if (c.ciudad && this.premium.includes(c.ciudad)) p += 20;
    return p;
  }
  valorMin(): number { return Math.round(this.puntosBase() * 0.70); }
  valorMax(): number { return Math.round(this.puntosBase() * 1.30); }

  resetPuntos(): void { this.formCasa.valor_puntos = this.puntosBase(); }

  // ── Acciones sobre solicitudes ──────────────────────────────────────────────

  estadoLabel(e?: EstadoSolicitud): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente', aceptada: 'Aceptada',
      rechazada: 'Rechazada', cancelada: 'Cancelada'
    };
    return map[e ?? ''] ?? e ?? '';
  }

  aceptar(s: Solicitud): void {
    if (!s.id || this.procesando()) return;
    this.procesando.set(true);
    this.api.aceptarSolicitud(s.id).subscribe({
      next: res => {
        this.procesando.set(false);
        if (res.result === 'OK') {
          this.toast.show(`Has aceptado la solicitud. +${s.puntos} puntos.`);
          this.auth.refrescarPuntos();
          this.cargarSolicitudes();
          this.recargarCasas();
        } else {
          this.toast.show(res.error || 'No se pudo aceptar la solicitud.', 'error');
          this.cargarSolicitudes();
        }
      },
      error: () => { this.procesando.set(false); this.toast.show('Error de conexión.', 'error'); }
    });
  }

  rechazar(s: Solicitud): void {
    if (!s.id || this.procesando()) return;
    this.procesando.set(true);
    this.api.rechazarSolicitud(s.id).subscribe({
      next: res => {
        this.procesando.set(false);
        if (res.result === 'OK') { this.toast.show('Solicitud rechazada.'); this.cargarSolicitudes(); }
        else this.toast.show('No se pudo rechazar.', 'error');
      },
      error: () => { this.procesando.set(false); this.toast.show('Error de conexión.', 'error'); }
    });
  }

  cancelar(s: Solicitud): void {
    if (!s.id || this.procesando()) return;
    this.procesando.set(true);
    this.api.cancelarSolicitud(s.id).subscribe({
      next: res => {
        this.procesando.set(false);
        if (res.result === 'OK') { this.toast.show('Solicitud cancelada.'); this.cargarSolicitudes(); }
        else this.toast.show('No se pudo cancelar.', 'error');
      },
      error: () => { this.procesando.set(false); this.toast.show('Error de conexión.', 'error'); }
    });
  }

  // ── Perfil ────────────────────────────────────────────────────────────────

  guardarPerfil(): void {
    if (!this.formUsuario) return;
    this.guardandoPerfil.set(true);
    this.api.modificaUsuario(this.formUsuario).subscribe({
      next: res => {
        this.guardandoPerfil.set(false);
        if (res.result === 'OK') {
          this.toast.show('Datos actualizados correctamente.');
          this.usuario.set({ ...this.formUsuario! });
        } else {
          this.toast.show('No se pudieron guardar los cambios.', 'error');
        }
      },
      error: () => {
        this.guardandoPerfil.set(false);
        this.toast.show('Error al conectar con el servidor.', 'error');
      }
    });
  }

  borrarCuenta(): void {
    if (!confirm('¿Seguro que quieres eliminar tu cuenta? Se borrarán todas tus casas y solicitudes. Esta acción no se puede deshacer.')) return;
    const id = this.auth.getIdUsuario();
    if (!id) return;
    this.api.borraUsuario(id).subscribe({
      next: res => {
        if (res.result === 'OK') {
          this.auth.logout();
          this.router.navigate(['/']);
        } else {
          this.toast.show('No se pudo eliminar la cuenta.', 'error');
        }
      },
      error: () => this.toast.show('Error al conectar con el servidor.', 'error')
    });
  }

  // ── Casas ─────────────────────────────────────────────────────────────────

  nuevaCasa(): void {
    this.formCasa = this.casaVacia();
    this.formCasa.valor_puntos = this.puntosBase();   // valor sugerido inicial
    this.fotosSubidas.set([]);
    this.fotoPortada.set('');
    this.errorFotos.set('');
    this.editandoCasa.set(true);
  }

  editarCasa(c: Casa): void {
    this.formCasa = { ...c };
    // Asegurar tipos numéricos para los toggles/puntos
    this.formCasa.acepta_mascotas = Number(c.acepta_mascotas) || 0;
    this.formCasa.tiene_piscina   = Number(c.tiene_piscina)   || 0;
    this.formCasa.tiene_patio     = Number(c.tiene_patio)     || 0;
    if (!this.formCasa.valor_puntos) this.formCasa.valor_puntos = this.puntosBase();
    const fotos = (c.fotos && c.fotos.length > 0) ? [...c.fotos]
                : (c.imagen_url ? [c.imagen_url] : []);
    this.fotosSubidas.set(fotos);
    this.fotoPortada.set(c.imagen_url || fotos[0] || '');
    this.errorFotos.set('');
    this.editandoCasa.set(true);
  }

  cancelarCasa(): void {
    this.editandoCasa.set(false);
    this.fotosSubidas.set([]);
    this.fotoPortada.set('');
    this.errorFotos.set('');
  }

  // ── Subida de fotos ───────────────────────────────────────────────────────

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      Array.from(input.files).forEach(f => this.subirFoto(f));
      input.value = '';
    }
  }

  onDropFotos(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      Array.from(event.dataTransfer.files).forEach(f => this.subirFoto(f));
    }
  }

  private subirFoto(file: File): void {
    this.errorFotos.set('');
    const permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!permitidos.includes(file.type)) {
      this.errorFotos.set('Formato no válido. Usa JPG, PNG, GIF o WEBP.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorFotos.set('Una imagen supera los 5 MB.'); return;
    }
    this.subiendoFoto.set(true);
    this.api.subirImagen(file).subscribe({
      next: res => {
        this.subiendoFoto.set(false);
        if (res.result === 'OK' && res.url) {
          const fotos = [...this.fotosSubidas(), res.url];
          this.fotosSubidas.set(fotos);
          if (!this.fotoPortada()) this.fotoPortada.set(res.url);
        } else {
          this.errorFotos.set(res.error || 'No se pudo subir la imagen.');
        }
      },
      error: () => {
        this.subiendoFoto.set(false);
        this.errorFotos.set('Error al subir la imagen.');
      }
    });
  }

  setPortada(url: string): void { this.fotoPortada.set(url); }

  quitarFoto(url: string): void {
    const fotos = this.fotosSubidas().filter(f => f !== url);
    this.fotosSubidas.set(fotos);
    if (this.fotoPortada() === url) {
      this.fotoPortada.set(fotos[0] || '');
    }
  }

  // ── Guardar casa ─────────────────────────────────────────────────────────

  guardarCasa(): void {
    this.errorFotos.set('');
    if (this.fotosSubidas().length < 3) {
      this.errorFotos.set(`Debes subir al menos 3 fotos (tienes ${this.fotosSubidas().length}).`);
      return;
    }
    this.formCasa.fotos     = [...this.fotosSubidas()];
    this.formCasa.imagen_url = this.fotoPortada() || this.fotosSubidas()[0] || '';
    this.persistirCasa();
  }

  private persistirCasa(): void {
    const op = this.formCasa.id
      ? this.api.modificaCasa(this.formCasa)
      : this.api.anadeCasa(this.formCasa);

    op.subscribe({
      next: res => {
        if (res.result === 'OK') {
          this.toast.show(this.formCasa.id ? 'Casa actualizada.' : 'Casa publicada correctamente.');
          this.recargarCasas();
          this.cancelarCasa();
        } else {
          this.toast.show('No se pudo guardar la casa.', 'error');
        }
      },
      error: () => this.toast.show('Error al conectar con el servidor.', 'error')
    });
  }

  borrarCasa(): void {
    if (!this.formCasa.id) return;
    if (!confirm(`¿Eliminar la casa "${this.formCasa.titulo}"?`)) return;
    this.api.borraCasa(this.formCasa.id).subscribe({
      next: res => {
        if (res.result === 'OK') { this.recargarCasas(); this.cancelarCasa(); }
        else { this.toast.show('No se pudo eliminar la casa.', 'error'); }
      },
      error: () => this.toast.show('Error al conectar con el servidor.', 'error')
    });
  }

  private recargarCasas(): void {
    const id = this.auth.getIdUsuario();
    if (!id) return;
    this.api.listarCasasUsuario(id).subscribe({
      next: data => this.casas.set(data ?? [])
    });
  }

  private casaVacia(): Casa {
    return {
      usuario_id:       this.auth.getIdUsuario() ?? 0,
      titulo:           '',
      descripcion:      '',
      direccion:        '',
      ciudad:           '',
      barrio:           '',
      provincia:        '',
      tipo_vivienda:    'piso',
      num_habitaciones: 1,
      capacidad:        2,
      disponible:       1,
      acepta_mascotas:  0,
      tiene_piscina:    0,
      tiene_patio:      0,
      fecha_disponible_inicio: '',
      fecha_disponible_fin:    '',
      puntos_base:      0,
      valor_puntos:     0,
      imagen_url:       '',
      fotos:            []
    };
  }
}
