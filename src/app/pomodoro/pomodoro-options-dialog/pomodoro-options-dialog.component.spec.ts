import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PomodoroOptionsDialogComponent } from './pomodoro-options-dialog.component';

describe('PomodoroOptionsDialogComponent', () => {
  let component: PomodoroOptionsDialogComponent;
  let fixture: ComponentFixture<PomodoroOptionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PomodoroOptionsDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PomodoroOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
