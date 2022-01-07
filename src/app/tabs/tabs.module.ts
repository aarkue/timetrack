import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { PomodoroModule } from '../pomodoro/pomodoro.module';
import { TimeTrackerModule } from '../time-tracker/time-tracker.module';
import { TimeplanModule } from '../time-plan/time-plan.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    PomodoroModule,
    TimeTrackerModule,
    TimeplanModule
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
