import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../shared/interface';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(private router: Router, private authService: AuthenticationService) {}

  ngOnInit(): void {
    const session = localStorage.getItem('identidad_session_v1');
    if (session) {
      this.user = JSON.parse(session);
    }
  }

  logout() {
    localStorage.removeItem('identidad_session_v1');
    this.router.navigate(['/login']);
  }
}
