import { Component, OnDestroy, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
// import { PomodoroOptionsDialogComponent } from 'src/app/dialogs/pomodoro-options-dialog/pomodoro-options-dialog.component';
import { PomodoroStatus } from './pomodoro-status';
import { PomodoroTimerData } from './pomodoro-timer-data';
import {Howl, Howler} from 'howler';

import { Plugins } from '@capacitor/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { PomodoroOptionsDialogComponent } from './pomodoro-options-dialog/pomodoro-options-dialog.component';
const { LocalNotifications, Haptics, Storage } = Plugins;
import { Platform } from '@ionic/angular';
import { timer } from 'rxjs';
@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss'],
})
export class PomodoroComponent implements OnInit, OnDestroy {
  private workSeconds = 25 * 60;
  private shortBreakSeconds = 3 * 60;
  private longBreakSeconds = 15 * 60;
  private workSessionReward = 4;

  currDuration: number = this.workSeconds;
  startDate: number = Date.now();
  interval: any;
  saveinterval: any;
  status: PomodoroStatus = PomodoroStatus.Work;
  isPaused: boolean = true;
  pomodoros: number = 1;
  showSeconds: boolean = true;
  showProgressBar: boolean = true;

  autoNext: boolean = false;
  timePassed: number = 0;

  timePassedBefore: number = 0;

  notifs = [];
  sound = undefined;
  timerHistory : PomodoroTimerData[] = [];
  constructor(
    // private snackbar: MatSnackBar,
    // private pomodoroOptionsDialog: MatDialog,
    private router:Router,
    public modalController: ModalController,
    public platform: Platform,
    public popoverController: PopoverController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadOptions().then(() => {
      this.initDefaults();
    });
   
    
    this.initSessionValues();
    this.timerHistory.unshift({startDate: null, duration: this.getCurrDuration(), type: this.getStatus(), endDate: null})
    this.timePassed = Math.min(this.timePassedBefore, this.getCurrDuration());
    this.startClock();
      this.sound = new Howl({
        src: ['/assets/notification.mp3','/assets/notification.wav']
      });
      console.log(this.sound)
      
  }
  ngOnDestroy(): void {
    if(this.interval && this.saveinterval){
      clearInterval(this.interval);
      clearInterval(this.saveinterval)
    }
  }

  async buttonClick() {
      let x = await LocalNotifications.requestPermission();
      console.log(x);
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    if (this.getIsPaused()) {
      this.setIsPaused(false);
      this.setTimePassedBefore(this.timePassed);
      this.startDate = Date.now();
      if(this.getTimePassedBefore() === 0){
      this.timerHistory[this.timerHistory.length-1].startDate = Date.now();
      }
   } else {
      this.setIsPaused(true);
    }
  }

  startClock() {
    this.interval = setInterval(() => {
      if (!this.getIsPaused()) {
        this.timePassed = Math.min(
          this.timePassedBefore + this.calcTimePassed(),
          this.getCurrDuration()
        );
        if (this.timePassed >= this.getCurrDuration()) {
          this.timeUp();
        }
      }
    }, 100);

   this.saveinterval = setInterval(() => {
      this.setTimePassedBefore(this.timePassed);
      this.startDate = Date.now();
    }, 1000);
  }

  timeUp() {
    this.setIsPaused(true);
    this.setTimePassedBefore(0);
    this.timePassed = 0;
    this.timerHistory[this.timerHistory.length-1].endDate = Date.now();
    if (this.getStatus() === PomodoroStatus.Work) {
      this.notify('Time for a break!', {});
      
      this.setStatus(PomodoroStatus.Break);
      if (this.getPomodoros() % this.workSessionReward === 0) {
        this.setCurrDuration(this.longBreakSeconds);
      } else {
        this.setCurrDuration(this.shortBreakSeconds);
      }

      this.setPomodoros(this.getPomodoros()+1);
    } else {
      this.notify('Ready to get back to work?', {});
      this.setStatus(PomodoroStatus.Work);
      this.setCurrDuration(this.workSeconds);
    }
    this.timerHistory.push({startDate: null, duration: this.getCurrDuration(), type: this.getStatus(), endDate: null})
  
    if(this.autoNext){
      this.buttonClick();
    }
  }

