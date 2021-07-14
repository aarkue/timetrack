import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Picture } from '../models/picture';
import { PomodoroComponent } from '../pomodoro/pomodoro.component';
import { TimeTrackerComponent } from '../time-tracker/time-tracker.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

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
