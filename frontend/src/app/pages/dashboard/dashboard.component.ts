import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../shared/interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {

  user: User | null = null;

  @ViewChild('carouselImage') carouselImage!: ElementRef<HTMLImageElement>;

  currentIndex = 0;
  autoplayInterval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const session = localStorage.getItem('identidad_session_v1');
    if (session) this.user = JSON.parse(session);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCarousel(), 300);
  }

  initCarousel() {
    if (!this.user?.gallery?.length) return;

    this.showImage();

    this.autoplayInterval = setInterval(() => {
      this.nextImage();
    }, 4000);
  }

  showImage() {
    const img = this.carouselImage.nativeElement;

    img.classList.remove('visible');
    setTimeout(() => {
      img.classList.add('visible');
    }, 50);
  }

  nextImage() {
    if (!this.user?.gallery) return;

    this.currentIndex = (this.currentIndex + 1) % this.user.gallery.length;
    this.showImage();
  }

  prevImage() {
    if (!this.user?.gallery) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.user.gallery.length) %
      this.user.gallery.length;
    this.showImage();
  }

  goToImage(index: number) {
    this.currentIndex = index;
    this.showImage();
  }

  logout() {
    localStorage.removeItem('identidad_session_v1');
    this.router.navigate(['/login']);
  }
}
