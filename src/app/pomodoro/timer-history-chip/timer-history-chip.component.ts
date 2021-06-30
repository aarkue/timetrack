import { Component, OnInit } from '@angular/core';
import { PomodoroTimerData } from '../pomodoro-timer-data';

@Component({
  selector: 'app-timer-history-chip',
  templateUrl: './timer-history-chip.component.html',
  styleUrls: ['./timer-history-chip.component.scss'],
})
export class TimerHistoryChipComponent implements OnInit {

  public timerData : PomodoroTimerData;
  constructor() { }

  ngOnInit() {}



  public getDurationDifferenceMin(timerData : PomodoroTimerData){
    let actualSec = 0;
    let isRunning = true;
    if(timerData.startDate && timerData.endDate){
      actualSec = Math.floor((timerData.endDate - timerData.startDate)/(1000));
      isRunning = false;
    }else if(timerData.startDate){
      actualSec = Math.floor((Date.now() - timerData.startDate)/(1000));
    }

    let secDifference = (actualSec - timerData.duration);

    let minDifference = Math.trunc((secDifference)/60);

    if(minDifference < 0 && !isRunning){
      return minDifference;
    }else if(minDifference > 0){
      return "+" + minDifference;
    }else if(isRunning){
      return "";
    }else{
      return ""
    }

  }

}
