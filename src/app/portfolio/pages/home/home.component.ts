import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit {
  displayAnimationFlag: boolean = false;
  clickTimestamps: number[] = [];
  readonly CLICK_THRESHOLD = 3; // Number of clicks needed
  readonly TIME_WINDOW = 3000; // 3 seconds in milliseconds

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.displayImage();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  displayImage() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 490) {
      this.displayAnimationFlag = true;
    } else {
      this.displayAnimationFlag = false;
    }
    if (screenWidth >= 990 && screenWidth <= 1150) {
      this.displayAnimationFlag = false;
    }
  }

  goToAdminPanel() {
    const now = Date.now();
    this.clickTimestamps.push(now);
    
    // Remove clicks that are older than 3 seconds
    this.clickTimestamps = this.clickTimestamps.filter(
      timestamp => now - timestamp <= this.TIME_WINDOW
    );

    // Check if we have enough clicks within the time window
    if (this.clickTimestamps.length >= this.CLICK_THRESHOLD) {
      this.router.navigate(['admin']);
      // Reset the timestamps after successful navigation
      this.clickTimestamps = [];
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.displayImage();
  }

  // Clean up event listener on component destruction
  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}