// src/app/app.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';

type Publication = { title: string; journal?: string; year?: string };
type Course = { name: string; institution?: string; date?: string };
type Milestone = { title: string; date?: string; type?: string; description?: string };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Proyecto Residencias';

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  orcid = '';
  country = '';
  googleScholar = '';
  snip = '';
  bio = '';
  photoUrl = '';

  // Arrays
  publications: Publication[] = [];
  courses: Course[] = [];
  milestones: Milestone[] = [];

  // UI/session
  activeView: 'dashboard'|'form'|'cv'|'timeline'|'export' = 'dashboard';
  searchQuery = '';

  AUTH_SESSION_KEY = 'identidad_session_v1';
  session: { email: string; name: string; token?: string; ts?: number } | null = null;

  // modal/auth
  showAuth = false;
  authMode: 'login'|'register' = 'login';
  authMsg = '';
  loginEmail = '';
  loginPwd = '';
  regName = '';
  regEmail = '';
  regPwd = '';
  regPwd2 = '';

  // internal
  usuarioActual: any = null;
  token: string | null = null;
  shareUrl: string | null = null;

  @ViewChild('cvElement', { static: false }) cvElement!: ElementRef;
  @ViewChild('formulario', { static: false }) formularioRef!: ElementRef;

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    // recuperar sesión si existe
    const raw = localStorage.getItem(this.AUTH_SESSION_KEY);
    if (raw) {
      try {
        this.session = JSON.parse(raw);
        this.token = this.session?.token ?? null;
      } catch (e) {
        this.session = null;
        this.token = null;
      }
    }

    // iniciar formulario vacio y sincronizar si hay sesión
    this.initEmptyForm();
    if (this.isAuthenticated()) {
      // intenta sincronizar perfil
      this.syncProfileWithServer().catch(err => console.warn('sync init error', err));
    }
  }

  // ------------------------
  // Getters utilizados en template
  // ------------------------
  get avatarInitials(): string {
    const name = this.session?.name || this.firstName;
    if (!name) return 'JR';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
    return parts.map(p => p[0].toUpperCase()).slice(0,2).join('') || 'JR';
  }

  get firstNameShort(): string {
    const name = this.session?.name || this.firstName;
    if (!name) return '';
    return name.trim().split(/\s+/)[0] || '';
  }

  // sortedMilestones getter (soluciona referencia en plantilla)
  get sortedMilestones(): Milestone[] {
    if (!this.milestones || !Array.isArray(this.milestones)) return [];
    // Orden descendente por fecha (asume formato YYYY-MM-DD ó ISO). Si no es consistente, puedes ajustar parseo.
    return [...this.milestones].sort((a, b) => {
      const da = a?.date ?? '';
      const db = b?.date ?? '';
      if (da === db) return 0;
      return db.localeCompare(da);
    });
  }

  // ------------------------
  // Form helpers
  // ------------------------
  initEmptyForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.orcid = '';
    this.bio = '';
    this.photoUrl = '';
    this.country = '';
    this.googleScholar = '';
    this.snip = '';
    this.publications = [{ title: '', journal: '', year: '' }];
    this.courses = [{ name: '', institution: '', date: '' }];
    this.milestones = [{ title: '', date: '', type: 'otro', description: '' }];
  }

  addPublication(data?: Publication) { this.publications.push(data ?? { title: '', journal: '', year: '' }); }
  removePublication(i: number) { this.publications.splice(i, 1); }

  addCourse(data?: Course) { this.courses.push(data ?? { name: '', institution: '', date: '' }); }
  removeCourse(i: number) { this.courses.splice(i, 1); }

  addMilestone(data?: Milestone) { this.milestones.push(data ?? { title: '', date: '', type: 'otro', description: '' }); }
  removeMilestone(i: number) { this.milestones.splice(i, 1); }

  collectForm() {
    return {
      name: `${(this.firstName || '').trim()} ${(this.lastName || '').trim()}`.trim() || 'Sin nombre',
      firstName: this.firstName,
      lastName: this.lastName,
      email: (this.email || '').trim().toLowerCase(),
      orcid: this.orcid,
      bio: this.bio,
      photoUrl: this.photoUrl,
      country: this.country || null,
      googleScholar: this.googleScholar || null,
      snip: this.snip || null,
      publications: this.publications.filter(p => p.title && p.title.trim() !== ''),
      courses: this.courses.filter(c => c.name && c.name.trim() !== ''),
      milestones: this.milestones.filter(m => m.title && m.date)
    };
  }

  // ------------------------
  // Views & navigation
  // ------------------------
  showView(v: 'dashboard'|'form'|'cv'|'timeline'|'export') {
    const protectedViews: Array<'form'|'export'> = ['form','export'];
    if (protectedViews.includes(v as any) && !this.isAuthenticated()) {
      this.openAuth('login');
      alert('Inicia sesión para acceder a esta sección.');
      return;
    }
    this.activeView = v;
    if (v === 'cv') setTimeout(()=> this.updateStats(), 150);
  }

  updateStats() {
    // placeholder: el template lee directamente los arrays
  }

  // ------------------------
  // AUTH: modal, register, login, logout
  // ------------------------
  openAuth(mode: 'login'|'register' = 'login') {
    this.authMode = mode;
    this.authMsg = '';
    this.loginEmail = this.loginPwd = '';
    this.regName = this.regEmail = this.regPwd = this.regPwd2 = '';
    this.showAuth = true;
  }

  closeAuth() { this.showAuth = false; }

  isAuthenticated(): boolean {
    return !!this.getSession();
  }

  setSession(user: { email: string; name: string; token?: string }) {
    const payload = { email: user.email, name: user.name, token: user.token, ts: Date.now() };
    localStorage.setItem(this.AUTH_SESSION_KEY, JSON.stringify(payload));
    this.session = payload;
    this.token = user.token ?? null;
  }

  clearSession() {
    localStorage.removeItem(this.AUTH_SESSION_KEY);
    this.session = null;
    this.token = null;
  }

  async modalRegister() {
    this.authMsg = '';
    const name = (this.regName || '').trim();
    const email = (this.regEmail || '').trim().toLowerCase();
    const pwd = this.regPwd || '';
    const pwd2 = this.regPwd2 || '';

    if (!name || !email || !pwd) { this.authMsg = 'Completa todos los campos.'; return; }
    if (pwd.length < 6) { this.authMsg = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    if (pwd !== pwd2) { this.authMsg = 'Las contraseñas no coinciden.'; return; }

    try {
      const resp: any = await this.api.register(name, email, pwd);
      const token = resp?.token || resp?.access_token || resp?.jwt || null;
      const user = resp?.user || resp?.usuario || { email, name };
      if (token) this.setSession({ email: user.email || email, name: user.name || name, token });
      this.authMsg = 'Registro exitoso.';
      await this.syncProfileWithServer();
      setTimeout(()=> this.closeAuth(), 600);
    } catch (err: any) {
      console.error('Error registering', err);
      this.authMsg = err?.error?.message || 'Error registrando en el servidor.';
    }
  }

  async modalLogin() {
    this.authMsg = '';
    const email = (this.loginEmail || '').trim().toLowerCase();
    const pwd = this.loginPwd || '';
    if (!email || !pwd) { this.authMsg = 'Completa correo y contraseña.'; return; }

    try {
      const resp: any = await this.api.login(email, pwd);
      const token = resp?.token || resp?.access_token || resp?.jwt || null;
      const user = resp?.user || resp?.usuario || { email };
      if (!token) throw new Error('No token recibido');
      this.setSession({ email: user.email || email, name: user.name || (user.fullName || ''), token });
      this.authMsg = 'Inicio de sesión correcto.';
      await this.syncProfileWithServer();
      setTimeout(()=> this.closeAuth(), 400);
    } catch (err: any) {
      console.error('Error logging in', err);
      this.authMsg = err?.error?.message || 'Error iniciando sesión en el servidor.';
    }
  }

  logoutFromUI() {
    if (!confirm('¿Cerrar sesión?')) return;
    this.clearSession();
    alert('Sesión cerrada.');
  }

  // openProfileMenu (soluciona referencia en plantilla)
  openProfileMenu(): void {
    const s = this.getSession();
    if (!s) {
      this.openAuth('login');
      return;
    }
    const go = confirm(`Sesión iniciada como: ${s.name || s.email}\n\nAceptar: Ir al formulario para editar tu perfil.\nCancelar: Mantener esta vista.`);
    if (go) this.showView('form');
  }

  // resetForm (soluciona referencia en plantilla)
  resetForm(): void {
    if (!confirm('¿Deseas borrar todos los campos del formulario?')) return;
    this.initEmptyForm();
    this.shareUrl = null;
  }

  // ------------------------
  // Sincronizar perfil con servidor
  // ------------------------
  async syncProfileWithServer(): Promise<void> {
    if (!this.session?.email) return;
    try {
      // 1) Si API tiene /profiles/me
      try {
        if (this.api.getProfileMe) {
          const me: any = await this.api.getProfileMe(this.session.token);
          if (me) { this.applyServerProfile(me); return; }
        }
      } catch (e) { /* ignore */ }

      // 2) Buscar por email en /users?email=
      try {
        const users: any[] = await this.api.getUsers();
        const found = users.find(u => u.email && u.email.toLowerCase() === this.session!.email.toLowerCase());
        if (found) { this.applyServerProfile(found); return; }
      } catch (e) { /* ignore */ }

      // 3) Si no existe perfil: crearlo con datos en UI
      await this.saveServer();
    } catch (err) {
      console.warn('Error sincronizando perfil con servidor', err);
    }
  }

  private applyServerProfile(serverProfile: any) {
    if (!serverProfile) return;
    this.firstName = serverProfile.firstName || serverProfile.name?.split(' ')[0] || this.firstName;
    this.lastName = serverProfile.lastName || this.lastName;
    this.email = serverProfile.email || this.email || this.session?.email || '';
    this.orcid = serverProfile.orcid || this.orcid;
    this.bio = serverProfile.bio || this.bio;
    this.photoUrl = serverProfile.photoUrl || this.photoUrl;
    this.country = serverProfile.country || this.country;
    this.googleScholar = serverProfile.googleScholar || this.googleScholar;
    this.snip = serverProfile.snip || this.snip;
    this.publications = (serverProfile.publications || this.publications || []).map((p:any) => ({ title: p.title||'', journal: p.journal||'', year: p.year||'' }));
    this.courses = (serverProfile.courses || this.courses || []).map((c:any) => ({ name: c.name||'', institution: c.institution||'', date: c.date||'' }));
    this.milestones = (serverProfile.milestones || this.milestones || []).map((m:any) => ({ title: m.title||'', date: m.date||'', type: m.type||'otro', description: m.description||'' }));

    if (serverProfile.publicUrl) this.shareUrl = serverProfile.publicUrl;
    else if (serverProfile.publicId) this.shareUrl = `${window.location.origin}/public/${serverProfile.publicId}`;
    else if (serverProfile.id) this.shareUrl = `${window.location.origin}/public/${serverProfile.id}`;
    else this.shareUrl = null;

    this.updateStats();
  }

  // ------------------------
  // Guardar (crear / actualizar) perfil en server
  // ------------------------
  async saveServer() {
    const payload = this.collectForm();
    if (!payload.email) { alert('Debes ingresar un correo antes de guardar.'); return; }
    try {
      // buscar por email localmente en servidor
      const users: any[] = await this.api.getUsers();
      const existing = users.find(u => u.email && u.email.toLowerCase() === payload.email.toLowerCase());
      let resp;
      if (existing && existing.id) {
        resp = await this.api.updateUser(existing.id, payload, this.session?.token);
        alert('Perfil actualizado en el servidor.');
        this.applyServerProfile(resp || existing);
      } else {
        resp = await this.api.createUser(payload, this.session?.token);
        alert('Perfil creado en el servidor.');
        this.applyServerProfile(resp || payload);
      }
    } catch (err: any) {
      console.error('Error saving to server', err);
      if (err?.status === 0) alert('No se pudo conectar al servidor. ¿Está levantado?');
      else alert('Error al guardar en servidor.');
    }
  }

  // ------------------------
  // PDF / export
  // ------------------------
  async exportCv() {
    this.showView('cv');
    await new Promise(r => setTimeout(r, 250));
    const el = this.cvElement?.nativeElement;
    if (!el) { alert('No se encontró contenido para exportar.'); return; }
    try {
      const scale = 2;
      const canvas = await html2canvas(el, { scale, useCORS:true, allowTaint:true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p','mm','a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight);
      const fileName = `${(this.firstName||'CV')}_${(this.lastName||'')}_CV.pdf`.replace(/\s+/g,'_');
      pdf.save(fileName);
    } catch (e) {
      console.error(e);
      alert('Error al exportar a PDF (ver consola).');
    }
  }

  async descargarPDF() {
    const elemento = this.formularioRef?.nativeElement;
    if (!elemento) { alert('No se encontró el formulario.'); return; }
    const canvas = await html2canvas(elemento);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('formulario.pdf');
  }

  // ------------------------
  // Utilidades
  // ------------------------
  getSession() {
    try {
      const raw = localStorage.getItem(this.AUTH_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
}
