import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Casa } from '../models/casa';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- ══ Hero ══ -->
    <section class="hero" aria-label="Inicio CasaSwap">

      <!-- Video background (scroll-driven) -->
      <div class="hero-video-wrap" aria-hidden="true">
        <video #bgVideo
          src="video/background.mp4"
          muted playsinline preload="auto"
          class="hero-video">
        </video>
        <div class="hero-video-overlay"></div>
        <span class="float-house fh-1" aria-hidden="true">🏠</span>
        <span class="float-house fh-2" aria-hidden="true">🏡</span>
        <span class="float-house fh-3" aria-hidden="true">🏘️</span>
      </div>

      <div class="hero-inner">

        <div class="eyebrow-wrap">
          <span class="eyebrow-dot"></span>
          <p class="hero-eyebrow">Intercambio de casas en España · Gratuito · Sin intermediarios</p>
        </div>
        <h1 class="hero-title">
          Intercambia tu casa,<br>
          <span class="hero-title-accent">descubre España</span>
        </h1>
        <p class="hero-sub">
          Publica tu vivienda y encuentra tu destino ideal entre cientos de propietarios.<br>
          Sin pagos. Sin agencias. Solo intercambios reales.
        </p>

        <!-- Stats (tras carga) -->
        <div class="hero-stats" *ngIf="!cargando" aria-label="Estadísticas">
          <div class="stat-item">
            <span class="stat-n">{{ casas.length }}</span>
            <span class="stat-l">casas activas</span>
          </div>
          <div class="stat-sep" aria-hidden="true"></div>
          <div class="stat-item">
            <span class="stat-n">50</span>
            <span class="stat-l">provincias</span>
          </div>
          <div class="stat-sep" aria-hidden="true"></div>
          <div class="stat-item">
            <span class="stat-n">0€</span>
            <span class="stat-l">de coste</span>
          </div>
        </div>
        <!-- Stats skeleton -->
        <div class="hero-stats" *ngIf="cargando" aria-hidden="true">
          <div class="stat-item"><div class="skel-stat"></div><div class="skel-stat-sub"></div></div>
          <div class="stat-sep"></div>
          <div class="stat-item"><div class="skel-stat"></div><div class="skel-stat-sub"></div></div>
          <div class="stat-sep"></div>
          <div class="stat-item"><div class="skel-stat"></div><div class="skel-stat-sub"></div></div>
        </div>

        <!-- Filtros -->
        <div class="buscador" role="search" aria-label="Filtrar casas disponibles">
          <div class="select-wrap">
            <svg class="select-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <select [(ngModel)]="filtroProvincia" (change)="filtrar()" aria-label="Filtrar por provincia">
              <option value="">Todas las provincias</option>
              <option *ngFor="let p of provincias" [value]="p">{{ p }}</option>
            </select>
          </div>
          <div class="select-wrap">
            <svg class="select-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <select [(ngModel)]="filtroTipo" (change)="filtrar()" aria-label="Filtrar por tipo de vivienda">
              <option value="">Cualquier tipo</option>
              <option value="piso">Piso</option>
              <option value="casa">Casa</option>
              <option value="chalet">Chalet</option>
              <option value="apartamento">Apartamento</option>
            </select>
          </div>
          <div class="select-wrap date-wrap">
            <svg class="select-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input type="date" [(ngModel)]="filtroFechaInicio" (change)="filtrar()"
                   aria-label="Fecha de entrada" title="Entrada" />
          </div>
          <div class="select-wrap date-wrap">
            <svg class="select-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input type="date" [(ngModel)]="filtroFechaFin" (change)="filtrar()"
                   [min]="filtroFechaInicio || null"
                   aria-label="Fecha de salida" title="Salida" />
          </div>
          <button class="btn-clear" (click)="limpiarFiltros()" aria-label="Limpiar filtros activos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                 style="width:13px;height:13px">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Limpiar
          </button>
        </div>

        <!-- CTA strip para no logados -->
        <div class="cta-strip" *ngIf="!auth.estaLogado()">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2C4A6E" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
               style="width:16px;height:16px;flex-shrink:0">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <p class="cta-strip-text">¿Encuentras algo que te gusta? Regístrate gratis para contactar con los propietarios</p>
          <div class="cta-strip-btns">
            <a class="btn-cta-primary" routerLink="/login">Crear cuenta gratis</a>
            <a class="btn-cta-ghost"   routerLink="/login">Iniciar sesión</a>
          </div>
        </div>

      </div>
    </section>

    <!-- ══ Listado ══ -->
    <main class="contenido">

      <div *ngIf="error" class="msg-error" role="alert">{{ error }}</div>

      <div class="contador-bar" *ngIf="!cargando && casasFiltradas.length > 0">
        <p class="contador" aria-live="polite">
          <strong>{{ casasFiltradas.length }}</strong>
          {{ casasFiltradas.length === 1 ? 'casa disponible' : 'casas disponibles' }}
        </p>
        <div class="divider-line"></div>
      </div>

      <!-- Skeleton -->
      <div class="grid" *ngIf="cargando" aria-busy="true" aria-label="Cargando casas">
        <div class="tarjeta-skel" *ngFor="let s of skelArray" aria-hidden="true">
          <div class="skel-img"></div>
          <div class="skel-body">
            <div class="skel-line skel-title"></div>
            <div class="skel-line skel-sub"></div>
            <div class="skel-line skel-short"></div>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid" *ngIf="!cargando && casasFiltradas.length > 0" role="list" aria-label="Casas disponibles">
        <div class="tarjeta" *ngFor="let c of casasFiltradas"
             (click)="verDetalle(c)" (keydown.enter)="verDetalle(c)"
             role="listitem" tabindex="0"
             [attr.aria-label]="c.titulo + ' en ' + c.ciudad + ', ' + c.provincia">

          <div class="tarjeta-img"
               [style.background-image]="getCoverUrl(c) ? 'url(' + getCoverUrl(c) + ')' : 'none'">
            <div class="tarjeta-img-placeholder" *ngIf="!getCoverUrl(c)" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="tarjeta-img-overlay"></div>
            <span class="badge-tipo">{{ c.tipo_vivienda }}</span>
            <span class="badge-puntos" *ngIf="c.valor_puntos">
              <span class="bp-ico" aria-hidden="true">◈</span>{{ c.valor_puntos }} pts
            </span>
            <!-- Photo count badge -->
            <span class="badge-fotos" *ngIf="getFotos(c).length > 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
                   style="width:11px;height:11px">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {{ getFotos(c).length }}
            </span>
          </div>

          <div class="tarjeta-body">
            <h3>{{ c.titulo }}</h3>
            <p class="lugar">
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ c.barrio ? c.barrio + ', ' : '' }}{{ c.ciudad }}, {{ c.provincia }}</span>
            </p>
            <p class="info">
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2 4h20v16H2z"/><path d="M2 9h20"/><path d="M7 9v11"/>
              </svg>
              {{ c.num_habitaciones }} hab.
              <span class="sep">·</span>
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              {{ c.capacidad }} personas
            </p>
            <div class="amenities" *ngIf="c.tiene_piscina || c.tiene_patio || c.acepta_mascotas">
              <span class="am-chip" *ngIf="c.tiene_piscina">🏊 Piscina</span>
              <span class="am-chip" *ngIf="c.tiene_patio">🌳 Patio</span>
              <span class="am-chip" *ngIf="c.acepta_mascotas">🐾 Mascotas</span>
            </div>
            <p class="descripcion" *ngIf="c.descripcion">
              {{ c.descripcion | slice:0:85 }}{{ c.descripcion!.length > 85 ? '…' : '' }}
            </p>
            <div class="propietario-row">
              <div class="avatar-prop" aria-hidden="true">{{ c.propietario ? c.propietario[0] : '?' }}</div>
              <span>{{ c.propietario }}</span>
              <span class="ver-mas">Ver detalle →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div class="vacio" *ngIf="!cargando && casasFiltradas.length === 0 && !error" role="status">
        <div class="vacio-ico" aria-hidden="true">🏠</div>
        <h3>No hay casas con esos filtros</h3>
        <p>Prueba con otros criterios de búsqueda</p>
        <button class="btn-limpiar" (click)="limpiarFiltros()">Ver todas</button>
      </div>

    </main>

    <!-- El detalle se muestra en /casa/:id -->
  `,
  styles: [`
    /* ══ Hero ══ */
    .hero {
      position: relative; overflow: hidden;
      background: linear-gradient(160deg, #EFF4FA 0%, #E4EDF6 60%, #EAF2EF 100%);
      min-height: 580px;
    }

    /* Video background */
    .hero-video-wrap {
      position: absolute; inset: 0; pointer-events: none; overflow: hidden;
    }
    .hero-video {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; opacity: 0.28;
      will-change: contents;
    }
    .hero-video-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(160deg,
        rgba(239,244,250,.80) 0%,
        rgba(228,237,246,.72) 55%,
        rgba(234,242,239,.76) 100%);
    }
    .float-house {
      position: absolute; font-size: 2rem; opacity: 0.18;
      animation: floatHouse 8s ease-in-out infinite;
      pointer-events: none; user-select: none;
    }
    .fh-1 { top: 12%; left:  8%; animation-delay:    0s; font-size: 2.2rem; }
    .fh-2 { top: 60%; right: 6%; animation-delay: -3.5s; font-size: 1.7rem; }
    .fh-3 { top: 30%; right:18%; animation-delay: -6s;   font-size: 1.5rem; opacity: 0.12; }
    @keyframes floatHouse {
      0%,100% { transform: translateY(0)    rotate(-3deg); }
      50%      { transform: translateY(-18px) rotate(3deg);  }
    }

    /* Hero content */
    .hero-inner {
      position: relative; z-index: 1;
      padding: 90px 24px 72px; max-width: 880px;
      margin: 0 auto; text-align: center;
    }
    .eyebrow-wrap {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-bottom: 20px;
      animation: fadeDown .5s ease both;
    }
    .eyebrow-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      flex-shrink: 0;
      box-shadow: 0 0 0 3px rgba(44,74,110,.12);
    }
    .hero-eyebrow {
      font-size: .72rem; font-weight: 600; letter-spacing: .13em;
      color: #2C4A6E; text-transform: uppercase;
    }
    .hero-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2.4rem, 6vw, 4.2rem);
      font-weight: 400; line-height: 1.08;
      color: #1E3650; margin-bottom: 22px; letter-spacing: -1px;
      animation: fadeDown .55s .07s ease both;
    }
    .hero-title-accent {
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 500;
    }
    .hero-sub {
      font-size: 1rem; color: rgba(30,54,80,.52);
      line-height: 1.8; margin-bottom: 38px; max-width: 540px; margin-inline: auto;
      animation: fadeDown .55s .14s ease both;
    }

    /* Stats */
    .hero-stats {
      display: flex; align-items: center; justify-content: center; gap: 28px;
      margin-bottom: 34px;
      animation: fadeDown .55s .21s ease both;
    }
    .stat-item { text-align: center; min-width: 68px; }
    .stat-n {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.1rem; font-weight: 300; color: #2C4A6E; line-height: 1;
      display: block;
    }
    .stat-l {
      font-size: .67rem; color: rgba(30,54,80,.4);
      letter-spacing: .08em; text-transform: uppercase; display: block; margin-top: 5px;
    }
    .stat-sep {
      width: 1px; height: 36px;
      background: linear-gradient(180deg, transparent, rgba(44,74,110,.2), transparent);
    }
    .skel-stat {
      width: 52px; height: 28px; border-radius: 6px;
      background: rgba(44,74,110,.08);
      animation: skelPulse 1.6s ease-in-out infinite;
      margin: 0 auto 6px;
    }
    .skel-stat-sub {
      width: 40px; height: 10px; border-radius: 4px;
      background: rgba(44,74,110,.05);
      animation: skelPulse 1.6s .2s ease-in-out infinite;
      margin: 0 auto;
    }

    /* Filtros */
    .buscador {
      display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
      animation: fadeDown .55s .28s ease both;
    }
    .select-wrap {
      position: relative; display: flex; align-items: center;
    }
    .select-ico {
      position: absolute; left: 14px; z-index: 1;
      width: 14px; height: 14px; stroke: rgba(44,74,110,.5); pointer-events: none;
    }
    .buscador select {
      padding: 10px 20px 10px 36px; border-radius: 100px;
      background: rgba(255,255,255,.85);
      border: 1px solid rgba(44,74,110,.16);
      color: #1E3650; font-size: .87rem; cursor: pointer;
      backdrop-filter: blur(12px); min-width: 188px;
      transition: all .2s; font-family: inherit; outline: none;
      box-shadow: 0 2px 8px rgba(30,54,80,.06);
      appearance: none; -webkit-appearance: none;
    }
    .buscador select:hover { background: #fff; border-color: rgba(44,74,110,.3); }
    .buscador select:focus { border-color: #2C4A6E; box-shadow: 0 0 0 3px rgba(44,74,110,.1); }
    .buscador select option { color: #1E3650; background: #fff; }
    .btn-clear {
      padding: 10px 22px; border-radius: 100px;
      border: 1px solid rgba(44,74,110,.18);
      background: rgba(255,255,255,.7); color: rgba(30,54,80,.55); font-weight: 500; cursor: pointer;
      transition: all .2s; font-size: .87rem; font-family: inherit;
      display: flex; align-items: center; gap: 6px; box-shadow: none;
    }
    .btn-clear:hover { background: #fff; border-color: rgba(44,74,110,.35); color: #1E3650; transform: none; box-shadow: none; }

    /* CTA strip */
    .cta-strip {
      display: flex; align-items: center; justify-content: center;
      flex-wrap: wrap; gap: 14px;
      margin-top: 28px; padding: 16px 24px;
      background: rgba(255,255,255,.72);
      border: 1px solid rgba(44,74,110,.12);
      border-radius: 18px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(30,54,80,.07);
      animation: fadeDown .55s .35s ease both;
    }
    .cta-strip-text {
      color: rgba(30,54,80,.6); font-size: .87rem; margin: 0;
    }
    .cta-strip-btns { display: flex; gap: 8px; flex-shrink: 0; }
    .btn-cta-primary {
      padding: 9px 20px; border-radius: 100px;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: .83rem; font-weight: 700;
      text-decoration: none; white-space: nowrap;
      box-shadow: 0 4px 16px rgba(44,74,110,.3);
      transition: all .2s;
    }
    .btn-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(44,74,110,.45); }
    .btn-cta-ghost {
      padding: 9px 20px; border-radius: 100px;
      border: 1px solid rgba(44,74,110,.22);
      background: transparent; color: rgba(44,74,110,.75);
      font-size: .83rem; font-weight: 500; text-decoration: none; white-space: nowrap;
      transition: all .2s;
    }
    .btn-cta-ghost:hover { border-color: rgba(44,74,110,.4); color: #2C4A6E; background: rgba(44,74,110,.05); }

    @keyframes fadeDown {
      from { opacity:0; transform:translateY(-14px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* ══ Contenido ══ */
    .contenido { max-width: 1200px; margin: 0 auto; padding: 36px 24px 48px; }
    .contador-bar { margin-bottom: 24px; }
    .contador { color: rgba(30,54,80,.5); font-size: .88rem; margin-bottom: 14px; }
    .contador strong { color: #2C4A6E; }
    .divider-line { height: 1px; background: rgba(44,74,110,.08); }

    /* ══ Grid ══ */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }

    /* Skeleton */
    .tarjeta-skel {
      background: #fff; border: 1px solid rgba(44,74,110,.08);
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(30,54,80,.06);
    }
    .skel-img { height: 192px; background: rgba(44,74,110,.06); }
    .skel-body { padding: 18px; }
    .skel-line {
      border-radius: 6px; background: rgba(44,74,110,.07); margin-bottom: 10px;
      animation: skelPulse 1.6s ease-in-out infinite;
    }
    @keyframes skelPulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
    .skel-title  { height: 17px; width: 72%; }
    .skel-sub    { height: 12px; width: 52%; }
    .skel-short  { height: 12px; width: 36%; }

    /* ══ Tarjeta ══ */
    .tarjeta {
      background: #FFFFFF;
      border: 1px solid rgba(44,74,110,.10);
      border-radius: 20px; overflow: hidden; cursor: pointer;
      box-shadow: 0 2px 16px rgba(30,54,80,.07);
      transition: all .3s cubic-bezier(.4,0,.2,1);
    }
    .tarjeta:hover {
      transform: translateY(-6px);
      border-color: rgba(44,74,110,.22);
      box-shadow: 0 16px 48px rgba(30,54,80,.14);
    }
    .tarjeta:focus-visible {
      outline: 2px solid #2C4A6E;
      outline-offset: 3px;
    }

    .tarjeta-img {
      height: 192px; background: #EFF4FA center/cover no-repeat;
      position: relative;
    }
    .tarjeta-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(30,54,80,.35) 0%, transparent 50%);
    }
    .tarjeta-img-placeholder {
      background: linear-gradient(135deg, rgba(44,74,110,.07), rgba(61,139,122,.06));
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
    }
    .tarjeta-img-placeholder svg { width: 48px; height: 48px; stroke: rgba(44,74,110,.25); }

    .badge-tipo {
      position: absolute; top: 11px; left: 11px; z-index: 1;
      background: rgba(255,255,255,.88); color: #2C4A6E;
      font-size: .65rem; font-weight: 700;
      padding: 3px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: .07em;
      border: 1px solid rgba(44,74,110,.15);
      backdrop-filter: blur(8px);
    }
    .badge-fotos {
      position: absolute; bottom: 10px; right: 10px; z-index: 1;
      background: rgba(0,0,0,.45); color: #fff;
      font-size: .7rem; font-weight: 600;
      padding: 3px 9px; border-radius: 100px;
      display: flex; align-items: center; gap: 4px;
      backdrop-filter: blur(4px);
    }
    .badge-puntos {
      position: absolute; top: 11px; right: 11px; z-index: 1;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A); color: #fff;
      font-size: .72rem; font-weight: 800;
      padding: 4px 11px; border-radius: 100px;
      display: flex; align-items: center; gap: 4px;
      box-shadow: 0 2px 10px rgba(44,74,110,.4);
    }
    .badge-puntos .bp-ico { font-size: .8rem; opacity: .85; }

    /* Amenities en tarjeta */
    .amenities { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
    .am-chip {
      font-size: .7rem; color: rgba(30,54,80,.55); font-weight: 500;
      background: rgba(44,74,110,.06); border: 1px solid rgba(44,74,110,.1);
      padding: 2px 9px; border-radius: 100px;
    }

    /* Inputs de fecha en el buscador */
    .date-wrap input[type="date"] {
      padding: 10px 16px 10px 36px; border-radius: 100px;
      background: rgba(255,255,255,.85);
      border: 1px solid rgba(44,74,110,.16);
      color: #1E3650; font-size: .85rem; cursor: pointer;
      backdrop-filter: blur(12px); min-width: 150px;
      transition: all .2s; font-family: inherit; outline: none;
      box-shadow: 0 2px 8px rgba(30,54,80,.06);
    }
    .date-wrap input[type="date"]:hover { background: #fff; border-color: rgba(44,74,110,.3); }
    .date-wrap input[type="date"]:focus { border-color: #2C4A6E; box-shadow: 0 0 0 3px rgba(44,74,110,.1); }

    .tarjeta-body { padding: 18px; }
    .tarjeta-body h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.18rem; font-weight: 500; color: #1E3650; margin-bottom: 7px;
    }
    .lugar {
      font-size: .8rem; color: rgba(30,54,80,.5); margin-bottom: 4px;
      display: flex; align-items: center; gap: 5px;
    }
    .info {
      font-size: .78rem; color: rgba(30,54,80,.38); margin-bottom: 9px;
      display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
    }
    .sep   { color: rgba(30,54,80,.2); }
    .ico   { width: 13px; height: 13px; flex-shrink: 0; }
    .descripcion {
      font-size: .8rem; color: rgba(30,54,80,.45); margin-bottom: 13px; line-height: 1.55;
    }
    .propietario-row {
      display: flex; align-items: center; gap: 9px;
      padding-top: 12px; border-top: 1px solid rgba(44,74,110,.08);
    }
    .avatar-prop {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #2C4A6E, #3D8B7A);
      color: #fff; font-size: .68rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; text-transform: uppercase;
    }
    .propietario-row span { font-size: .79rem; color: rgba(30,54,80,.4); }
    .ver-mas {
      margin-left: auto; font-size: .74rem !important; color: #3D8B7A !important;
      font-weight: 600 !important; white-space: nowrap;
    }

    /* Vacío */
    .vacio { text-align: center; padding: 72px 0; color: rgba(30,54,80,.4); }
    .vacio-ico { font-size: 3.5rem; margin-bottom: 16px; opacity: .35; }
    .vacio h3 { font-size: 1.1rem; color: #1E3650; margin-bottom: 8px; font-weight: 500; }
    .vacio p  { font-size: .9rem; margin-bottom: 22px; }
    .btn-limpiar {
      padding: 10px 26px; border-radius: 100px;
      border: 1px solid rgba(44,74,110,.2);
      background: #fff; color: #2C4A6E; font-size: .86rem; font-weight: 600;
      cursor: pointer; transition: all .2s; font-family: inherit; box-shadow: none;
    }
    .btn-limpiar:hover { border-color: #2C4A6E; box-shadow: 0 4px 16px rgba(44,74,110,.15); transform: none; }

    /* Error */
    .msg-error {
      background: rgba(192,80,80,.08); border: 1px solid rgba(192,80,80,.2); color: #C05050;
      padding: 12px 16px; border-radius: 12px; font-size: .9rem; margin-bottom: 22px;
    }


    /* Responsive */
    @media (max-width: 640px) {
      .hero-inner { padding: 64px 16px 56px; }
      .hero-stats { gap: 16px; }
      .stat-n { font-size: 1.7rem; }
      .cta-strip { flex-direction: column; text-align: center; }
      .cta-strip-btns { justify-content: center; }
      .buscador { flex-direction: column; align-items: stretch; }
      .buscador select { min-width: 0; }
      .modal-body { padding: 20px; }
    }
  `]
})
/**
 * Componente principal (pagina de inicio). Muestra el catalogo de casas
 * disponibles con filtros por provincia, tipo y fechas, e incluye el video
 * de fondo que avanza con el scroll. Al pulsar una casa navega a su ficha.
 */
export class ExplorarComponent implements OnInit, AfterViewInit {

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  casas: Casa[] = [];
  casasFiltradas: Casa[] = [];
  error    = '';
  cargando = true;

  readonly skelArray = Array(6).fill(0);

  filtroProvincia    = '';
  filtroTipo         = '';
  filtroFechaInicio  = '';
  filtroFechaFin     = '';

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

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {}

  ngAfterViewInit(): void {
    // Prime the video at frame 0 (poster frame)
    const v = this.bgVideo?.nativeElement;
    if (v) { v.currentTime = 0; }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const v = this.bgVideo?.nativeElement;
    if (!v) return;
    // Load duration; if not ready yet just wait
    if (!v.duration) {
      v.load();
      return;
    }
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    v.currentTime = pct * v.duration;
  }

  ngOnInit(): void {
    this.api.listarCasasDisponibles().subscribe({
      next: data => {
        this.casas = data;
        this.filtrar();
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el listado. Comprueba que el servidor está activo.';
        this.cargando = false;
      }
    });
  }

  filtrar(): void {
    this.casasFiltradas = this.casas.filter(c => {
      const prov = !this.filtroProvincia || c.provincia === this.filtroProvincia;
      const tipo = !this.filtroTipo      || c.tipo_vivienda === this.filtroTipo;
      const fechas = this.coincideFechas(c);
      return prov && tipo && fechas;
    });
  }

  /**
   * Comprueba si la casa está disponible en el rango pedido.
   * - Sin filtro de fechas → siempre pasa.
   * - Casa sin fechas definidas → se considera siempre disponible.
   * - Con fechas → el rango pedido debe caber dentro de la disponibilidad.
   */
  private coincideFechas(c: Casa): boolean {
    if (!this.filtroFechaInicio && !this.filtroFechaFin) return true;
    if (!c.fecha_disponible_inicio || !c.fecha_disponible_fin) return true;

    const dispIni = new Date(c.fecha_disponible_inicio).getTime();
    const dispFin = new Date(c.fecha_disponible_fin).getTime();
    const pedIni  = this.filtroFechaInicio ? new Date(this.filtroFechaInicio).getTime() : dispIni;
    const pedFin  = this.filtroFechaFin    ? new Date(this.filtroFechaFin).getTime()    : dispFin;

    // El rango solicitado debe estar contenido en la disponibilidad de la casa
    return pedIni >= dispIni && pedFin <= dispFin;
  }

  limpiarFiltros(): void {
    this.filtroProvincia   = '';
    this.filtroTipo        = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin    = '';
    this.filtrar();
  }

  verDetalle(c: Casa): void {
    if (c.id) this.router.navigate(['/casa', c.id]);
  }

  /** Devuelve el array de fotos de una casa (fotos[] o [imagen_url] o []) */
  getFotos(c: Casa): string[] {
    if (c.fotos && c.fotos.length > 0) return c.fotos;
    if (c.imagen_url) return [c.imagen_url];
    return [];
  }

  /** URL de portada para la tarjeta */
  getCoverUrl(c: Casa): string {
    return c.imagen_url || (c.fotos && c.fotos[0]) || '';
  }

}
