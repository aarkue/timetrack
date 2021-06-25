import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { PomodoroComponent } from '../pomodoro/pomodoro.component';
import { SvgClockComponent } from '../pomodoro/svg-clock/svg-clock.component';
import { PomodoroOptionsDialogComponent } from '../pomodoro/pomodoro-options-dialog/pomodoro-options-dialog.component';
import { TimeTrackerComponent } from '../time-tracker/time-tracker.component';
import {IconSelectorComponent } from '../icon-selector/icon-selector.component'
import { NewActivityModalComponent } from '../time-tracker/new-activity-modal/new-activity-modal.component';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule
  ],
  declarations: [Tab2Page, PomodoroComponent, SvgClockComponent,PomodoroOptionsDialogComponent, TimeTrackerComponent,NewActivityModalComponent ,IconSelectorComponent]
})
export class Tab2PageModule {}
