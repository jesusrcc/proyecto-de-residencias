import { Component, OnInit } from '@angular/core';
import { User, Milestone } from 'src/app/shared/interface';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit {
  milestones: Milestone[] = [];

  ngOnInit(): void {
    const session = localStorage.getItem('identidad_session_v1');
    if (session) {
      const user: User = JSON.parse(session);
      this.milestones = (user.milestones ?? []).sort(
        (a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
      );
    }
  }

  /** Devuelve la fecha en formato legible */
  formatDate(date?: string): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toISOString().split('T')[0];
  }
}
