import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/shared/interface';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;


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

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes PNG o JPG.');
      return;
    }

    const base64 = await this.convertToBase64(file);
    this.user.photoUrl = base64 as string;
  }

  private convertToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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
  triggerGalleryInput(): void {
  this.galleryInput.nativeElement.click();
}

async onGallerySelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const files = Array.from(input.files);
  
  for (const file of files) {
    const base64 = await this.convertToBase64(file);
    this.user.gallery = this.user.gallery ?? [];
    this.user.gallery.push(base64 as string);
  }

  input.value = ''; // limpiar input
}

removeGalleryImage(index: number): void {
  this.user.gallery?.splice(index, 1);
}
deleteProfilePhoto(event: Event): void {
  event.stopPropagation(); // evita abrir selector de archivo
  this.user.photoUrl = '';
}

}
