import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/data/data.service';
import { TimeTrack } from '../time-track';
import { TimeTrackerService } from '../time-tracker.service';

@Component({
  selector: 'app-time-tracker-list',
  templateUrl: './time-tracker-list.component.html',
  styleUrls: ['./time-tracker-list.component.scss'],
})
export class TimeTrackerListComponent implements OnInit {

  @Input('limit')
  public limit : number | undefined;

  constructor(public timeTrackerService : TimeTrackerService, public dataService: DataService) { }

  ngOnInit() {}

  trackTimeTracked(index: number, g : {date: number, items: TimeTrack[]}){
    return g.date;
  }

  sumUpGroupUpTo(index : number){
    const maxIndex = Math.min(this.timeTrackerService.groupedTimeTracked.length-1,index);
    let sum = 0;
    for(let i = 0; i <= maxIndex; i++){
      sum += this.timeTrackerService.groupedTimeTracked[i].items.length;
    } 
    return sum;
  }


}
