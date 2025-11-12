import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../shared/interface';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  user: User | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const session = localStorage.getItem('identidad_session_v1');
    if (session) {
      this.user = JSON.parse(session);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    const parts = this.user.name.split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
  }

  logout() {
    localStorage.removeItem('identidad_session_v1');
    this.router.navigate(['/login']);
  }
}
