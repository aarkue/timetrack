import { Component, OnDestroy, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
// import { PomodoroOptionsDialogComponent } from 'src/app/dialogs/pomodoro-options-dialog/pomodoro-options-dialog.component';
import { PomodoroStatus } from './pomodoro-status';
// import {Howl, Howler} from 'howler';

import { Plugins } from '@capacitor/core';
import { ModalController } from '@ionic/angular';
import { PomodoroOptionsDialogComponent } from './pomodoro-options-dialog/pomodoro-options-dialog.component';
const { LocalNotifications } = Plugins;

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.css'],
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
  timePassed: number = 0;

  timePassedBefore: number = 0;

  notifs = [];
  
  // readonly sound = new Howl({
  //   src: ['/assets/notification.webm','/assets/notification.mp3']
  // });
  constructor(
    // private snackbar: MatSnackBar,
    // private pomodoroOptionsDialog: MatDialog,
    private router:Router,
    public modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadOptions();
    this.initDefaults();
    this.initSessionValues();
    this.timePassed = Math.min(this.timePassedBefore, this.getCurrDuration());
    this.startClock();
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

    // Play the sound.
    // this.sound.play();
    if (this.getStatus() === PomodoroStatus.Work) {
      this.notify('Time for a break!', {});
      
      this.setStatus(PomodoroStatus.Break);
      this.setPomodoros(this.getPomodoros()+1);

      if (this.getPomodoros() % this.workSessionReward === 0) {
        this.setCurrDuration(this.longBreakSeconds);
      } else {
        this.setCurrDuration(this.shortBreakSeconds);
      }
    } else {
      this.notify('Ready to get back to work?', {});
      this.setStatus(PomodoroStatus.Work);
      this.setCurrDuration(this.workSeconds);
    }
  }

  async notify(title: string, options: NotificationOptions) {
    if ('Notification' in window) {
      try{

        new Notification(title, options);
      } catch (e){
        console.log("Notifications constructor is not supported! "+e);
      }
    }
    let result = await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: "",
          id: 1,
          sound: 'assets/notification.mp3',
          attachments: null,
          actionTypeId: "",
          extra: null,
        }
      ]
    });
    console.log(result);

    // this.snackbar.open(title, 'Ok', {
    //   duration: 3000,
    //   panelClass: 'success',
    // });
  }

  getCurrTotalSeconds() {
    if (this.getStatus() === PomodoroStatus.Break) {
      if (this.pomodoros % this.workSessionReward == 0) {
        return this.longBreakSeconds;
      } else {
        return this.shortBreakSeconds;
      }
    } else {
      return this.workSeconds;
    }
  }

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
                showProgressBar: this.showProgressBar}
      });
      modalRef.onWillDismiss().then((res) => {
        this.workSeconds = res.data.workMinutes * 60;
        this.shortBreakSeconds = res.data.shortBreakMinutes * 60;
        this.longBreakSeconds = res.data.longBreakMinutes * 60;
        this.workSessionReward = res.data.workSessionsBeforeLongBreak;
        this.showSeconds = res.data.showSeconds;
        this.showProgressBar = res.data.showProgressBar;
        this.saveOptions();
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

  saveOptions() {
    try {
      localStorage.setItem(
        'shortBreakSeconds',
        this.shortBreakSeconds.toString()
      );
      localStorage.setItem(
        'longBreakSeconds',
        this.longBreakSeconds.toString()
      );
      localStorage.setItem('workSeconds', this.workSeconds.toString());
      localStorage.setItem(
        'workSessionReward',
        this.workSessionReward.toString()
      );
      localStorage.setItem('showSeconds', this.showSeconds.toString());
      localStorage.setItem('showProgressBar', this.showProgressBar.toString());
    } catch (error) {
      console.log('Error saving localStorage Options for Pomodoro' + error);
    }
  }

  loadOptions() {
    try {
      this.shortBreakSeconds = parseInt(
        localStorage.getItem('shortBreakSeconds') ||
          this.shortBreakSeconds.toString()
      );
      this.longBreakSeconds = parseInt(
        localStorage.getItem('longBreakSeconds') ||
          this.longBreakSeconds.toString()
      );
      this.workSeconds = parseInt(
        localStorage.getItem('workSeconds') || this.workSeconds.toString()
      );
      this.workSessionReward = parseInt(
        localStorage.getItem('workSessionReward') ||
          this.workSessionReward.toString()
      );

      this.showSeconds = localStorage.getItem('showSeconds') !== 'false';

      this.showProgressBar =
        localStorage.getItem('showProgressBar') !== 'false';
    } catch (error) {
      console.log('Error loading localStorage Options for Pomodoro' + error);
    }
  }
}
