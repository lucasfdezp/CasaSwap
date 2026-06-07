import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface SesionUsuario {
  tipo: 'admin' | 'usuario';
  nombre: string;
  id?: number;
  puntos?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly url = environment.apiUrl;
  private readonly KEY = 'casaswap_sesion';

  /** Saldo de puntos del usuario logado (reactivo para la navbar). */
  puntos = signal<number>(0);

  constructor(private http: HttpClient, private router: Router) {
    const s = this.getSesion();
    if (s?.puntos != null) this.puntos.set(s.puntos);
  }

  // --- Login admin ---
  loginAdmin(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.url, { accion: 'Login', email, password }).pipe(
      tap(res => { if (res.result === 'OK') this.guardarSesion(res); })
    );
  }

  // --- Login usuario ---
  loginUsuario(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.url, { accion: 'LoginUsuario', email, password }).pipe(
      tap(res => { if (res.result === 'OK') this.guardarSesion(res); })
    );
  }

  private guardarSesion(res: any): void {
    const sesion: SesionUsuario = {
      tipo: res.tipo, nombre: res.nombre, id: res.id,
      puntos: res.puntos != null ? Number(res.puntos) : 0
    };
    localStorage.setItem(this.KEY, JSON.stringify(sesion));
    this.puntos.set(sesion.puntos ?? 0);
  }

  /** Actualiza el saldo de puntos en sesión + signal. */
  setPuntos(p: number): void {
    this.puntos.set(p);
    const s = this.getSesion();
    if (s) {
      s.puntos = p;
      localStorage.setItem(this.KEY, JSON.stringify(s));
    }
  }

  /** Refresca el saldo desde el servidor. */
  refrescarPuntos(): void {
    const id = this.getIdUsuario();
    if (!id) return;
    this.http.post<any>(this.url, { accion: 'ObtenerPuntos', id }).subscribe({
      next: res => { if (res?.result === 'OK') this.setPuntos(Number(res.puntos)); }
    });
  }

  logout(): void {
    localStorage.removeItem(this.KEY);
    this.router.navigate(['/']);
  }

  estaLogado(): boolean {
    return localStorage.getItem(this.KEY) !== null;
  }

  getSesion(): SesionUsuario | null {
    const raw = localStorage.getItem(this.KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getNombre(): string {
    return this.getSesion()?.nombre ?? '';
  }

  esAdmin(): boolean {
    return this.getSesion()?.tipo === 'admin';
  }

  esUsuario(): boolean {
    return this.getSesion()?.tipo === 'usuario';
  }

  getIdUsuario(): number | undefined {
    return this.getSesion()?.id;
  }
}
