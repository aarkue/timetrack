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
@NgModule({
  declarations: [TimeTrackerComponent,IconSelectorComponent,NewActivityModalComponent, ActivityButtonComponent, ActivityPopoverComponent, GroupDatePipe],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [TimeTrackerComponent]
})
export class TimeTrackerModule { }
