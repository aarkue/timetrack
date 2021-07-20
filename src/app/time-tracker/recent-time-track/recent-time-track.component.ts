import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data/data.service';
import { Activity } from '../activity';
import { TimeTrackerService } from '../time-tracker.service';

@Component({
  selector: 'app-recent-time-track',
  templateUrl: './recent-time-track.component.html',
  styleUrls: ['./recent-time-track.component.scss'],
})
export class RecentTimeTrackComponent implements OnInit {

  constructor(public timeTrackerService: TimeTrackerService, public dataService : DataService) { }

  ngOnInit() {}

  async editTimeTrack(id: string){
  }



}
