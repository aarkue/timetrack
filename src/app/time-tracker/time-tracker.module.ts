import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeTrackerComponent } from './time-tracker.component';
import {FormsModule} from '@angular/forms'
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';
import { IonicModule } from '@ionic/angular';
import { ActivityButtonComponent } from './activity-button/activity-button.component'
import { ActivityPopoverComponent } from './activity-popover/activity-popover.component';
import { GroupDatePipe } from './group-date.pipe'
import { StatisticsModule } from './statistics/statistics.module';
import { TimeTrackerService } from './time-tracker.service';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { RecentTimeTrackComponent } from './recent-time-track/recent-time-track.component';
import { RouterModule } from '@angular/router';
import { GroupedItemComponent } from './grouped-item/grouped-item.component';
import { TimeTrackerItemComponent } from './time-tracker-item/time-tracker-item.component';
import { TimeTrackerListComponent } from './time-tracker-list/time-tracker-list.component';
import { TimeTrackPageComponent } from './time-track-page/time-track-page.component';
@NgModule({
  declarations: [TimeTrackerComponent,
                IconSelectorComponent,
                NewActivityModalComponent,
                ActivityButtonComponent,
                ActivityPopoverComponent,
                GroupDatePipe,
                ActivityListComponent,
                RecentTimeTrackComponent,
                GroupedItemComponent,
                TimeTrackerItemComponent,
                TimeTrackerListComponent,
                TimeTrackPageComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    StatisticsModule,
    RouterModule
  ],
  exports: [TimeTrackerComponent, ActivityListComponent, RecentTimeTrackComponent,TimeTrackPageComponent],
})
export class TimeTrackerModule { }
