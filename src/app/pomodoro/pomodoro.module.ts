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
@NgModule({
  declarations: [
    PomodoroComponent,
    SvgClockComponent,
    PomodoroOptionsDialogComponent,
    TimerHistoryChipComponent,
    EditCurrentComponent,
    PomodoroPageComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [PomodoroPageComponent],
})
export class PomodoroModule {}
