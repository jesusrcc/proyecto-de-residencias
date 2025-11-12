import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/interface';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  user: User = {
    email: '',
    name: '',
    firstName: '',
    lastName: '',
    country: '',
    orcid: '',
    bio: '',
    googleScholar: '',
    publications: [],
    courses: [],
    milestones: [],
  };

  loading = false;
  message = '';
  today = new Date().toISOString().split('T')[0];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const session = localStorage.getItem('identidad_session_v1');
    if (session) {
      const parsed = JSON.parse(session);
      this.user = {
        ...this.user,
        ...parsed,
        publications: parsed.publications ?? [],
        courses: parsed.courses ?? [],
        milestones: parsed.milestones ?? [],
      };
    }
  }

  addItem(type: 'publications' | 'courses' | 'milestones'): void {
    (this.user[type] ??= []).push({});
  }

  removeItem(type: 'publications' | 'courses' | 'milestones', index: number): void {
    this.user[type]?.splice(index, 1);
  }

  save(): void {
    this.loading = true;
    this.message = '';

    this.userService.updateProfile(this.user).subscribe({
      next: (updatedUser) => {
        this.message = '✅ Información actualizada correctamente';
        localStorage.setItem(
          'identidad_session_v1',
          JSON.stringify({ ...updatedUser, token: this.user.token })
        );
      },
      error: (err) => {
        this.message = err?.error?.message || 'Error al actualizar el perfil.';
      },
      complete: () => (this.loading = false),
    });
  }
}
