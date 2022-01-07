import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDateFormatter, DayTimelineComponent } from '../day-timeline/day-timeline.component';
import { CalendarDateFormatter, CalendarModule } from 'angular-calendar';
import { DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [DayTimelineComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [{
    provide: CalendarDateFormatter,
    useClass: CustomDateFormatter,
  }]
})
export class TimeplanModule { }
