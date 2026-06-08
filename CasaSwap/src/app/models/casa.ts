// Modelo de datos de una vivienda publicada en la plataforma
export interface Casa {
  id?: number;
  usuario_id: number;
  titulo: string;
  descripcion?: string;
  direccion?: string;
  ciudad: string;
  barrio?: string;
  provincia: string;
  tipo_vivienda: 'piso' | 'casa' | 'chalet' | 'apartamento';
  num_habitaciones: number;
  capacidad: number;
  disponible: number;
  // ── Atributos extra (afectan al valor en puntos) ──
  acepta_mascotas?: number;          // 0 | 1
  tiene_piscina?: number;            // 0 | 1
  tiene_patio?: number;              // 0 | 1
  fecha_disponible_inicio?: string;  // YYYY-MM-DD
  fecha_disponible_fin?: string;     // YYYY-MM-DD
  // ── Sistema de puntos ──
  puntos_base?: number;              // valor automático calculado
  valor_puntos?: number;             // valor final (auto + ajuste manual)
  // ── Imágenes ──
  imagen_url?: string;
  fotos?: string[];
  fecha_publicacion?: string;
  propietario?: string;
  email_propietario?: string;
  telefono_propietario?: string;
}
