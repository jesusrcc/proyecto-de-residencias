import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type Publication = { title: string; journal?: string; year?: string; };
type Course = { name: string; institution?: string; date?: string; };
type Milestone = { title: string; date?: string; type?: string; description?: string; };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // metadata / form fields
  title = 'frontend';
  firstName = '';
  lastName = '';
  email = '';
  orcid = '';
  bio = '';
  photoUrl = '';

  publications: Publication[] = [];
  courses: Course[] = [];
  milestones: Milestone[] = [];

  // UI state
  activeView: 'dashboard'|'form'|'cv'|'timeline'|'export' = 'dashboard';
  searchQuery = '';

  // Auth keys & session
  AUTH_USERS_KEY = 'identidad_users_v1';
  AUTH_SESSION_KEY = 'identidad_session_v1';
  session: { email: string; name: string; ts?: number } | null = null;

  // Modal auth state (no name conflicts)
  showAuth = false;
  authMode: 'login'|'register' = 'login';
  authMsg = '';

  // modal fields
  loginEmail = '';
  loginPwd = '';

  regName = '';
  regEmail = '';
  regPwd = '';
  regPwd2 = '';

  // ViewChild for CV export
  @ViewChild('cvElement', { static: false }) cvElement!: ElementRef;

  ngOnInit(): void {
    this.populateForm();
    this.updateStats();
    this.refreshAuthUI();
  }

  // ------------------------
  // Getters used by template
  // ------------------------
  get avatarInitials(): string {
    const name = this.session?.name;
    if (!name) return 'JR';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
    return parts.map(p => p[0].toUpperCase()).slice(0,2).join('') || 'JR';
  }

  get firstNameShort(): string {
    const name = this.session?.name;
    if (!name) return '';
    return name.trim().split(/\s+/)[0];
  }

  get sortedMilestones(): Milestone[] {
    if (!this.milestones) return [];
    return [...this.milestones].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  // ------------------------
  // Storage helpers
  // ------------------------
  defaultData() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      orcid: '',
      bio: '',
      photoUrl: '',
      publications: [] as Publication[],
      courses: [] as Course[],
      milestones: [] as Milestone[]
    };
  }

  loadLocal() {
    try {
      const raw = localStorage.getItem('identidad_academica');
      return raw ? JSON.parse(raw) : this.defaultData();
    } catch (e) {
      console.error('Error parsing identidad_academica', e);
      return this.defaultData();
    }
  }

  saveLocal() {
    const data = this.collectForm();
    try {
      localStorage.setItem('identidad_academica', JSON.stringify(data));
      alert('Datos guardados localmente en el navegador.');
      this.updateStats();
    } catch (e) {
      console.error('Error saving identidad_academica', e);
      alert('No se pudo guardar localmente.');
    }
  }

  // ------------------------
  // Form management
  // ------------------------
  addPublication(data?: Publication) {
    this.publications.push(data ?? { title: '', journal: '', year: '' });
  }
  removePublication(index: number) { this.publications.splice(index, 1); }

  addCourse(data?: Course) {
    this.courses.push(data ?? { name: '', institution: '', date: '' });
  }
  removeCourse(index: number) { this.courses.splice(index, 1); }

  addMilestone(data?: Milestone) {
    this.milestones.push(data ?? { title: '', date: '', type: 'otro', description: '' });
  }
  removeMilestone(index: number) { this.milestones.splice(index, 1); }

  collectForm() {
    const stored = this.loadLocal();
    return {
      ...stored,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      orcid: this.orcid.trim(),
      bio: this.bio.trim(),
      photoUrl: this.photoUrl,
      publications: this.publications.filter(p => p.title && p.title.trim() !== ''),
      courses: this.courses.filter(c => c.name && c.name.trim() !== ''),
      milestones: this.milestones.filter(m => m.title && m.date)
    };
  }

  populateForm() {
    const data = this.loadLocal();
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.orcid = data.orcid || '';
    this.bio = data.bio || '';
    this.photoUrl = data.photoUrl || '';

    this.publications = (data.publications || []).map((p: any) => ({ title: p.title || '', journal: p.journal || '', year: p.year || '' }));
    this.courses = (data.courses || []).map((c: any) => ({ name: c.name || '', institution: c.institution || '', date: c.date || '' }));
    this.milestones = (data.milestones || []).map((m: any) => ({ title: m.title || '', date: m.date || '', type: m.type || 'otro', description: m.description || '' }));

    if (this.publications.length === 0) this.addPublication();
    if (this.courses.length === 0) this.addCourse();
    if (this.milestones.length === 0) this.addMilestone();
  }

  updateStats() {
    // stats are read directly from arrays in template
  }

  resetForm() {
    if (!confirm('¿Deseas borrar todos los campos del formulario (no borra lo guardado en localStorage)?')) return;
    this.firstName = this.lastName = this.email = this.orcid = this.bio = '';
    this.publications = []; this.courses = []; this.milestones = [];
    this.addPublication(); this.addCourse(); this.addMilestone();
  }

  // ------------------------
  // Views
  // ------------------------
  showView(v: 'dashboard'|'form'|'cv'|'timeline'|'export') {
    const protectedViews: Array<'form'|'export'> = ['form','export'];
    if (protectedViews.includes(v as any) && !this.isAuthenticated()) {
      this.openAuth('login');
      alert('Inicia sesión para acceder a esta sección.');
      return;
    }
    this.activeView = v;
    if (v === 'cv') setTimeout(()=> this.updateStats(), 100);
  }

  // ------------------------
  // Export to PDF
  // ------------------------
  async exportCv() {
    this.showView('cv');
    await new Promise(r => setTimeout(r, 300));
    const el = this.cvElement?.nativeElement;
    if (!el) { alert('No se encontró el contenido del CV.'); return; }
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
      alert('Error al exportar a PDF. Abre la consola para más detalles.');
    }
  }

  // ------------------------
  // Utilities
  // ------------------------
  escapeHtml(str?: any): string {
    if (!str) return '';
    const map: { [key: string]: string } = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' };
    return String(str).replace(/[&<>"]/g, (c: string) => map[c] || c);
  }

  // ------------------------
  // AUTH helpers (localStorage)
  // ------------------------
  async sha256hex(str: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  loadUsers(): any[] {
    try {
      const raw = localStorage.getItem(this.AUTH_USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading users from localStorage', e);
      return [];
    }
  }

  saveUsers(list: any[]): void {
    try {
      localStorage.setItem(this.AUTH_USERS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving users to localStorage', e);
    }
  }

  setSession(user: { email: string; name: string }): void {
    try {
      const payload = { email: user.email, name: user.name, ts: Date.now() };
      localStorage.setItem(this.AUTH_SESSION_KEY, JSON.stringify(payload));
      this.refreshAuthUI();
    } catch (e) {
      console.error('Error setting session in localStorage', e);
    }
  }

  clearSession(): void {
    try {
      localStorage.removeItem(this.AUTH_SESSION_KEY);
      this.refreshAuthUI();
    } catch (e) {
      console.error('Error clearing session from localStorage', e);
    }
  }

  getSession(): { email: string; name: string; ts?: number } | null {
    try {
      const raw = localStorage.getItem(this.AUTH_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as { email: string; name: string; ts?: number };
    } catch (e) {
      console.error('Error reading session from localStorage', e);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  // ------------------------
  // Modal handlers (login/register in-app)
  // ------------------------
  openAuth(mode: 'login'|'register' = 'login') {
    this.authMode = mode;
    this.authMsg = '';
    this.loginEmail = this.loginPwd = '';
    this.regName = this.regEmail = this.regPwd = this.regPwd2 = '';
    this.showAuth = true;
  }

  closeAuth() {
    this.showAuth = false;
    this.authMsg = '';
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

    const users = this.loadUsers();
    if (users.find((u:any) => u.email === email)) { this.authMsg = 'Ya existe una cuenta con ese correo.'; return; }

    const hash = await this.sha256hex(pwd);
    users.push({ email, name, passwordHash: hash, created: Date.now() });
    this.saveUsers(users);

    this.setSession({ email, name });
    this.authMsg = 'Registro exitoso.';
    this.refreshAuthUI();
    setTimeout(() => this.closeAuth(), 600);
  }

  async modalLogin() {
    this.authMsg = '';
    const email = (this.loginEmail || '').trim().toLowerCase();
    const pwd = this.loginPwd || '';

    if (!email || !pwd) { this.authMsg = 'Completa correo y contraseña.'; return; }

    const users = this.loadUsers();
    const user = users.find((u:any) => u.email === email);
    if (!user) { this.authMsg = 'Usuario no encontrado.'; return; }

    const hash = await this.sha256hex(pwd);
    if (hash !== user.passwordHash) { this.authMsg = 'Contraseña incorrecta.'; return; }

    this.setSession({ email: user.email, name: user.name });
    this.authMsg = 'Inicio de sesión correcto.';
    this.refreshAuthUI();
    setTimeout(() => this.closeAuth(), 400);
  }

  // logout from UI (button)
  logoutFromUI() {
    if (!confirm('¿Cerrar sesión?')) return;
    try {
      localStorage.removeItem(this.AUTH_SESSION_KEY);
    } catch (e) { console.error(e); }
    this.refreshAuthUI();
    alert('Sesión cerrada.');
  }

  // helper handlers used elsewhere
  async handleRegister(name: string, email: string, pwd: string, pwd2: string) {
    name = name?.trim(); email = (email||'').trim().toLowerCase();
    if(!name || !email || !pwd){ alert('Completa todos los campos.'); return; }
    if(pwd.length < 6){ alert('La contraseña debe tener al menos 6 caracteres.'); return; }
    if(pwd !== pwd2){ alert('Las contraseñas no coinciden.'); return; }
    const users = this.loadUsers();
    if(users.find((u:any)=>u.email===email)){ alert('Ya existe una cuenta con ese correo.'); return; }
    const hash = await this.sha256hex(pwd);
    users.push({ email, name, passwordHash: hash, created: Date.now() });
    this.saveUsers(users);
    this.setSession({ email, name });
    alert('Registro exitoso. Ahora estás autenticado.');
  }

  async handleLogin(email: string, pwd: string) {
    email = (email||'').trim().toLowerCase();
    if(!email || !pwd){ alert('Completa correo y contraseña.'); return; }
    const users = this.loadUsers();
    const user = users.find((u:any) => u.email === email);
    if(!user){ alert('Usuario no encontrado.'); return; }
    const hash = await this.sha256hex(pwd);
    if(hash !== user.passwordHash){ alert('Contraseña incorrecta.'); return; }
    this.setSession({ email: user.email, name: user.name });
    alert('Bienvenido, ' + user.name);
  }

  handleLogout() {
    if(!this.isAuthenticated()) return;
    if(!confirm('¿Cerrar sesión?')) return;
    this.clearSession();
    alert('Sesión cerrada.');
  }

  // openAuth via prompts (kept for backward compatibility)
  openAuthPrompt(mode: 'login'|'register'='login') {
    if(mode === 'login') {
      const email = prompt('Correo:') || '';
      const pwd = prompt('Contraseña:') || '';
      this.handleLogin(email, pwd);
    } else {
      const name = prompt('Nombre completo:') || '';
      const email = prompt('Correo:') || '';
      const pwd = prompt('Contraseña: (mín 6)') || '';
      const pwd2 = prompt('Repite contraseña:') || '';
      this.handleRegister(name, email, pwd, pwd2);
    }
  }

  refreshAuthUI() {
    this.session = this.getSession();
  }

  openProfileMenu() {
    const s = this.getSession();
    if(!s) { this.openAuth('login'); return; }
    const go = confirm(`Sesión: ${s.name}\n\nAceptar: ir a Formulario para editar tu perfil.\nCancelar: mantener sesión.`);
    if(go) this.showView('form');
  }
}
