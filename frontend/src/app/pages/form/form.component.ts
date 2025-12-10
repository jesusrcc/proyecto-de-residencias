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
    snip: '',
    publications: [],
    courses: [],
    milestones: [],
    gallery: [],
  };

  loading = false;
  message = '';
  messageType: 'success' | 'error' | 'warning' | 'info' | '' = '';
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
        gallery: parsed.gallery ?? [],
        snip: parsed.snip ?? ''
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

    const maxMb = 2;
    if (file.size > maxMb * 1024 * 1024) {
      this.user.photoUrl = '';  // 🔥 limpiar modelo
      input.value = '';         // limpiar input
      this.showMessage(`La imagen es demasiado grande (máximo ${maxMb}MB).`, 'error');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      this.user.photoUrl = '';  // limpiar por seguridad
      input.value = '';
      this.showMessage('Solo se permiten imágenes PNG o JPG.', 'error');
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
        this.loading = false;

        this.showMessage('Información actualizada correctamente', 'success');

        localStorage.setItem(
          'identidad_session_v1',
          JSON.stringify({ ...updatedUser, token: this.user.token })
        );
      },

      error: (err) => {
        this.loading = false;

        let msg = err?.error?.message || 'Error al actualizar el perfil.';

        // 🔥 Si es un error por tamaño de imagen
        if (msg.includes('entity too large') || err.status === 413) {
          msg = 'La imagen que intentas subir es demasiado grande.';
        }

        this.showMessage(msg, 'error');
      }
    });
  }

  triggerGalleryInput(): void {
    this.galleryInput.nativeElement.click();
  }

  async onGallerySelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    const maxMb = 2;

    for (const file of files) {
      if (file.size > maxMb * 1024 * 1024) {
        this.showMessage(`Una de las imágenes supera el límite de ${maxMb}MB.`, 'error');
        continue; // 🔥 NO se agrega a gallery
      }

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
    event.stopPropagation();
    this.user.photoUrl = '';
  }

  showMessage(text: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.message = text;
    this.messageType = type;

    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 3000);
  }
}
