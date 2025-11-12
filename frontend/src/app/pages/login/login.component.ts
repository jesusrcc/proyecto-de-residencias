import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

const SESSION_KEY = 'identidad_session_v1';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthenticationService, private router: Router) {}

  submit() {
    this.errorMsg = '';

    if (!this.email || !this.password) {
      this.errorMsg = 'Completa correo y contraseña';
      return;
    }

    this.loading = true;

    this.authService.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: (resp: any) => {
        const token = resp?.token || resp?.access_token || resp?.jwt;
        const user = resp?.user;

        if (!token || !user) {
          this.errorMsg = 'No se recibió información válida del servidor.';
          this.loading = false;
          return;
        }

        // ✅ Guardar todo el objeto de usuario, incluyendo apellidos, país, etc.
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...user, token })
        );

        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        this.loading = false;
        const backendError = err?.error?.error;
        const backendMsg = err?.error?.message;

        if (backendError === 'USER_NOT_FOUND') {
          this.errorMsg = 'El correo no está registrado.';
        } else if (backendError === 'INVALID_PASSWORD') {
          this.errorMsg = 'La contraseña es incorrecta.';
        } else {
          this.errorMsg = backendMsg || 'Credenciales inválidas o error de servidor.';
        }
      },

      complete: () => (this.loading = false),
    });
  }
}
