import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroComponent } from './pomodoro.component';
import { SvgClockComponent } from '../pomodoro/svg-clock/svg-clock.component';
import { PomodoroOptionsDialogComponent } from '../pomodoro/pomodoro-options-dialog/pomodoro-options-dialog.component';
import { EditCurrentComponent } from '../pomodoro/edit-current/edit-current.component';

import { TimerHistoryChipComponent } from './timer-history-chip/timer-history-chip.component';

import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PomodoroPageComponent } from './pomodoro-page/pomodoro-page.component';
import { TimeTrackerModule } from '../time-tracker/time-tracker.module';
import { GoalsComponent } from '../goals/goals.component';
import { OverviewDialogComponent } from './overview-dialog/overview-dialog.component';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  declarations: [
    PomodoroComponent,
    SvgClockComponent,
    PomodoroOptionsDialogComponent,
    OverviewDialogComponent,
    TimerHistoryChipComponent,
    EditCurrentComponent,
    PomodoroPageComponent,
    GoalsComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule, TimeTrackerModule],
  exports: [PomodoroPageComponent],
})
export class PomodoroModule {}
