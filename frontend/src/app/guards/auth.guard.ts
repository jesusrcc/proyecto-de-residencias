import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const session = localStorage.getItem('identidad_session_v1')
    if (!session) {
      this.router.navigate(['/login'])
      return false
    }
    const token = JSON.parse(session)?.token
    if (!token) {
      this.router.navigate(['/login'])
      return false
    }
    return true
  }
}
