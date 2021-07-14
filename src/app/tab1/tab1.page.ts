import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Picture } from '../models/picture';
import { PomodoroComponent } from '../pomodoro/pomodoro.component';
import { TimeTrackerComponent } from '../time-tracker/time-tracker.component';
import { TimeTrackerService } from '../time-tracker/time-tracker.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  @ViewChild('pomodoro')
  private pomdoro : PomodoroComponent;

  constructor(public actionSheetController: ActionSheetController, private timeTrackerService : TimeTrackerService) {}

  async ngOnInit(){
    
  }



  async doRefresh(event : any){
    await this.pomdoro.refresh();
    await this.timeTrackerService.refresh();
    event.target.complete();
  }

}
