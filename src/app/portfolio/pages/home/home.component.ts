import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  displayAnimationFlag : boolean = false;
  ngOnInit(): void {
    this.displayImage()
  }

  displayImage() {
    const screenWidth = window.innerWidth;
    if(screenWidth >= 400 ) {
      this.displayAnimationFlag = true;
    } else {
      this.displayAnimationFlag = false;
    }
  }
}
