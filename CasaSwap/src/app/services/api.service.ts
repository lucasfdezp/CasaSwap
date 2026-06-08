import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario';
import { Casa } from '../models/casa';
import { Solicitud } from '../models/solicitud';
import { environment } from '../../environments/environment';

/**
 * Servicio central de acceso a la API. Centraliza todas las llamadas HTTP
 * al backend PHP y la subida de imagenes a Cloudinary. Cada operacion se
 * envia por POST indicando la accion correspondiente en el cuerpo.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {

  // URL del backend (definida segun el entorno: local o produccion)
  private readonly url = environment.apiUrl;

  // Endpoint de subida sin firma de Cloudinary
  private readonly cloudinaryUrl =
    `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloud}/image/upload`;

  constructor(private http: HttpClient) {}

  // Metodo auxiliar: todas las peticiones a la API son POST con un JSON
  private post(body: object): Observable<any> {
    return this.http.post(this.url, body);
  }

  /** Sube la imagen directamente a Cloudinary (unsigned upload). */
  subirImagen(archivo: File): Observable<{ result: string; url?: string; error?: string }> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', environment.cloudinaryPreset);
    return this.http.post<any>(this.cloudinaryUrl, formData).pipe(
      map(res => ({ result: 'OK', url: res.secure_url as string })),
    );
  }

  // --- Usuarios ---

  listarUsuarios(): Observable<Usuario[]> {
    return this.post({ accion: 'ListarUsuarios' });
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.post({ accion: 'ObtenerUsuarioId', id });
  }

  anadeUsuario(usuario: Usuario): Observable<{ result: string }> {
    return this.post({ accion: 'AnadeUsuario', usuario });
  }

  modificaUsuario(usuario: Usuario): Observable<{ result: string }> {
    return this.post({ accion: 'ModificaUsuario', usuario });
  }

  borraUsuario(id: number): Observable<{ result: string }> {
    return this.post({ accion: 'BorraUsuario', id });
  }

  // --- Casas ---

  listarCasas(): Observable<Casa[]> {
    return this.post({ accion: 'ListarCasas' });
  }

  // Devuelve el lisatdo de casas marcadas como disponibles (catalogo publico)
  listarCasasDisponibles(): Observable<Casa[]> {
    return this.post({ accion: 'ListarCasasDisponibles' });
  }

  listarCasasUsuario(id: number): Observable<Casa[]> {
    return this.post({ accion: 'ListarCasasUsuario', id });
  }

  obtenerCasa(id: number): Observable<Casa> {
    return this.post({ accion: 'ObtenerCasaId', id });
  }

  anadeCasa(casa: Casa): Observable<{ result: string }> {
    return this.post({ accion: 'AnadeCasa', casa });
  }

  modificaCasa(casa: Casa): Observable<{ result: string }> {
    return this.post({ accion: 'ModificaCasa', casa });
  }

  borraCasa(id: number): Observable<{ result: string }> {
    return this.post({ accion: 'BorraCasa', id });
  }

  // --- Puntos ---

  obtenerPuntos(id: number): Observable<{ result: string; puntos: number }> {
    return this.post({ accion: 'ObtenerPuntos', id });
  }

  // --- Solicitudes de alquiler (sistema de puntos) ---

  // Crea una solicitud de alquiler sobre una casa. Queda pendiente de aprobacion
  crearSolicitud(solicitud: Solicitud): Observable<{ result: string; error?: string }> {
    return this.post({ accion: 'CrearSolicitud', solicitud });
  }

  solicitudesRecibidas(id: number): Observable<Solicitud[]> {
    return this.post({ accion: 'ListarSolicitudesRecibidas', id });
  }

  solicitudesEnviadas(id: number): Observable<Solicitud[]> {
    return this.post({ accion: 'ListarSolicitudesEnviadas', id });
  }

  aceptarSolicitud(id: number): Observable<{ result: string; error?: string }> {
    return this.post({ accion: 'AceptarSolicitud', id });
  }

  rechazarSolicitud(id: number): Observable<{ result: string; error?: string }> {
    return this.post({ accion: 'RechazarSolicitud', id });
  }

  cancelarSolicitud(id: number): Observable<{ result: string; error?: string }> {
    return this.post({ accion: 'CancelarSolicitud', id });
  }
}
