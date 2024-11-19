import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  ngOnInit(): void {
  }


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
