import { Injectable, signal } from '@angular/core';

// Estructura de cada aviso emergente que se muestra al usuario
export interface Toast {
  id:   number;
  msg:  string;
  type: 'ok' | 'error';
}

/**
 * Servicio de notificaciones (toasts). Permite mostrar mensajes breves
 * de confirmacion o error desde cualquier parte de la aplicacion.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {

  // Lista reactiva de toasts visibles en cada momento
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  // Muestra un nuevo aviso y lo elimina automaticamente a los 4 segundos
  show(msg: string, type: 'ok' | 'error' = 'ok'): void {
    const id = ++this.nextId;
    this.toasts.update(t => [...t, { id, msg, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  // Cierra manualmente un aviso por su identificador
  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
