import { Component, Input, OnInit } from '@angular/core';
import { TimeTrack } from '../time-track';
import { TimeTrackerService } from '../time-tracker.service';

@Component({
  selector: 'app-time-tracker-item',
  templateUrl: './time-tracker-item.component.html',
  styleUrls: ['./time-tracker-item.component.scss'],
})
export class TimeTrackerItemComponent implements OnInit {

  @Input('timeTracked')
  public t : TimeTrack;
  constructor(public timeTrackerService : TimeTrackerService) { }

  ngOnInit() {}

}
