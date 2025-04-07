import { TestBed } from '@angular/core/testing';

import { SerialesService } from './seriales.service';

describe('SerialesService', () => {
  let service: SerialesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SerialesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
