import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeTrackerComponent } from './time-tracker.component';
import {FormsModule} from '@angular/forms'
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [TimeTrackerComponent,IconSelectorComponent,NewActivityModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [TimeTrackerComponent]
})
export class TimeTrackerModule { }
