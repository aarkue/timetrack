import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { TimeTrackerComponent } from '../time-tracker.component';

@Component({
  selector: 'app-time-track-page',
  templateUrl: './time-track-page.component.html',
  styleUrls: ['./time-track-page.component.scss'],
})
export class TimeTrackPageComponent implements OnInit {

  @ViewChild('timeTracker')
  private timeTracker : TimeTrackerComponent;

  constructor(public actionSheetController: ActionSheetController) {}

  async ngOnInit(){
  }



  async doRefresh(event : any){
    await this.timeTracker.refresh();
    event.target.complete();
  }

  showTrackerStatistics(){
    this.timeTracker.showStatistics();
  }
}
