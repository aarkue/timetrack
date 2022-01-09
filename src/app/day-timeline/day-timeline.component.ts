import { formatDate } from '@angular/common';
import { Component, Injectable, OnInit } from '@angular/core';
import { CalendarDateFormatter, CalendarEvent, CalendarEventTimesChangedEvent, DateFormatterParams } from 'angular-calendar';
import { Activity } from '../time-tracker/activity';
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
  public activities: Activity[] = []
  public events: CalendarEvent<any>[] = [];
  public plannedEvents: CalendarEvent<any>[] = [];

  public segmentHeight: number = 20;
  constructor(public timeTrackerService: TimeTrackerService) {
    this.calculateSegmentHeight();
  }

  ngOnInit() {
    this.timeTrackerService.timeTrackUpdated.subscribe(() => {
      this.refreshEvents();
    });
    this.refreshEvents();
  }

  calculateSegmentHeight(){
    this.segmentHeight = (window.innerHeight - 200) / 25;
  }

  isToday(date: Date): boolean {
    const today: Date = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  refreshEvents() {
    this.events = [];
    this.timeTracks = this.timeTrackerService.getTimeTracksOfDate(this.date);
    this.activities = Array.from(this.timeTrackerService.activities.values());
    this.events = [];
    this.timeTracks.forEach((timeTrack) => {
      const activity = this.timeTrackerService.getActivityByID(timeTrack.activityID);
      this.events.push({
        start: new Date(timeTrack.startDate),
        title: activity.label,
        end: new Date(timeTrack.endDate),
        color: { primary: activity.color, secondary: activity.color + '70' },
        cssClass: 'timeTrackEvent',
      });
    });
    this.timeTrackerService.activities.forEach((act) => {
      if (act.startDate) {
        this.events.push({
          start: new Date(act.startDate),
          title: act.label,
          end: new Date(),
          color: { primary: act.color, secondary: act.color + 'bf' },
          cssClass: 'activityEvent',
        });
      }
    });
    this.events.push(...this.plannedEvents);
  }

  prevDay() {
    this.date.setDate(this.date.getDate() - 1);
    this.refreshEvents();
  }
  nextDay() {
    this.date.setDate(this.date.getDate() + 1);
    this.refreshEvents();
  }

  setDateFromISOString(iso: string) {
    this.date = new Date(Date.parse(iso));
    this.refreshEvents();
  }

  onResize(event) {
    this.calculateSegmentHeight();
  }

  eventDropped({
    event,
    newStart,
    newEnd,
    allDay,
  }: CalendarEventTimesChangedEvent): void {
    const indexInPlannedEvents = this.plannedEvents.indexOf(event);
    if (indexInPlannedEvents >= 0){
      event.start = newStart;
      event.end = newEnd;
      this.plannedEvents[indexInPlannedEvents] = event;
      console.log({event},'is already present in',this.plannedEvents)
    }else{
      event.start = newStart;
      event.end = newEnd;
      event.draggable = true;
      event.resizable = {beforeStart: true, afterEnd: true};
      event.actions = [{
        label: '<i class="deleteIcon" ></i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.removePlannedEvent(event);
        }
      }]
      this.plannedEvents.push(event)
      console.log(event)
    }
    this.refreshEvents();
  }

  removePlannedEvent(event: CalendarEvent){
    this.plannedEvents = this.plannedEvents.filter((e) => e !== event);
    this.refreshEvents();
  }

  externalDrop(event: CalendarEvent) {
    console.log(event)
  }

  getPlanEventFromActivity(act: Activity) : CalendarEvent {
    return {title: act.label,color: { primary: act.color, secondary: act.color + '70'}, start: new Date(),cssClass: 'plannedEvent'};
  }
}