  async notify(title: string, options: NotificationOptions) {
    if ('Notification' in window) {
      // DISABLED: LocalNotification seems to have WebImplementation
      // try{

      //   new Notification(title, options);
      // } catch (e){
      //   console.log("Notifications constructor is not supported! "+e);
      // }
    }      
  
    
    let result = await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: "",
          id: 1,
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: null,
        }
      ]
    });
    console.log(result);
    
    if(this.platform.is("hybrid")){
      Haptics.vibrate();
    }
      this.sound.play();
    
    // this.snackbar.open(title, 'Ok', {
    //   duration: 3000,
    //   panelClass: 'success',
    // });
  }

  // Unused?
  // getCurrTotalSeconds() {
  //   if (this.getStatus() === PomodoroStatus.Break) {
  //     if (this.pomodoros % this.workSessionReward == 0) {
  //       return this.longBreakSeconds;
  //     } else {
  //       return this.shortBreakSeconds;
  //     }
  //   } else {
  //     return this.workSeconds;
  //   }
  // }

  setCurrDuration(duration: number) {
    sessionStorage.setItem('currDuration', duration.toString());
    this.currDuration = duration;
  }

  setPomodoros(pomodoros: number) {
    sessionStorage.setItem('pomodoros', pomodoros.toString());
    this.currDuration = pomodoros;
  }

  setTimePassedBefore(time: number) {
    sessionStorage.setItem('timePassedBefore', time.toString());
    this.timePassedBefore = time;
  }

  setStatus(status: PomodoroStatus) {
    sessionStorage.setItem('status', status.toString());
    this.status = status;
  }

  setIsPaused(paused: boolean) {
    sessionStorage.setItem('paused', paused + '');
    this.isPaused = paused;
  }

  getIsPaused(): boolean {
    let sessionIsPaused: string | null = sessionStorage.getItem('paused');
    if (sessionIsPaused !== null) {
      if ('true' === sessionIsPaused) {
        this.isPaused = true;
      } else {
        this.isPaused = false;
      }
    } else {
      sessionStorage.setItem('paused', this.isPaused + '');
    }
    return this.isPaused;
  }

  getStatus(): PomodoroStatus {
    let sessionStatus: string | null = sessionStorage.getItem('status');
    if (sessionStatus) {
      this.status =
        PomodoroStatus[sessionStatus as keyof typeof PomodoroStatus];
    } else {
      sessionStorage.setItem('status', this.status);
    }
    return this.status;
  }

  getCurrDuration(): number {
    let sessionCurrDuration: string | null = sessionStorage.getItem(
      'currDuration'
    );
    if (sessionCurrDuration !== null) {
      this.currDuration = parseInt(sessionCurrDuration);
    } else {
      sessionStorage.setItem('secondsLeft', this.currDuration.toString());
    }
    return this.currDuration;
  }

  getPomodoros(): number {
    let sessionPomodoros: string | null = sessionStorage.getItem(
      'pomodoros'
    );
    if (sessionPomodoros !== null) {
      this.pomodoros = parseInt(sessionPomodoros);
    } else {
      sessionStorage.setItem('pomodoros', this.pomodoros.toString());
    }
    return this.pomodoros;
  }

  getTimePassedBefore(): number {
    let sessionTimePassedBefore: string | null = sessionStorage.getItem(
      'timePassedBefore'
    );
    if (sessionTimePassedBefore !== null) {
      this.timePassedBefore = parseFloat(sessionTimePassedBefore);
    } else {
      sessionStorage.setItem(
        'timePassedBefore',
        this.timePassedBefore.toString()
      );
    }
    return this.timePassedBefore;
  }

  calcTimePassed(): number {
    return (Date.now() - this.startDate) / 1000;
  }

  clear() {
    sessionStorage.clear();
    this.initDefaults();
    this.initSessionValues();
  }

  initDefaults() {
    this.currDuration = this.workSeconds;
    this.status = PomodoroStatus.Work;
    this.isPaused = true;
    this.pomodoros = 1;

    this.timePassed = 0;

    this.timePassedBefore = 0;
  }

  initSessionValues() {
    try {
      this.getCurrDuration();
      this.timePassedBefore = this.getTimePassedBefore();
      this.getStatus();
      this.getIsPaused();
      this.getPomodoros();
      this.timerHistory[this.timerHistory.length-1] = {startDate: null, duration: this.getCurrDuration(), type: this.getStatus(), endDate: null};

    } catch (error) {
      console.log('Error getting session values for Pomodoro' + error);
    }
  }

  async showOptions() {
    const modalRef = await this.modalController.create(
      {component: PomodoroOptionsDialogComponent,
        componentProps: {
                workMinutes: this.workSeconds / 60,
                shortBreakMinutes: this.shortBreakSeconds / 60,
                longBreakMinutes: this.longBreakSeconds / 60,
                workSessionsBeforeLongBreak: this.workSessionReward,
                showSeconds: this.showSeconds,
                showProgressBar: this.showProgressBar,
                autoNext: this.autoNext},
      });
      modalRef.onWillDismiss().then((res) => {
        if(res.data){
        this.workSeconds = res.data.workMinutes * 60;
        this.shortBreakSeconds = res.data.shortBreakMinutes * 60;
        this.longBreakSeconds = res.data.longBreakMinutes * 60;
        this.workSessionReward = res.data.workSessionsBeforeLongBreak;
        this.showSeconds = res.data.showSeconds;
        this.showProgressBar = res.data.showProgressBar;
        this.autoNext = res.data.autoNext;
        this.saveOptions();
        if (this.timePassed === 0 && this.timePassedBefore === 0) {
          this.clear();
        }
      }
      })
    return await modalRef.present();

    // let dialogRef = this.pomodoroOptionsDialog.open(
    //   PomodoroOptionsDialogComponent,
    //   {
    //     data: {
    //       workDuration: this.workSeconds / 60,
    //       shortBreakDuration: this.shortBreakSeconds / 60,
    //       longBreakDuration: this.longBreakSeconds / 60,
    //       workSessionReward: this.workSessionReward,
    //       showSeconds: this.showSeconds,
    //       showProgressBar: this.showProgressBar,
    //     },
    //   }
    // );

    // dialogRef.afterClosed().subscribe(async (options: any) => {
    //   if (options) {
    //     this.shortBreakSeconds = options.shortBreakDuration * 60;
    //     this.longBreakSeconds = options.longBreakDuration * 60;
    //     this.workSeconds = options.workDuration * 60;
    //     this.workSessionReward = options.workSessionReward;
    //     this.showSeconds = options.showSeconds;
    //     this.showProgressBar = options.showProgressBar;
    //     this.saveOptions();
    //     if (this.timePassed === 0 && this.timePassedBefore === 0) {
    //       this.clear();
    //     }
    //   }
    // });
  }

  async saveToStorage(key: string, value: string){
    await Storage.set({key: key, value: value});
  }

  getFromStorage(key: string){
    return Storage.get({key: key})
  }
  async saveOptions() {
    
    try {
      this.saveToStorage(
        'shortBreakSeconds',
        this.shortBreakSeconds.toString()
      );
      this.saveToStorage(
        'longBreakSeconds',
        this.longBreakSeconds.toString()
      );
      this.saveToStorage('workSeconds', this.workSeconds.toString());
      this.saveToStorage(
        'workSessionReward',
        this.workSessionReward.toString()
      );
      this.saveToStorage('showSeconds', this.showSeconds.toString());
      this.saveToStorage('showProgressBar', this.showProgressBar.toString());
      this.saveToStorage('autoNext', this.autoNext.toString());
    } catch (error) {
      console.log('Error saving localStorage Options for Pomodoro' + error);
    }
  }

  async loadOptions() {
    try {
      this.shortBreakSeconds = parseInt(
        (await this.getFromStorage('shortBreakSeconds')).value ||
          this.shortBreakSeconds.toString()
      );
      this.longBreakSeconds = parseInt(
        (await this.getFromStorage('longBreakSeconds')).value ||
          this.longBreakSeconds.toString()
      );
      this.workSeconds = parseInt(
        (await this.getFromStorage('workSeconds')).value || this.workSeconds.toString()
      );
      this.workSessionReward = parseInt(
       ( await this.getFromStorage('workSessionReward')).value ||
          this.workSessionReward.toString()
      );

      this.showSeconds = (await this.getFromStorage('showSeconds')).value !== 'false';

      this.showProgressBar =
       ( await this.getFromStorage('showProgressBar')).value !== 'false';
       this.autoNext =
       ( await this.getFromStorage('autoNext')).value !== 'false';
    } catch (error) {
      console.log('Error loading localStorage Options for Pomodoro' + error);
    }
  }

  async showHistoryInfo(timerData: PomodoroTimerData){
    let secondDifference = 0;
    let endDateString = "-";
    let startDateString = "-"
    if(timerData.startDate && timerData.endDate){
      secondDifference = Math.floor((timerData.endDate - timerData.startDate)/(1000));
      endDateString = new Date(timerData.endDate).toLocaleTimeString();
      startDateString = new Date(timerData.startDate).toLocaleTimeString();
    }else if(timerData.startDate){
      secondDifference = Math.floor((Date.now() - timerData.startDate)/(1000));
      startDateString = new Date(timerData.startDate).toLocaleTimeString();
    }
    const alert = await this.alertController.create({
      header: "History Information",
      message: `Type: ${timerData.type.toString()}<br><br>
                Actual Duration: ${(secondDifference-(secondDifference%60))/60} min ${(secondDifference%60)} sec
                Goal Duration: ${timerData.duration/60} min<br\>
                Start Date: ${startDateString}<br\>
                End Date: ${endDateString}<br\> `,
      buttons: ['OK']
  });
  await alert.present();
  }

}
