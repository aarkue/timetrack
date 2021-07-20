import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { TimeTrackerService } from 'src/app/time-tracker/time-tracker.service';
import { PomodoroComponent } from '../pomodoro.component';

@Component({
  selector: 'app-pomodoro-page',
  templateUrl: './pomodoro-page.component.html',
  styleUrls: ['./pomodoro-page.component.scss'],
})
export class PomodoroPageComponent implements OnInit {

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
