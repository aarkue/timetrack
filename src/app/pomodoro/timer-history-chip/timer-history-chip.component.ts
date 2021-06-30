import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonChip } from '@ionic/angular';
import { PomodoroTimerData } from '../pomodoro-timer-data';

@Component({
  selector: 'app-timer-history-chip',
  templateUrl: './timer-history-chip.component.html',
  styleUrls: ['./timer-history-chip.component.scss'],
})
export class TimerHistoryChipComponent implements OnInit {

  @Input('timerData')
  public timerData : PomodoroTimerData;
  @Input('progress')
  public progress : number = 0.2;
  @Input('showProgress')
  public showProgress : boolean = true;

  @ViewChild('chip')
  private chip : IonChip;

  public selected : boolean = false;

  constructor(private alertController : AlertController) { }

  ngOnInit() {
  }



  async showHistoryInfo(){
    this.selected = true;
    let secondDifference = 0;
    let endDateString = "-";
    let startDateString = "-"
    if(this.timerData.startDate && this.timerData.endDate){
      secondDifference = Math.floor((this.timerData.endDate - this.timerData.startDate)/(1000));
      endDateString = new Date(this.timerData.endDate).toLocaleTimeString();
      startDateString = new Date(this.timerData.startDate).toLocaleTimeString();
    }else if(this.timerData.startDate){
      secondDifference = Math.floor((Date.now() - this.timerData.startDate)/(1000));
      startDateString = new Date(this.timerData.startDate).toLocaleTimeString();
    }
    const alert = await this.alertController.create({
      header: "History Information",
      message: `Type: ${this.timerData.type.toString()}<br><br>
                Actual Duration: ${(secondDifference-(secondDifference%60))/60} m ${(secondDifference%60)} s<br\>
                Goal Duration: ${(this.timerData.duration-(this.timerData.duration%60))/60} m ${(this.timerData.duration%60)} s<br\>
                Start Date: ${startDateString}<br\>
                End Date: ${endDateString}<br\> `,
      buttons: ['OK']
  });
  alert.onDidDismiss().then(() => {
    this.selected = false;
  })
  await alert.present();
  }

  public getDurationDifferenceString(){
    let actualSec = 0;
    let isRunning = true;
    if(this.timerData.startDate && this.timerData.endDate){
      actualSec = Math.floor((this.timerData.endDate - this.timerData.startDate)/(1000));
      isRunning = false;
    }else if(this.timerData.startDate){
      actualSec = Math.floor((Date.now() - this.timerData.startDate)/(1000));
    }

    let secDifference = (actualSec - this.timerData.duration);
    let minDifference = Math.trunc((secDifference)/60);

    if(minDifference < 0 && !isRunning){
      return minDifference;
    }else if(minDifference > 0){
      return "+" + minDifference;
    }else{
      return ""
    }

  }

}
