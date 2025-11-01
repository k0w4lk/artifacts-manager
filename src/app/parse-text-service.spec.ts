import { TestBed } from '@angular/core/testing';

import { ParseTextService } from './parse-text-service';

describe('ParseTextService', () => {
  let service: ParseTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParseTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
