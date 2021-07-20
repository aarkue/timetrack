import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/data/data.service';
import { TimeTrack } from '../time-track';
import { TimeTrackerService } from '../time-tracker.service';

@Component({
  selector: 'app-grouped-item',
  templateUrl: './grouped-item.component.html',
  styleUrls: ['./grouped-item.component.scss'],
})
export class GroupedItemComponent implements OnInit {

  @Input('group')
  public group? : {date: number, items: TimeTrack[]}

  @Input('highlighted')
  public highlighted: boolean = false;

  constructor(public dataService:  DataService, public timeTrackerService: TimeTrackerService) { }

  ngOnInit() {}

}
