import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pomodoro-options-dialog',
  templateUrl: './pomodoro-options-dialog.component.html',
  styleUrls: ['./pomodoro-options-dialog.component.scss'],
})
export class PomodoroOptionsDialogComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  @Input() workMinutes : number;
  @Input() shortBreakMinutes: number;
  @Input() longBreakMinutes: number;
  @Input() workSessionsBeforeLongBreak: number;
  @Input() showSeconds: boolean;
  @Input() showProgressBar: boolean;
  @Input() autoNext: boolean;
  public dismissModal(save : boolean = false){
    if(save){
      this.modalController.dismiss({workMinutes: this.workMinutes,
        shortBreakMinutes: this.shortBreakMinutes,
        longBreakMinutes: this.longBreakMinutes,
        workSessionsBeforeLongBreak: this.workSessionsBeforeLongBreak,
        showSeconds: this.showSeconds,
        showProgressBar: this.showProgressBar,
        autoNext: this.autoNext
      });
    }else{
      this.modalController.dismiss();
    }
  
  }
}
