import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroComponent } from './pomodoro.component'
import { SvgClockComponent } from '../pomodoro/svg-clock/svg-clock.component';
import { PomodoroOptionsDialogComponent } from '../pomodoro/pomodoro-options-dialog/pomodoro-options-dialog.component';
import { TimeTrackerComponent } from '../time-tracker/time-tracker.component';
import {IconSelectorComponent } from '../icon-selector/icon-selector.component'
import { NewActivityModalComponent } from '../time-tracker/new-activity-modal/new-activity-modal.component';
import {FormsModule} from '@angular/forms'
import { IonicModule } from '@ionic/angular';
@NgModule({
  declarations: [PomodoroComponent,SvgClockComponent,PomodoroOptionsDialogComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [PomodoroComponent]
})
export class PomodoroModule { }
