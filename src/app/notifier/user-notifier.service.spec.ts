import { TestBed } from '@angular/core/testing';

import { UserNotifierService } from './user-notifier.service';

describe('UserNotifierService', () => {
  let service: UserNotifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserNotifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
