import { TestBed } from '@angular/core/testing';

import { CourseServicesService } from './course-services.service';

describe('CourseServicesService', () => {
  let service: CourseServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
