import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  displayAnimationFlag: boolean = false;

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.displayImage();
  }
}