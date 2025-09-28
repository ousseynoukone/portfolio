import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-custum-caroussel',
    templateUrl: './custum-caroussel.component.html',
    styleUrls: ['./custum-caroussel.component.css'],
    standalone: false
})

export class CustumCarousselComponent  {

  @Input() imgLinks : string [] = [];

  preventRedirect(event: MouseEvent) {
    event.preventDefault();
  }
}
