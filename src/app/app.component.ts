import { Component, OnInit } from '@angular/core';
import { DataService } from './data/data.service';
import { TimeTrackerService } from './time-tracker/time-tracker.service';
import { UpdateService } from './update.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  constructor(private updateService: UpdateService, private timeTrackerService : TimeTrackerService, private dataService: DataService) {
    
  }
  ngOnInit(): void {
    this.dataService.init().then(()=> {
      this.timeTrackerService.refresh();
    })
  }
}
