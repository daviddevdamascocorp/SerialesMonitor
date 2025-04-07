import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableMonitorComponent } from './available-monitor.component';

describe('AvailableMonitorComponent', () => {
  let component: AvailableMonitorComponent;
  let fixture: ComponentFixture<AvailableMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailableMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
