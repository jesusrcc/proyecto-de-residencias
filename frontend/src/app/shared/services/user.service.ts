import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface';
import { ApiService } from './base/api.service';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiService<User> {
  constructor(protected override http: HttpClient) {
    super(http);
  }

  public override root(): string {
    return 'users';
  }

  /** ✅ Actualizar el perfil del usuario autenticado */
  updateProfile(user: User): Observable<User> {
    const token = user.token || JSON.parse(localStorage.getItem('identidad_session_v1') || '{}')?.token;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<User>(`${this.uri}/${user.id}`, user, { headers });
  }
}
