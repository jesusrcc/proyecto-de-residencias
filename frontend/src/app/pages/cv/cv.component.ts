import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/interface';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css'],
})
export class CvComponent implements OnInit {
  user?: User;

  constructor() {}

  ngOnInit(): void {
    const session = localStorage.getItem('identidad_session_v1');
    if (session) {
      const parsed = JSON.parse(session);
      this.user = parsed;
    }
  }

  formatDate(date?: string): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toISOString().split('T')[0];
    } catch {
      return date;
    }
  }
}
