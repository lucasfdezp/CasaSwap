import { Component, OnInit, OnDestroy, HostListener, signal, computed, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Casa } from '../models/casa';
import { Solicitud } from '../models/solicitud';

@Component({
  selector: 'app-detalle-casa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pagina">

      <!-- ── Loading ── -->
      @if (cargando()) {
        <div class="loading-screen">
          <div class="loading-inner">
            <span class="spinner"></span>
            <p>Cargando propiedad...</p>
          </div>
        </div>
      }

      <!-- ── Error ── -->
      @if (!cargando() && !casa()) {
        <div class="error-screen">
          <div class="error-inner">
            <span class="error-ico" aria-hidden="true">🏚️</span>
            <h2>Casa no encontrada</h2>
            <p>Esta propiedad no existe o ya no está disponible.</p>
            <a routerLink="/" class="btn-primary">← Volver al listado</a>
          </div>
        </div>
      }

      @if (!cargando() && casa()) {
        <!-- ── Barra superior ── -->
        <div class="topbar">
          <button class="btn-back" (click)="volver()" aria-label="Volver al listado">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </button>
          <div class="topbar-title">{{ casa()!.titulo }}</div>
          <div class="topbar-actions">
            <button class="btn-share" (click)="compartir()" aria-label="Compartir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                   style="width:16px;height:16px">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Compartir
            </button>
          </div>
        </div>

        <!-- ── Galería principal (Airbnb 5-photo layout) ── -->
        <div class="galeria-hero">
          <!-- Foto grande izquierda -->
          <div class="foto-grande"
               [style.background-image]="getFotos().length ? 'url(' + getFotos()[0] + ')' : 'none'"
               (click)="abrirLightbox(0)"
               role="button" tabindex="0" (keydown.enter)="abrirLightbox(0)"
               aria-label="Ampliar foto principal">
            <div *ngIf="!getFotos().length" class="foto-placeholder" aria-hidden="true">🏠</div>
          </div>

          <!-- Grid 2×2 de fotos pequeñas -->
          <div class="fotos-grid">
            @for (foto of getFotos().slice(1, 5); track foto; let i = $index) {
              <div class="foto-small"
                   [style.background-image]="'url(' + foto + ')'"
                   (click)="abrirLightbox(i + 1)"
                   role="button" tabindex="0" (keydown.enter)="abrirLightbox(i + 1)"
                   [attr.aria-label]="'Ampliar foto ' + (i + 2)">
                <!-- Overlay "Ver todas" en la última visible -->
                @if (i === 3 && getFotos().length > 5) {
                  <div class="ver-mas-overlay" (click)="abrirLightbox(4)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                         style="width:20px;height:20px">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    +{{ getFotos().length - 5 }} fotos
                  </div>
                }
              </div>
            }
            <!-- Relleno si hay menos de 4 fotos adicionales -->
            @for (p of fotosPlaceholder(); track p) {
              <div class="foto-small foto-small-empty" aria-hidden="true">🏠</div>
            }
          </div>

          <!-- Botón "Ver todas las fotos" -->
          <button class="btn-todas-fotos" (click)="abrirLightbox(0)"
                  *ngIf="getFotos().length > 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                 style="width:15px;height:15px">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Ver las {{ getFotos().length }} fotos
          </button>
        </div>

        <!-- ── Cuerpo principal (2 columnas) ── -->
        <div class="cuerpo">

          <!-- Columna izquierda: info -->
          <div class="col-info">

            <!-- Título y tipo -->
            <div class="info-header">
              <div class="info-header-main">
                <span class="badge-tipo">{{ casa()!.tipo_vivienda }}</span>
                <h1>{{ casa()!.titulo }}</h1>
                <!-- Ubicación rápida -->
                <p class="ubicacion-rapida">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                       style="width:15px;height:15px;flex-shrink:0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>
                    <ng-container *ngIf="casa()!.barrio">{{ casa()!.barrio }} · </ng-container>
                    {{ casa()!.ciudad }}, {{ casa()!.provincia }}
                  </span>
                </p>
              </div>
              <div class="info-header-badge" [class.disponible]="casa()!.disponible == 1">
                <span class="disponible-dot"></span>
                {{ casa()!.disponible == 1 ? 'Disponible' : 'No disponible' }}
              </div>
            </div>

            <div class="separator"></div>

            <!-- Stats rápidos -->
            <div class="quick-stats">
              <div class="qs-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M2 4h20v16H2z"/><path d="M2 9h20"/><path d="M7 9v11"/>
                </svg>
                <div>
                  <strong>{{ casa()!.num_habitaciones }}</strong>
                  <span>habitaciones</span>
                </div>
              </div>
              <div class="qs-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <div>
                  <strong>{{ casa()!.capacidad }}</strong>
                  <span>personas</span>
                </div>
              </div>
              <div class="qs-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <div>
                  <strong>{{ tipoLabel() }}</strong>
                  <span>tipo de inmueble</span>
                </div>
              </div>
              <div class="qs-item" *ngIf="casa()!.fecha_publicacion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div>
                  <strong>{{ casa()!.fecha_publicacion | date:'MMM yyyy':'':'es' }}</strong>
                  <span>publicado</span>
                </div>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Lo que ofrece + disponibilidad -->
            <div class="seccion">
              <h2 class="seccion-titulo">Lo que ofrece</h2>
              <div class="amenidades">
                <div class="amenidad" [class.no]="!casa()!.tiene_piscina">
                  <span class="am-emoji">🏊</span>
                  <span>Piscina</span>
                  <span class="am-check">{{ casa()!.tiene_piscina ? '✓' : '—' }}</span>
                </div>
                <div class="amenidad" [class.no]="!casa()!.tiene_patio">
                  <span class="am-emoji">🌳</span>
                  <span>Patio / jardín</span>
                  <span class="am-check">{{ casa()!.tiene_patio ? '✓' : '—' }}</span>
                </div>
                <div class="amenidad" [class.no]="!casa()!.acepta_mascotas">
                  <span class="am-emoji">🐾</span>
                  <span>Admite mascotas</span>
                  <span class="am-check">{{ casa()!.acepta_mascotas ? '✓' : '—' }}</span>
                </div>
              </div>

              @if (casa()!.fecha_disponible_inicio && casa()!.fecha_disponible_fin) {
                <div class="disponibilidad">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                       style="width:16px;height:16px;flex-shrink:0">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Disponible del
                  <strong>{{ casa()!.fecha_disponible_inicio | date:'d MMM':'':'es' }}</strong>
                  al
                  <strong>{{ casa()!.fecha_disponible_fin | date:'d MMM yyyy':'':'es' }}</strong>
                </div>
              }
            </div>

            <div class="separator"></div>

            <!-- Descripción -->
            <div class="seccion" *ngIf="casa()!.descripcion">
              <h2 class="seccion-titulo">Sobre esta vivienda</h2>
              <p class="descripcion-texto" [class.expandida]="descripcionExpandida">
                {{ casa()!.descripcion }}
              </p>
              <button class="btn-expandir" *ngIf="(casa()!.descripcion?.length ?? 0) > 220"
                      (click)="descripcionExpandida = !descripcionExpandida">
                {{ descripcionExpandida ? 'Mostrar menos ↑' : 'Mostrar más ↓' }}
              </button>
            </div>

            <div class="separator" *ngIf="casa()!.descripcion"></div>

            <!-- Ubicación -->
            <div class="seccion">
              <h2 class="seccion-titulo">Ubicación</h2>

              <!-- Mapa Leaflet / OpenStreetMap -->
              <div id="mapa-leaflet" class="mapa-leaflet" aria-label="Mapa de ubicación"></div>

              <!-- Desglose de ubicación -->
              <div class="ubicacion-detail">
                <div class="ubi-row" *ngIf="casa()!.barrio">
                  <span class="ubi-label">Barrio / zona</span>
                  <span class="ubi-val">{{ casa()!.barrio }}</span>
                </div>
                <div class="ubi-row">
                  <span class="ubi-label">Ciudad</span>
                  <span class="ubi-val">{{ casa()!.ciudad }}</span>
                </div>
                <div class="ubi-row">
                  <span class="ubi-label">Provincia</span>
                  <span class="ubi-val">{{ casa()!.provincia }}</span>
                </div>
                <div class="ubi-row" *ngIf="casa()!.direccion">
                  <span class="ubi-label">Dirección</span>
                  <span class="ubi-val">{{ casa()!.direccion }}</span>
                </div>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Propietario (mobile: debajo de ubicación, antes de la tarjeta sticky) -->
            <div class="seccion host-seccion">
              <h2 class="seccion-titulo">El propietario</h2>
              <div class="host-card">
                <div class="host-avatar" aria-hidden="true">
                  {{ casa()!.propietario ? casa()!.propietario![0].toUpperCase() : '?' }}
                </div>
                <div class="host-info">
                  <strong>{{ casa()!.propietario }}</strong>
                  <span>Propietario en CasaSwap</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Columna derecha: contacto (sticky) -->
          <div class="col-contacto">
            <div class="contacto-card">

              <!-- Header de la card -->
              <div class="contacto-header">
                <div class="contacto-header-ico" aria-hidden="true">
                  <svg viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:20px">
                    <path d="M2 12.5L9.5 5L17 12.5V22.5H13.5V17.5H5.5V22.5H2V12.5Z" stroke="#2C4A6E" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
                    <path d="M39 12.5L46.5 5L54 12.5V22.5H50.5V17.5H42.5V22.5H39V12.5Z" stroke="#3D8B7A" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
                    <path d="M19 10C22 6.5 26 6.5 28 7L26.2 5" stroke="#2C4A6E" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M37 18C34 21.5 30 21.5 28 21L29.8 23" stroke="#3D8B7A" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <p class="contacto-lema">Alquila con <span>puntos</span></p>
                  <p class="contacto-sub">Tú en su casa, ellos en la tuya</p>
                </div>
              </div>

              <!-- Coste en puntos -->
              <div class="coste-banner">
                <div class="coste-num">
                  <span class="coste-ico" aria-hidden="true">◈</span>
                  <strong>{{ casa()!.valor_puntos || casa()!.puntos_base || 0 }}</strong>
                  <span class="coste-lbl">puntos / estancia</span>
                </div>
                @if (auth.estaLogado() && !esMiCasa()) {
                  <div class="coste-saldo" [class.insuficiente]="!tieneSuficiente()">
                    Tu saldo: <b>{{ auth.puntos() }}</b> pts
                  </div>
                }
              </div>

              <!-- Logado: solicitar alquiler + datos de contacto -->
              @if (auth.estaLogado()) {

                <!-- Es mi propia casa -->
                @if (esMiCasa()) {
                  <div class="mi-casa-nota">
                    <span aria-hidden="true">🏠</span>
                    Esta es una de tus casas. Gestiona las solicitudes desde tu perfil.
                  </div>
                }

                <!-- Solicitar alquiler -->
                @if (!esMiCasa()) {
                  @if (solicitudEnviada()) {
                    <div class="solicitud-ok">
                      <span class="sok-ico" aria-hidden="true">✓</span>
                      <div>
                        <strong>Solicitud enviada</strong>
                        <span>El propietario debe aceptarla. La verás en tu perfil.</span>
                      </div>
                    </div>
                  } @else if (mostrarForm()) {
                    <div class="solicitud-form">
                      <div class="sf-fechas">
                        <label>
                          Entrada
                          <input type="date" [(ngModel)]="fechaInicioSol"
                                 [min]="casa()!.fecha_disponible_inicio || null"
                                 [max]="casa()!.fecha_disponible_fin || null" />
                        </label>
                        <label>
                          Salida
                          <input type="date" [(ngModel)]="fechaFinSol"
                                 [min]="fechaInicioSol || casa()!.fecha_disponible_inicio || null"
                                 [max]="casa()!.fecha_disponible_fin || null" />
                        </label>
                      </div>
                      <label class="sf-msg">
                        Mensaje (opcional)
                        <textarea [(ngModel)]="mensajeSol" rows="2"
                                  placeholder="Preséntate al propietario..."></textarea>
                      </label>
                      @if (errorSol()) { <div class="sf-error">⚠️ {{ errorSol() }}</div> }
                      <div class="sf-botones">
                        <button class="btn-contactar" (click)="enviarSolicitud()"
                                [disabled]="enviando() || !tieneSuficiente()">
                          {{ enviando() ? 'Enviando...' : 'Confirmar solicitud (' + (casa()!.valor_puntos || 0) + ' pts)' }}
                        </button>
                        <button class="btn-cancelar-sol" (click)="mostrarForm.set(false)">Cancelar</button>
                      </div>
                    </div>
                  } @else {
                    <button class="btn-contactar btn-solicitar"
                            (click)="abrirFormSolicitud()"
                            [disabled]="!tieneSuficiente()">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                           style="width:17px;height:17px">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      Solicitar alquiler
                    </button>
                    @if (!tieneSuficiente()) {
                      <p class="sin-puntos-nota">
                        Te faltan {{ (casa()!.valor_puntos || 0) - auth.puntos() }} puntos.
                        Alquila tu casa a alguien para ganar más.
                      </p>
                    }
                  }
                }

                <div class="contacto-logado">
                  <div class="propietario-row">
                    <div class="prop-avatar" aria-hidden="true">
                      {{ casa()!.propietario ? casa()!.propietario![0].toUpperCase() : '?' }}
                    </div>
                    <div>
                      <strong>{{ casa()!.propietario }}</strong>
                      <span>Propietario</span>
                    </div>
                  </div>

                  <div class="contacto-dato" *ngIf="casa()!.telefono_propietario">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                         style="width:16px;height:16px;flex-shrink:0">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.1 1.18 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                    <div>
                      <span class="dato-label">Teléfono</span>
                      <a [href]="'tel:' + casa()!.telefono_propietario" class="dato-val dato-phone">
                        {{ casa()!.telefono_propietario }}
                      </a>
                    </div>
                  </div>

                  <div class="contacto-dato" *ngIf="casa()!.email_propietario">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                         style="width:16px;height:16px;flex-shrink:0">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <div>
                      <span class="dato-label">Email</span>
                      <a [href]="'mailto:' + casa()!.email_propietario" class="dato-val dato-email">
                        {{ casa()!.email_propietario }}
                      </a>
                    </div>
                  </div>

                  <div class="contacto-dato sin-contacto"
                       *ngIf="!casa()!.telefono_propietario && !casa()!.email_propietario">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                         style="width:16px;height:16px;flex-shrink:0;opacity:.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>El propietario no ha añadido datos de contacto aún.</span>
                  </div>

                  <a *ngIf="casa()!.telefono_propietario"
                     [href]="'tel:' + casa()!.telefono_propietario"
                     class="btn-contactar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                         style="width:17px;height:17px">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.1 1.18 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                    Llamar al propietario
                  </a>
                  <a *ngIf="!casa()!.telefono_propietario && casa()!.email_propietario"
                     [href]="'mailto:' + casa()!.email_propietario"
                     class="btn-contactar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                         style="width:17px;height:17px">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Enviar email
                  </a>
                </div>
              }

              <!-- No logado: gate -->
              @if (!auth.estaLogado()) {
                <div class="gate">
                  <div class="gate-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <h3>¿Te interesa esta casa?</h3>
                  <p>Inicia sesión para ver el teléfono y email del propietario y contactar directamente.</p>
                  <a routerLink="/login" class="btn-contactar">
                    Iniciar sesión para contactar
                  </a>
                  <a routerLink="/login" class="btn-registrar">
                    Crear cuenta gratis
                  </a>
                </div>
              }

              <!-- Nota de precio -->
              <div class="nota-gratis">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                     style="width:14px;height:14px;flex-shrink:0">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                CasaSwap es completamente gratuito. Sin comisiones ni tarifas.
              </div>

            </div>

            <!-- Datos extra -->
            <div class="extra-info">
              <div class="extra-row" *ngIf="casa()!.fecha_publicacion">
                <span>Publicado</span>
                <span>{{ casa()!.fecha_publicacion | date:'d MMM yyyy':'':'es' }}</span>
              </div>
              <div class="extra-row">
                <span>Referencia</span>
                <span>#{{ casa()!.id }}</span>
              </div>
            </div>

          </div>
        </div>
      }

    </div>

    <!-- ── Lightbox de fotos ── -->
    <div class="lightbox" *ngIf="lightboxAbierto"
         (click)="cerrarLightbox()"
         role="dialog" aria-modal="true" aria-label="Galería de fotos">
      <button class="lb-cerrar" (click)="cerrarLightbox()" aria-label="Cerrar galería">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
             style="width:18px;height:18px">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Contador -->
      <div class="lb-counter">{{ lbIdx + 1 }} / {{ getFotos().length }}</div>

      <!-- Imagen principal -->
      <div class="lb-main" (click)="$event.stopPropagation()">
        <button class="lb-prev" (click)="lbPrev()" aria-label="Foto anterior"
                *ngIf="getFotos().length > 1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
               style="width:20px;height:20px">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <img [src]="getFotos()[lbIdx]"
             [alt]="'Foto ' + (lbIdx + 1) + ' de ' + casa()?.titulo"
             class="lb-imagen"
             (click)="$event.stopPropagation()" />

        <button class="lb-next" (click)="lbNex()" aria-label="Siguiente foto"
                *ngIf="getFotos().length > 1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
               style="width:20px;height:20px">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <!-- Strip de thumbnails -->
      <div class="lb-strip" (click)="$event.stopPropagation()">
        @for (foto of getFotos(); track foto; let i = $index) {
          <div class="lb-thumb"
               [style.background-image]="'url(' + foto + ')'"
               [class.active]="i === lbIdx"
               (click)="lbIdx = i"
               role="button" tabindex="0"
               (keydown.enter)="lbIdx = i"
               [attr.aria-label]="'Ver foto ' + (i + 1)">
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .pagina {
      min-height: 100vh;
      background: #EFF4FA;
    }

    /* ── Loading / Error ── */
    .loading-screen, .error-screen {
      min-height: 80vh; display: flex; align-items: center; justify-content: center;
    }
    .loading-inner, .error-inner {
      text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;
      color: rgba(30,54,80,.45);
    }
    .spinner {
      width: 44px; height: 44px; border-radius: 50%;
      border: 2px solid rgba(44,74,110,.15); border-top-color: #2C4A6E;
      animation: spin .75s linear infinite; display: block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-inner p { font-size: .95rem; }
    .error-ico { font-size: 3rem; opacity: .3; }
    .error-inner h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; font-weight: 400; color: #1E3650; }
    .error-inner p  { color: rgba(30,54,80,.5); }

    /* ── Topbar ── */
    .topbar {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 24px;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(44,74,110,.08);
      box-shadow: 0 2px 12px rgba(30,54,80,.06);
      position: sticky; top: 66px; z-index: 50;
    }
    .btn-back {
      display: flex; align-items: center; gap: 5px;
      background: none; border: none; color: rgba(30,54,80,.6);
      font-size: .87rem; font-weight: 500; cursor: pointer;
      padding: 6px 10px; border-radius: 8px; transition: all .18s;
      flex-shrink: 0; font-family: inherit;
      box-shadow: none !important; transform: none !important;
    }
    .btn-back svg { width: 16px; height: 16px; }
    .btn-back:hover { background: rgba(44,74,110,.07); color: #2C4A6E; transform: none !important; }
    .topbar-title {
      flex: 1; font-size: .92rem; font-weight: 600; color: #1E3650;
      overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
    }
    .topbar-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .btn-share {
      display: flex; align-items: center; gap: 6px;
      background: none; border: 1px solid rgba(44,74,110,.18); color: rgba(30,54,80,.6);
      font-size: .82rem; font-weight: 500; cursor: pointer;
      padding: 6px 14px; border-radius: 100px; transition: all .18s; font-family: inherit;
      box-shadow: none !important;
    }
    .btn-share:hover { background: rgba(44,74,110,.05); color: #2C4A6E; border-color: rgba(44,74,110,.3); transform: none; }

    /* ── Galería hero (Airbnb 5-photo) ── */
    .galeria-hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 420px;
      gap: 4px;
      position: relative;
      overflow: hidden;
    }
    .foto-grande {
      background: #D0DAE6 center/cover no-repeat;
      cursor: pointer; position: relative;
      transition: filter .22s;
      grid-row: 1;
    }
    .foto-grande:hover { filter: brightness(.92); }
    .foto-grande:focus-visible { outline: 3px solid #2C4A6E; outline-offset: -3px; }
    .foto-placeholder {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 5rem; opacity: .18;
    }
    .fotos-grid {
      display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 4px;
    }
    .foto-small {
      background: #D0DAE6 center/cover no-repeat;
      cursor: pointer; position: relative; overflow: hidden;
      transition: filter .22s;
    }
    .foto-small:hover { filter: brightness(.9); }
    .foto-small:focus-visible { outline: 3px solid #2C4A6E; outline-offset: -3px; }
    .foto-small-empty {
      background: rgba(44,74,110,.06);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; opacity: .2; cursor: default;
    }
    .foto-small-empty:hover { filter: none; }
    .ver-mas-overlay {
      position: absolute; inset: 0;
      background: rgba(15,30,55,.55);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; color: #fff; font-size: .92rem; font-weight: 600;
      cursor: pointer;
    }
    .btn-todas-fotos {
      position: absolute; bottom: 16px; right: 16px;
      display: flex; align-items: center; gap: 7px;
      background: rgba(255,255,255,.95); color: #1E3650;
      border: 1px solid rgba(44,74,110,.2); border-radius: 10px;
      padding: 9px 18px; font-size: .83rem; font-weight: 600;
      cursor: pointer; transition: all .18s; font-family: inherit;
      box-shadow: 0 2px 12px rgba(30,54,80,.12);
    }
    .btn-todas-fotos:hover {
      background: #fff; border-color: rgba(44,74,110,.35);
      box-shadow: 0 4px 20px rgba(30,54,80,.18); transform: none;
    }

    /* ── Cuerpo 2 columnas ── */
    .cuerpo {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 48px;
      max-width: 1160px; margin: 0 auto;
      padding: 40px 24px 64px;
    }

    /* ── Columna info ── */
    .info-header {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
      margin-bottom: 24px;
    }
    .info-header-main { flex: 1; }
    .badge-tipo {
      display: inline-block;
      background: rgba(44,74,110,.08); border: 1px solid rgba(44,74,110,.16);
      color: #2C4A6E; font-size: .7rem; font-weight: 700;
      padding: 3px 12px; border-radius: 100px; text-transform: uppercase;
      letter-spacing: .08em; margin-bottom: 10px;
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.2rem; font-weight: 400; color: #1E3650;
      line-height: 1.1; margin-bottom: 10px; letter-spacing: -.5px;
    }
    .ubicacion-rapida {
      display: flex; align-items: center; gap: 6px;
      font-size: .9rem; color: rgba(30,54,80,.5);
    }
    .info-header-badge {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 7px 16px; border-radius: 100px;
      background: rgba(192,80,80,.08); border: 1px solid rgba(192,80,80,.2);
      color: #C05050; font-size: .78rem; font-weight: 600;
      white-space: nowrap; flex-shrink: 0;
    }
    .info-header-badge.disponible {
      background: rgba(39,102,87,.08); border-color: rgba(39,102,87,.2);
      color: #276657;
    }
    .disponible-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: currentColor;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%,100% { opacity: 1; transform: scale(1); }
      50%      { opacity: .5; transform: scale(1.3); }
    }

    .separator {
      height: 1px; background: rgba(44,74,110,.08);
      margin: 28px 0;
    }

    /* Quick stats */
    .quick-stats {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px;
    }
    .qs-item {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      background: #fff; border: 1px solid rgba(44,74,110,.1); border-radius: 14px;
      box-shadow: 0 1px 6px rgba(30,54,80,.05);
    }
    .qs-item svg { width: 22px; height: 22px; stroke: #2C4A6E; flex-shrink: 0; }
    .qs-item div { display: flex; flex-direction: column; }
    .qs-item strong { font-size: .95rem; color: #1E3650; font-weight: 700; line-height: 1.2; }
    .qs-item span   { font-size: .72rem; color: rgba(30,54,80,.4); margin-top: 2px; }

    /* Descripción */
    .seccion { }
    .seccion-titulo {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.4rem; font-weight: 400; color: #1E3650; margin-bottom: 16px;
    }
    .descripcion-texto {
      font-size: .95rem; color: rgba(30,54,80,.65); line-height: 1.8;
      max-height: 120px; overflow: hidden; transition: max-height .3s ease;
    }
    .descripcion-texto.expandida { max-height: 2000px; }
    .btn-expandir {
      background: none; border: none; color: #2C4A6E; font-size: .88rem; font-weight: 600;
      cursor: pointer; margin-top: 10px; padding: 0; font-family: inherit;
      box-shadow: none; transform: none !important; text-decoration: underline;
    }
    .btn-expandir:hover { color: #3D8B7A; transform: none !important; box-shadow: none; }

    /* Mapa Leaflet */
    .mapa-leaflet {
      height: 280px; border-radius: 16px; overflow: hidden;
      border: 1px solid rgba(44,74,110,.12);
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(30,54,80,.10);
      background: #D5E2F0;
    }
    /* Override Leaflet popup to match theme */
    :host ::ng-deep .leaflet-popup-content-wrapper {
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(30,54,80,.18) !important;
      border: 1px solid rgba(44,74,110,.12) !important;
    }
    :host ::ng-deep .leaflet-popup-content {
      font-family: inherit !important;
      font-size: .88rem !important;
      color: #1E3650 !important;
    }
    :host ::ng-deep .leaflet-control-attribution {
      font-size: .65rem !important;
      background: rgba(255,255,255,.75) !important;
    }

    /* Ubicación detail */
    .ubicacion-detail { display: flex; flex-direction: column; gap: 0; }
    .ubi-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(44,74,110,.07);
    }
    .ubi-row:last-child { border-bottom: none; }
    .ubi-label { font-size: .82rem; color: rgba(30,54,80,.45); font-weight: 500; }
    .ubi-val   { font-size: .88rem; color: #1E3650; font-weight: 600; }

    /* Host */
    .host-card {
      display: flex; align-items: center; gap: 16px;
      padding: 18px; background: #fff;
      border: 1px solid rgba(44,74,110,.10); border-radius: 16px;
      box-shadow: 0 2px 10px rgba(30,54,80,.06);
    }
    .host-avatar {
      width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: 1.3rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(44,74,110,.25);
    }
    .host-info { display: flex; flex-direction: column; gap: 3px; }
    .host-info strong { font-size: 1rem; color: #1E3650; font-weight: 700; }
    .host-info span   { font-size: .82rem; color: rgba(30,54,80,.45); }

    /* ── Columna contacto (sticky) ── */
    .col-contacto { }
    .contacto-card {
      background: #fff;
      border: 1px solid rgba(44,74,110,.12);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 4px 32px rgba(30,54,80,.10);
      position: sticky; top: 122px;
    }

    .contacto-header {
      display: flex; align-items: center; gap: 14px; margin-bottom: 22px;
      padding-bottom: 20px; border-bottom: 1px solid rgba(44,74,110,.08);
    }
    .contacto-header-ico {
      width: 52px; height: 52px; border-radius: 14px;
      background: linear-gradient(135deg, rgba(44,74,110,.08), rgba(61,139,122,.08));
      border: 1px solid rgba(44,74,110,.1);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .contacto-lema { font-size: 1rem; color: #1E3650; font-weight: 600; margin-bottom: 2px; }
    .contacto-lema span { color: #3D8B7A; }
    .contacto-sub { font-size: .8rem; color: rgba(30,54,80,.45); }

    /* Logado */
    .contacto-logado { display: flex; flex-direction: column; gap: 14px; }
    .propietario-row {
      display: flex; align-items: center; gap: 12px;
      padding: 14px;
      background: rgba(44,74,110,.04); border-radius: 12px;
    }
    .prop-avatar {
      width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: 1rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .propietario-row div { display: flex; flex-direction: column; gap: 2px; }
    .propietario-row strong { font-size: .95rem; color: #1E3650; font-weight: 700; }
    .propietario-row span  { font-size: .78rem; color: rgba(30,54,80,.45); }

    .contacto-dato {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px;
      background: rgba(44,74,110,.03);
      border: 1px solid rgba(44,74,110,.09);
      border-radius: 12px;
    }
    .contacto-dato svg { margin-top: 2px; stroke: #3D8B7A; }
    .contacto-dato div { display: flex; flex-direction: column; gap: 2px; }
    .dato-label { font-size: .72rem; color: rgba(30,54,80,.4); font-weight: 500; text-transform: uppercase; letter-spacing: .05em; }
    .dato-val   { font-size: .92rem; color: #1E3650; font-weight: 600; }
    .dato-phone { color: #2C4A6E; text-decoration: none; }
    .dato-phone:hover { text-decoration: underline; }
    .dato-email { color: #3D8B7A; text-decoration: none; word-break: break-all; }
    .dato-email:hover { text-decoration: underline; }
    .sin-contacto { color: rgba(30,54,80,.45); font-size: .84rem; }

    .btn-contactar {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px 20px; border-radius: 14px;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: .92rem; font-weight: 700;
      text-decoration: none; border: none; cursor: pointer;
      transition: all .22s; font-family: inherit;
      box-shadow: 0 4px 18px rgba(44,74,110,.3);
    }
    .btn-contactar:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(44,74,110,.45);
    }
    .btn-registrar {
      display: flex; align-items: center; justify-content: center;
      width: 100%; padding: 12px 20px; border-radius: 14px;
      border: 1.5px solid rgba(44,74,110,.22);
      background: transparent; color: #2C4A6E;
      font-size: .9rem; font-weight: 600; text-decoration: none;
      transition: all .2s; font-family: inherit;
    }
    .btn-registrar:hover { background: rgba(44,74,110,.04); border-color: rgba(44,74,110,.4); }

    /* Gate (no logado) */
    .gate { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
    .gate-ico {
      width: 54px; height: 54px; border-radius: 50%;
      background: rgba(44,74,110,.07); border: 1px solid rgba(44,74,110,.14);
      display: flex; align-items: center; justify-content: center;
    }
    .gate-ico svg { width: 22px; height: 22px; stroke: #2C4A6E; }
    .gate h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.2rem; font-weight: 400; color: #1E3650;
    }
    .gate p { font-size: .85rem; color: rgba(30,54,80,.55); line-height: 1.6; }
    .gate .btn-contactar { margin-bottom: 2px; }

    .nota-gratis {
      display: flex; align-items: center; gap: 7px;
      margin-top: 16px; padding-top: 16px;
      border-top: 1px solid rgba(44,74,110,.08);
      font-size: .76rem; color: rgba(30,54,80,.4);
    }
    .nota-gratis svg { stroke: #3D8B7A; }

    /* ── Amenidades (detalle) ── */
    .amenidades { display: flex; flex-direction: column; gap: 0; margin-bottom: 16px; }
    .amenidad {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 0; border-bottom: 1px solid rgba(44,74,110,.07);
      font-size: .92rem; color: #1E3650;
    }
    .amenidad:last-child { border-bottom: none; }
    .amenidad.no { color: rgba(30,54,80,.35); }
    .amenidad.no .am-emoji { filter: grayscale(1); opacity: .5; }
    .am-emoji { font-size: 1.2rem; }
    .am-check { margin-left: auto; font-weight: 800; color: #276657; }
    .amenidad.no .am-check { color: rgba(30,54,80,.3); }
    .disponibilidad {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      margin-top: 14px; padding: 12px 16px;
      background: rgba(61,139,122,.07); border: 1px solid rgba(61,139,122,.18);
      border-radius: 12px; font-size: .87rem; color: rgba(30,54,80,.6);
    }
    .disponibilidad svg { stroke: #3D8B7A; }
    .disponibilidad strong { color: #276657; }

    /* ── Coste en puntos (card) ── */
    .coste-banner {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 18px; margin-bottom: 18px;
      background: linear-gradient(135deg, rgba(44,74,110,.06), rgba(61,139,122,.08));
      border: 1px solid rgba(44,74,110,.14); border-radius: 16px;
    }
    .coste-num { display: flex; align-items: baseline; gap: 7px; }
    .coste-ico { color: #3D8B7A; font-size: 1.1rem; align-self: center; }
    .coste-num strong {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2rem; font-weight: 600; color: #2C4A6E; line-height: 1;
    }
    .coste-lbl { font-size: .74rem; color: rgba(30,54,80,.45); }
    .coste-saldo {
      font-size: .76rem; color: rgba(30,54,80,.5); text-align: right;
    }
    .coste-saldo b { color: #276657; font-size: .9rem; }
    .coste-saldo.insuficiente b { color: #C05050; }

    .mi-casa-nota {
      display: flex; align-items: center; gap: 8px;
      padding: 13px 16px; margin-bottom: 16px;
      background: rgba(44,74,110,.05); border: 1px solid rgba(44,74,110,.12);
      border-radius: 12px; font-size: .84rem; color: rgba(30,54,80,.6); line-height: 1.5;
    }

    .btn-solicitar { margin-bottom: 8px; }
    .sin-puntos-nota {
      font-size: .78rem; color: #B06A3A; line-height: 1.5;
      background: rgba(201,169,110,.1); border: 1px solid rgba(201,169,110,.25);
      padding: 9px 13px; border-radius: 10px; margin-bottom: 12px;
    }

    /* Formulario solicitud */
    .solicitud-form {
      padding: 16px; margin-bottom: 16px;
      background: rgba(44,74,110,.03); border: 1px solid rgba(44,74,110,.12);
      border-radius: 14px;
    }
    .sf-fechas { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .sf-fechas label, .sf-msg {
      display: flex; flex-direction: column; gap: 5px;
      font-size: .72rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: .04em; color: rgba(30,54,80,.5);
    }
    .sf-msg { margin-bottom: 12px; }
    .solicitud-form input, .solicitud-form textarea {
      padding: 9px 12px; border-radius: 10px;
      border: 1px solid rgba(44,74,110,.16); background: #fff;
      color: #1E3650; font-size: .88rem; font-family: inherit; outline: none;
      text-transform: none; letter-spacing: 0; font-weight: 400;
    }
    .solicitud-form input:focus, .solicitud-form textarea:focus {
      border-color: #2C4A6E; box-shadow: 0 0 0 3px rgba(44,74,110,.1);
    }
    .solicitud-form textarea { resize: vertical; }
    .sf-error {
      font-size: .8rem; color: #C05050; margin-bottom: 10px;
      background: rgba(192,80,80,.07); padding: 7px 11px; border-radius: 8px;
    }
    .sf-botones { display: flex; flex-direction: column; gap: 8px; }
    .btn-cancelar-sol {
      background: none; border: none; color: rgba(30,54,80,.5);
      font-size: .84rem; cursor: pointer; padding: 4px; font-family: inherit;
      box-shadow: none; transition: color .15s;
    }
    .btn-cancelar-sol:hover { color: #1E3650; transform: none; box-shadow: none; }

    .solicitud-ok {
      display: flex; align-items: center; gap: 12px;
      padding: 16px; margin-bottom: 16px;
      background: rgba(39,102,87,.08); border: 1px solid rgba(39,102,87,.22);
      border-radius: 14px;
    }
    .sok-ico {
      width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
      background: #276657; color: #fff; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .solicitud-ok div { display: flex; flex-direction: column; gap: 2px; }
    .solicitud-ok strong { font-size: .92rem; color: #276657; }
    .solicitud-ok span { font-size: .8rem; color: rgba(30,54,80,.55); line-height: 1.4; }

    /* Extra info */
    .extra-info {
      margin-top: 12px; padding: 16px 20px;
      background: rgba(255,255,255,.7);
      border: 1px solid rgba(44,74,110,.09); border-radius: 14px;
    }
    .extra-row {
      display: flex; justify-content: space-between;
      font-size: .82rem; padding: 6px 0;
      border-bottom: 1px solid rgba(44,74,110,.06);
    }
    .extra-row:last-child { border-bottom: none; }
    .extra-row span:first-child { color: rgba(30,54,80,.45); }
    .extra-row span:last-child  { color: #1E3650; font-weight: 600; }

    /* ── Lightbox ── */
    .lightbox {
      position: fixed; inset: 0;
      background: rgba(5,12,25,.94);
      z-index: 500;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      animation: fadeIn .2s ease;
      padding: 20px;
    }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    .lb-cerrar {
      position: absolute; top: 18px; right: 20px;
      width: 42px; height: 42px; border-radius: 50%;
      background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.8); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .18s; z-index: 10; box-shadow: none;
    }
    .lb-cerrar:hover { background: rgba(255,255,255,.18); color: #fff; transform: none; box-shadow: none; }
    .lb-counter {
      position: absolute; top: 22px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,.7); font-size: .85rem; font-weight: 600;
      background: rgba(255,255,255,.08); padding: 5px 16px; border-radius: 100px;
    }
    .lb-main {
      flex: 1; display: flex; align-items: center; justify-content: center;
      gap: 16px; width: 100%; max-height: calc(100vh - 140px);
      padding: 50px 0 20px;
    }
    .lb-prev, .lb-next {
      width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.9); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .18s; box-shadow: none;
    }
    .lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,.2); transform: none; box-shadow: none; }
    .lb-imagen {
      max-width: calc(100% - 140px); max-height: 100%;
      object-fit: contain; border-radius: 12px;
      box-shadow: 0 20px 80px rgba(0,0,0,.5);
      animation: zoomIn .22s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes zoomIn {
      from { transform: scale(.9); opacity:0 }
      to   { transform: scale(1);  opacity:1 }
    }
    .lb-strip {
      display: flex; gap: 8px; padding: 12px 20px;
      overflow-x: auto; max-width: 100%;
      -ms-overflow-style: none; scrollbar-width: none;
    }
    .lb-strip::-webkit-scrollbar { display: none; }
    .lb-thumb {
      width: 68px; height: 52px; border-radius: 8px; flex-shrink: 0;
      background: rgba(255,255,255,.15) center/cover no-repeat;
      border: 2px solid transparent; cursor: pointer;
      transition: all .18s; opacity: .6;
    }
    .lb-thumb.active { border-color: #fff; opacity: 1; box-shadow: 0 0 0 1px rgba(255,255,255,.3); }
    .lb-thumb:hover:not(.active) { opacity: .85; border-color: rgba(255,255,255,.4); }

    /* Responsive */
    @media (max-width: 900px) {
      .galeria-hero { grid-template-columns: 1fr; grid-template-rows: 320px auto; }
      .fotos-grid { grid-template-rows: 120px; grid-template-columns: repeat(4, 1fr); }
      .cuerpo { grid-template-columns: 1fr; gap: 28px; padding: 24px 16px 48px; }
      .col-contacto { order: -1; }
      .contacto-card { position: static; }
      h1 { font-size: 1.8rem; }
      .info-header { flex-direction: column; }
      .quick-stats { grid-template-columns: 1fr 1fr; }
      .lb-imagen { max-width: calc(100% - 40px); }
      .lb-prev, .lb-next { width: 38px; height: 38px; }
    }
    @media (max-width: 640px) {
      .galeria-hero { grid-template-rows: 260px auto; }
      .fotos-grid { grid-template-rows: 90px; }
      .topbar-title { display: none; }
    }

    /* Botón primary global (para error screen) */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px; border-radius: 100px;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-weight: 700; font-size: .9rem;
      text-decoration: none; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(44,74,110,.3);
      transition: all .2s; font-family: inherit;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(44,74,110,.4); }
  `]
})
/**
 * Ficha detallada de una vivienda (ruta /casa/:id). Muestra la galeria de
 * fotos con visor a pantalla completa, el mapa real de la ubicacion, los
 * servicios, la disponibilidad y el formulario para solicitar el alquiler.
 */
export class DetalleCasaComponent implements OnInit, OnDestroy {

  casa       = signal<Casa | null>(null);
  cargando   = signal(true);

  // Lightbox
  lightboxAbierto = false;
  lbIdx = 0;

  // Descripción expandida
  descripcionExpandida = false;

  // Solicitud de alquiler
  mostrarForm      = signal(false);
  enviando         = signal(false);
  solicitudEnviada = signal(false);
  errorSol         = signal('');
  fechaInicioSol   = '';
  fechaFinSol      = '';
  mensajeSol       = '';

  // Leaflet map instance
  private leafletMap: any = null;

  // Coordenadas por ciudad/barrio (lat, lng)
  private readonly coordMap: Record<string, [number, number]> = {
    // ciudades
    'sevilla':   [37.3828, -5.9731],
    'bilbao':    [43.2630, -2.9350],
    'madrid':    [40.4168, -3.7038],
    'barcelona': [41.3851,  2.1734],
    'valencia':  [39.4699, -0.3763],
    'malaga':    [36.7202, -4.4203],
    'granada':   [37.1773, -3.5986],
    'zaragoza':  [41.6488, -0.8891],
    // barrios específicos
    'santa cruz':  [37.3857, -5.9917],
    'triana':      [37.3846, -6.0003],
    'abando':      [43.2625, -2.9349],
    'el retiro':   [40.4152, -3.6823],
    'retiro':      [40.4152, -3.6823],
    'barceloneta': [41.3800,  2.1897],
    'gracia':      [41.4032,  2.1580],
    'eixample':    [41.3918,  2.1656],
  };

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private api:    ApiService,
    public  auth:   AuthService,
    private toast:  ToastService,
    private zone:   NgZone
  ) {
    // Cuando los datos lleguen, inicializar el mapa
    effect(() => {
      const c = this.casa();
      const loading = this.cargando();
      if (c && !loading) {
        // Esperar un tick para que Angular renderice el div del mapa
        setTimeout(() => this.initMap(c), 80);
      }
    });
  }

  ngOnInit(): void {
    if (this.auth.estaLogado()) this.auth.refrescarPuntos();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.cargando.set(false); return; }

    this.api.obtenerCasa(id).subscribe({
      next: data => {
        // Parsear fotos si llegaran como string
        if (data && typeof (data as any).fotos === 'string') {
          try { (data as any).fotos = JSON.parse((data as any).fotos); }
          catch { (data as any).fotos = []; }
        }
        this.casa.set(data ?? null);
        this.cargando.set(false);
      },
      error: () => {
        this.casa.set(null);
        this.cargando.set(false);
      }
    });
  }

  // ── Mapa Leaflet ──────────────────────────────────────────────────────────

  private getCoordenadas(c: Casa): [number, number] {
    const norm = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    const barrio = norm(c.barrio ?? '');
    const ciudad = norm(c.ciudad ?? '');
    return this.coordMap[barrio] ?? this.coordMap[ciudad] ?? [40.4168, -3.7038];
  }

  private cargarLeafletCSS(): void {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id   = 'leaflet-css';
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  private async initMap(c: Casa): Promise<void> {
    const el = document.getElementById('mapa-leaflet');
    if (!el || this.leafletMap) return;
    this.cargarLeafletCSS();
    const coords = this.getCoordenadas(c);
    // Dynamic import — works everywhere, no SSR issues
    const L = await import('leaflet' as any);
    this.zone.run(() => {
      this.leafletMap = L.map(el, { zoomControl: true, scrollWheelZoom: false })
        .setView(coords, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.leafletMap);

      // Marker with custom icon matching our theme
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          background:linear-gradient(135deg,#2C4A6E,#3D8B7A);
          transform:rotate(-45deg);
          box-shadow:0 4px 16px rgba(44,74,110,.45);
          border:3px solid #fff;
        "></div>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
        popupAnchor:[0, -40],
      });

      const label = [c.barrio, c.ciudad].filter(Boolean).join(', ');
      L.marker(coords, { icon })
        .addTo(this.leafletMap)
        .bindPopup(`<strong>${label}</strong>${c.direccion ? '<br><span style="color:rgba(30,54,80,.55)">' + c.direccion + '</span>' : ''}`)
        .openPopup();
    });
  }

  ngOnDestroy(): void {
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.lightboxAbierto) return;
    if (e.key === 'Escape')     { this.cerrarLightbox(); }
    if (e.key === 'ArrowLeft')  { this.lbPrev(); }
    if (e.key === 'ArrowRight') { this.lbNex(); }
  }

  /** Array de todas las fotos: fotos[] > [imagen_url] > [] */
  getFotos(): string[] {
    const c = this.casa();
    if (!c) return [];
    if (c.fotos && c.fotos.length > 0) return c.fotos;
    if (c.imagen_url) return [c.imagen_url];
    return [];
  }

  /** Placeholders para completar el grid hasta 4 fotos pequeñas */
  fotosPlaceholder = computed(() => {
    const n = Math.min(4, Math.max(0, 4 - (this.getFotos().length - 1)));
    return Array(n).fill(0);
  });

  tipoLabel(): string {
    const labels: Record<string, string> = {
      piso: 'Piso', casa: 'Casa', chalet: 'Chalet', apartamento: 'Apartamento'
    };
    return labels[this.casa()?.tipo_vivienda ?? ''] ?? this.casa()?.tipo_vivienda ?? '';
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────

  abrirLightbox(idx: number): void {
    if (!this.getFotos().length) return;
    this.lbIdx = Math.min(idx, this.getFotos().length - 1);
    this.lightboxAbierto = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarLightbox(): void {
    this.lightboxAbierto = false;
    document.body.style.overflow = '';
  }

  lbPrev(): void {
    const n = this.getFotos().length;
    this.lbIdx = (this.lbIdx - 1 + n) % n;
  }
  lbNex(): void {
    const n = this.getFotos().length;
    this.lbIdx = (this.lbIdx + 1) % n;
  }

  // ── Navegación ────────────────────────────────────────────────────────────

  volver(): void { this.router.navigate(['/']); }

  // ── Solicitud de alquiler ───────────────────────────────────────────────────

  esMiCasa(): boolean {
    return this.auth.getIdUsuario() === this.casa()?.usuario_id;
  }

  costePuntos(): number {
    const c = this.casa();
    return c ? (c.valor_puntos || c.puntos_base || 0) : 0;
  }

  tieneSuficiente(): boolean {
    return this.auth.puntos() >= this.costePuntos();
  }

  abrirFormSolicitud(): void {
    const c = this.casa();
    this.fechaInicioSol = c?.fecha_disponible_inicio || '';
    this.fechaFinSol    = c?.fecha_disponible_fin    || '';
    this.mensajeSol     = '';
    this.errorSol.set('');
    this.mostrarForm.set(true);
  }

  enviarSolicitud(): void {
    const c = this.casa();
    const inquilinoId = this.auth.getIdUsuario();
    if (!c || !c.id || !inquilinoId) return;

    if (this.fechaInicioSol && this.fechaFinSol &&
        new Date(this.fechaFinSol) < new Date(this.fechaInicioSol)) {
      this.errorSol.set('La fecha de salida no puede ser anterior a la de entrada.');
      return;
    }

    this.errorSol.set('');
    this.enviando.set(true);

    const solicitud: Solicitud = {
      casa_id:        c.id,
      inquilino_id:   inquilinoId,
      propietario_id: c.usuario_id,
      puntos:         this.costePuntos(),
      fecha_inicio:   this.fechaInicioSol || undefined,
      fecha_fin:      this.fechaFinSol || undefined,
      mensaje:        this.mensajeSol || undefined
    };

    this.api.crearSolicitud(solicitud).subscribe({
      next: res => {
        this.enviando.set(false);
        if (res.result === 'OK') {
          this.mostrarForm.set(false);
          this.solicitudEnviada.set(true);
          this.toast.show('Solicitud enviada al propietario.');
        } else {
          this.errorSol.set(res.error || 'No se pudo enviar la solicitud.');
        }
      },
      error: () => {
        this.enviando.set(false);
        this.errorSol.set('Error de conexión con el servidor.');
      }
    });
  }

  compartir(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: this.casa()?.titulo ?? 'Casa', url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Enlace copiado al portapapeles'));
    }
  }
}
