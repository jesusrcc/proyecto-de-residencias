import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AuthenticationService } from 'src/app/shared/services/authentication.service'

const SESSION_KEY = 'identidad_session_v1'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = ''
  password = ''
  loading = false
  errorMsg = ''

  constructor(private authService: AuthenticationService, private router: Router) {}

  submit() {
    this.errorMsg = ''
    if (!this.email || !this.password) {
      this.errorMsg = 'Completa correo y contraseña'
      return
    }

    this.loading = true
    this.authService.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: (resp: any) => {
        const token = resp?.token || resp?.access_token || resp?.jwt
        const user = resp?.user || { email: this.email, name: '' }
        if (!token) {
          this.errorMsg = 'No se recibió el token del servidor'
          this.loading = false
          return
        }
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ email: user.email, name: user.name, token })
        )
        this.router.navigate(['/dashboard'])
      },
      error: (err) => {
        this.loading = false
        this.errorMsg = err?.error?.message || 'Credenciales inválidas'
      },
      complete: () => (this.loading = false),
    })
  }
}
