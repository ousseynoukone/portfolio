import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  showScrollToTopButton = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Check the scroll position
    const yOffset = window.pageYOffset || document.documentElement.scrollTop;
    const scrollThreshold = 200; // Adjust this threshold as needed

    // Show/hide the scroll-to-top button based on the scroll position
    this.showScrollToTopButton = yOffset > scrollThreshold;
  }

  goToTop() {
    // Smooth scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
