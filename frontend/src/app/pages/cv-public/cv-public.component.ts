import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/interface';

@Component({
  selector: 'app-cv-public',
  templateUrl: './cv-public.component.html',
  styleUrls: ['./cv-public.component.css'],
})
export class CvPublicComponent implements OnInit {
  user?: User;
  loading = true;

  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.getPublicProfile(id).subscribe({
        next: (data) => {
          this.user = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
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
