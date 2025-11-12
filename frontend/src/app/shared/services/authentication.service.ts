// src/app/shared/services/authentication.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthResponse, User } from '../interface';
import { ApiServiceConfig } from './base/api-service-config';

@Injectable({ providedIn: 'root' })
export class AuthenticationService extends ApiServiceConfig {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    super();
    const savedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(savedUser ? JSON.parse(savedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, { email, password }).pipe(
      map(response => {
        const user: User = {
          ...response.user,
          token: response.token,
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return response;
      })
    );
  }

  register(data: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, data).pipe(
      map(response => {
        const user: User = {
          ...response.user,
          token: response.token,
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return response;
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.currentUserValue?.token ?? null;
  }
}
