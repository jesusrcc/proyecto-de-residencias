import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { User } from '../../shared/interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user: User = {
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    password: '',
  };

  password2 = '';
  loading = false;
  message = '';

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  isPasswordStrong(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  get hasMinLength(): boolean {
    return (this.user.password || '').length >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.user.password || '');
  }

  get hasNumber(): boolean {
    return /\d/.test(this.user.password || '');
  }

  passwordsMatch(): boolean {
    return (
      this.user.password === this.password2 &&
      this.isPasswordStrong(this.user.password)
    );
  }
  // ✅ Lista de dominios permitidos
  private allowedDomains = [
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'itescam.edu.mx',
    'icloud.com',
    'yahoo.com'
  ];

  // ✅ Valida formato y dominio del correo
  isEmailValid(): boolean {
    if (!this.user.email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) return false;

    const domain = this.user.email.split('@')[1]?.toLowerCase();
    return this.allowedDomains.includes(domain);
  }


  submit() {
    if (!this.passwordsMatch()) {
      this.message = 'Las contraseñas no coinciden o son demasiado cortas.';
      return;
    }

    this.message = '';
    this.loading = true;

    this.authService.register(this.user).subscribe({
      next: () => {
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
