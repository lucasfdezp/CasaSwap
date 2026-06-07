import { Injectable, signal } from '@angular/core';

export interface Toast {
  id:   number;
  msg:  string;
  type: 'ok' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(msg: string, type: 'ok' | 'error' = 'ok'): void {
    const id = ++this.nextId;
    this.toasts.update(t => [...t, { id, msg, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
