import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderImagesComponent } from './order-images.component';

describe('OrderImagesComponent', () => {
  let component: OrderImagesComponent;
  let fixture: ComponentFixture<OrderImagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderImagesComponent]
    });
    fixture = TestBed.createComponent(OrderImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
