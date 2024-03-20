import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustumCarousselComponent } from './custum-caroussel.component';

describe('CustumCarousselComponent', () => {
  let component: CustumCarousselComponent;
  let fixture: ComponentFixture<CustumCarousselComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustumCarousselComponent]
    });
    fixture = TestBed.createComponent(CustumCarousselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
