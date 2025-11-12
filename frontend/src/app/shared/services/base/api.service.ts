// src/app/shared/services/api.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiServiceConfig } from './api-service-config';

export abstract class ApiService<T> extends ApiServiceConfig {
  private _refresh$ = new Subject<void>();

  constructor(protected http: HttpClient) {
    super();
  }

  /** Debe ser implementado por las clases hijas */
  public abstract root(): string;

  /** Construye la URL base para el servicio */
  protected get uri(): string {
    return `${this.api}/${this.root()}`;
  }

  /** Permite suscribirse a recargas automáticas */
  get refresh$() {
    return this._refresh$;
  }

  /** Listar entidades */
  public list(params?: any): Observable<T[]> {
    return this.http.get<T[]>(`${this.uri}`, { params });
  }

  /** Crear entidad */
  public store(entity: T): Observable<T> {
    return this.http.post<T>(this.uri, entity).pipe(tap(() => this._refresh$.next()));
  }

  /** Obtener entidad por ID */
  public single(id: string): Observable<T> {
    return this.http.get<T>(`${this.uri}/${id}`);
  }

  /** Actualizar entidad */
  public update(id: string, entity: T): Observable<T> {
    return this.http.put<T>(`${this.uri}/${id}`, entity).pipe(tap(() => this._refresh$.next()));
  }

  /** Eliminar entidad */
  public destroy(id: string): Observable<void> {
    return this.http.delete<void>(`${this.uri}/${id}`).pipe(tap(() => this._refresh$.next()));
  }
}
