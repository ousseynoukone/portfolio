import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderProjectComponent } from './order-project.component';

describe('OrderProjectComponent', () => {
  let component: OrderProjectComponent;
  let fixture: ComponentFixture<OrderProjectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderProjectComponent]
    });
    fixture = TestBed.createComponent(OrderProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
