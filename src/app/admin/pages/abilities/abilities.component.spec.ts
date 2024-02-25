import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbilitiesComponent } from './abilities.component';

describe('AbilitiesComponent', () => {
  let component: AbilitiesComponent;
  let fixture: ComponentFixture<AbilitiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbilitiesComponent]
    });
    fixture = TestBed.createComponent(AbilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
