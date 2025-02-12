import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerialesComponent } from './seriales.component';

describe('SerialesComponent', () => {
  let component: SerialesComponent;
  let fixture: ComponentFixture<SerialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SerialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SerialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
