import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../shared/interface';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

const SESSION_KEY = 'identidad_session_v1';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user: User = {
    email: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
    bio: '',
    country: '',
    orcid: '',
    googleScholar: '',
    photoUrl: '',
    snip: '',
  };

  password2 = '';
  loading = false;
  message = '';

  constructor(private authService: AuthenticationService, private router: Router) {}

  submit() {
    this.message = '';

    if (!this.user.name || !this.user.firstName || !this.user.email || !this.user.password) {
      this.message = 'Completa todos los campos obligatorios.';
      return;
    }

    if (this.user.password!.length < 6) {
      this.message = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.user.password !== this.password2) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.authService.register(this.user).subscribe({
      next: (resp: any) => {
        const token = resp?.token;
        const user = resp?.user || this.user;
        if (!token) {
          this.message = 'No se recibió token del servidor.';
          this.loading = false;
          return;
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, token }));
        this.message = 'Registro exitoso. Redirigiendo...';
        setTimeout(() => this.router.navigate(['/dashboard']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || 'Error en el registro.';
      },
      complete: () => (this.loading = false),
    });
  }
}
