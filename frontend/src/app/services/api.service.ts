// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
export const environment = { production: false, apiBase: 'http://localhost:3000' };


@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  private jsonHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // Auth
  register(name: string, email: string, password: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.base}/auth/register`, { name, email, password }));
  }
  login(email: string, password: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.base}/auth/login`, { email, password }));
  }

  // Users
  getUsers(query?: string, token?: string): Promise<any[]> {
    const url = query ? `${this.base}/users?${query}` : `${this.base}/users`;
    return firstValueFrom(this.http.get<any[]>(url, { headers: this.jsonHeaders(token) }));
  }
  createUser(payload: any, token?: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.base}/users`, payload, { headers: this.jsonHeaders(token) }));
  }
  updateUser(id: number|string, payload: any, token?: string): Promise<any> {
    return firstValueFrom(this.http.put(`${this.base}/users/${id}`, payload, { headers: this.jsonHeaders(token) }));
  }

  // Protected profile endpoint (optional)
  getProfileMe(token?: string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.base}/profiles/me`, { headers: this.jsonHeaders(token) }));
  }

  // Upload (multipart)
  uploadPhoto(file: File, token?: string): Promise<any> {
    const fd = new FormData();
    fd.append('photo', file);
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return firstValueFrom(this.http.post(`${this.base}/upload/photo`, fd, { headers }));
  }
}
