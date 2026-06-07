export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';

export interface Solicitud {
  id?: number;
  casa_id: number;
  inquilino_id: number;
  propietario_id: number;
  puntos: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  mensaje?: string;
  estado?: EstadoSolicitud;
  fecha_solicitud?: string;
  fecha_resolucion?: string;

  // Campos enriquecidos (JOIN) — solo lectura
  casa_titulo?: string;
  casa_ciudad?: string;
  casa_imagen?: string;
  inquilino_nombre?: string;
  inquilino_email?: string;
  inquilino_telefono?: string;
  propietario_nombre?: string;
}
