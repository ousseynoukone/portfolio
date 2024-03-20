import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custum-caroussel',
  templateUrl: './custum-caroussel.component.html',
  styleUrls: ['./custum-caroussel.component.css']
})

export class CustumCarousselComponent  {

  @Input() imgLinks : string [] = [];
}
