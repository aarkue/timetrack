import { formatDate } from '@angular/common';
import { Component, Injectable, OnInit } from '@angular/core';
import { CalendarDateFormatter, CalendarEvent, DateFormatterParams } from 'angular-calendar';
import { TimeTrack } from '../time-tracker/time-track';
import { TimeTrackerService } from '../time-tracker/time-tracker.service';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {
  // you can override any of the methods defined in the parent class

  public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'EEE', locale);
  }

  public monthViewTitle({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'MMM y', locale);
  }

  public weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'EEE', locale);
  }

  public dayViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale);
  }
}

@Component({
  selector: 'app-day-timeline',
  templateUrl: './day-timeline.component.html',
  styleUrls: ['./day-timeline.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class DayTimelineComponent implements OnInit {
  public date: Date = new Date();
  public timeTracks: TimeTrack[] = [];
  public events: CalendarEvent<any>[] = []

  public segmentHeight: number = 20;
  constructor(public timeTrackerService: TimeTrackerService) {
    this.segmentHeight = (window.innerHeight - 100)/34;
    console.log('segmentHeight',this.segmentHeight)
  }

  ngOnInit() {
    this.timeTrackerService.timeTrackUpdated.subscribe(() => {
      this.refreshEvents();
    });
  }


  refreshEvents(){
    this.events = []
    this.timeTracks = this.timeTrackerService.getTimeTracksOfDate(this.date);
    this.events = [];
    this.timeTracks.forEach((timeTrack) => {
      const activity = this.timeTrackerService.getActivityByID(timeTrack.activityID);
      this.events.push({
        start: new Date(timeTrack.startDate),
        title: activity.label,
        end: new Date(timeTrack.endDate),
        color: { primary: activity.color, secondary: activity.color+"70"},
        draggable: true
      })
    })
  }

  
  prevDay(){
    this.date.setDate(this.date.getDate() - 1);
    this.refreshEvents()
  }
  nextDay(){
    this.date.setDate(this.date.getDate() + 1);
    this.refreshEvents()
  }

  setDateFromISOString(iso : string){
    this.date = new Date(Date.parse(iso));
    this.refreshEvents();
  }

  onResize(event){
    this.segmentHeight = (window.innerHeight - 100)/34;
  }
}
