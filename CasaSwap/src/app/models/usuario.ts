// Modelo de datos de un usuario registrado en la plataforma
export interface Usuario {
  id?: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  ciudad?: string;
  provincia?: string;
  puntos?: number;
  password?: string;
  fecha_registro?: string;
}
