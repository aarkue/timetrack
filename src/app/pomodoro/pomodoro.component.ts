import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
// import { PomodoroOptionsDialogComponent } from 'src/app/dialogs/pomodoro-options-dialog/pomodoro-options-dialog.component';
import { PomodoroStatus } from './pomodoro-status';
import { PomodoroTimerData } from './pomodoro-timer-data';
import { Howl, Howler } from 'howler';

import { Plugins } from '@capacitor/core';
import {
  AlertController,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { PomodoroOptionsDialogComponent } from './pomodoro-options-dialog/pomodoro-options-dialog.component';
const { LocalNotifications, Haptics } = Plugins;
import { Platform } from '@ionic/angular';
import { EditCurrentComponent } from './edit-current/edit-current.component';
import { AccountService } from '../services/account.service';
import { DataService } from '../data/data.service';
import { OverviewDialogComponent } from './overview-dialog/overview-dialog.component';

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

  public readonly PREFS_PREFIX = "POMODORO_"

  currDuration: number = this.workSeconds;
  startDate: number;

  lastCheckedDate: number = Date.now();
  interval: any;
  saveinterval: any;
  status: PomodoroStatus = PomodoroStatus.Work;
  isPaused: boolean = true;
  pomodoros: number = 1;
  showSeconds: boolean = true;
  showProgressBar: boolean = true;

  autoStart: boolean = true;
  autoFinish: boolean = false;

  timePassed: number = 0;

  timePassedBefore: number = 0;

  notifs = [];
  sound = undefined;
  timerHistory: PomodoroTimerData[] = [];

  isOvertime: boolean = false;

  private isInitialized: boolean = false;

  @ViewChild('pomodoroHistoryDiv')
  private pomodoroHistoryDiv: ElementRef<HTMLDivElement>;

  public historyExpanded: boolean = false;
  constructor(
    // private snackbar: MatSnackBar,
    // private pomodoroOptionsDialog: MatDialog,
    private router: Router,
    public modalController: ModalController,
    public platform: Platform,
    public popoverController: PopoverController,
    private alertController: AlertController,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.refresh();

    if(this.platform.is('hybrid')){
          LocalNotifications.registerActionTypes({
            types: [{
                id: "almost-up",
                actions: [{
                  id: "pause",
                  title: "Pause"
                },
                {
                  id: "skip",
                  title: "Skip"
                }]
              }]
          });
        LocalNotifications.addListener("localNotificationActionPerformed",async (act) => {
          if(this.isInitialized){
          if(act.actionId === 'pause'){
            this.calcTimePassed();
            this.setTimePassedBefore(this.timePassed);
            this.startDate = null;
            this.cancelNotificationInAdvance();
            this.setIsPaused(true);
            await this.saveCurrentState();
          }else if(act.actionId === 'skip'){
            this.nextTimer();
          }
        }
      });
    }
  }


  

  async refresh() {
    this.dataService.init().then(() => {
      this.loadOptions().then(async () => {
        this.initDefaults();
        await this.retrieveCurrentState();
        setTimeout(() => {
          this.scrollHistoryIntoView();
        }, 100);
        this.calcTimePassed();
        this.startClock();
        this.saveCurrentState();
        this.isInitialized = true;
      });
    })
  }

  ngOnDestroy(): void {
    if (this.interval && this.saveinterval) {
      clearInterval(this.interval);
      clearInterval(this.saveinterval);
    }
  }

  async buttonClick() {
    if (!this.sound) {
      this.sound = new Howl({
        src: ['/assets/notification.mp3', '/assets/notification.wav'],
      });
    }
    await LocalNotifications.requestPermission();
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    if (this.isPaused) {
      this.setIsPaused(false);
      this.startDate = Date.now();
      this.timePassed = 0;
      if (this.timePassedBefore === 0) {
        if (this.timerHistory.length >= 2) {
          this.timerHistory[this.timerHistory.length - 2].endDate = Date.now();
        }
        if(this.timerHistory.length >= 1){
        this.timerHistory[this.timerHistory.length - 1].startDate = Date.now();
        }else{
          this.timerHistory.push({
            startDate: Date.now(),
            duration: this.currDuration,
            type: this.status,
            endDate: null,
          });
        }
      }
      this.scheduleNotificationInAdvance();
      this.calcTimePassed();
      await this.saveCurrentState();
    } else {
      this.calcTimePassed();
      this.setTimePassedBefore(this.timePassed);
      this.startDate = null;
      this.cancelNotificationInAdvance();
      if (this.isOvertime) {
        this.nextTimer();
      } else {
        this.setIsPaused(true);
      }
    }
    await this.saveCurrentState();
  }


  async scheduleNotificationInAdvance(){
    let result = await LocalNotifications.schedule({
      notifications: [
        {
          title: "Timer is almost up...",
          body: '',
          id: 2,
          sound: null,
          attachments: null,
          actionTypeId: 'almost-up',
          extra: null,
          schedule: {at: new Date(this.startDate + (this.currDuration-30)*1000 - this.timePassedBefore*1000) },
        },
      ],
    });
  }

  async cancelNotificationInAdvance(){
    let result = await LocalNotifications.getPending();
    LocalNotifications.cancel(result);
  }
  startClock() {
    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.calcTimePassed();
        if (this.getTimePassed() >= this.currDuration && !this.isOvertime) {
          if (!this.isOvertime) {
            this.isOvertime = true;
            this.timeUp();
          }
        }
      }
    }, 100);
  }

  //   async checkForTimeAway(startDate: number){
  //   let dif = (Date.now() - startDate)/1000;
  //   if(!this.isPaused && dif >= 60){
  //     this.isPaused = true;
  //     const alert = await this.alertController.create({
  //       header: 'Welcome back',
  //       message: "<p>The last timer update was <b>" + (dif - (dif%60))/60 + "min</b> ago.<br>Do you want to count that time?</p>",
  //       buttons: [
  //         {
  //           text: 'No',
  //           handler: () => {
  //             // this.startDate = Date.now();
  //             this.isPaused = false;
  //             console.log(this.timePassedBefore,"timePassedBefore")
  //             console.log(this.timePassed,"timePassed")
  //           }
  //         },
  //         {
  //           text: 'Yes',
  //           role: 'cancel',
  //           handler: () => {
  //             // this.startDate = startDate;
  //             this.isPaused = false;
  //             this.setTimePassedBefore(this.timePassedBefore + ((Date.now() - startDate) / 1000));
  //           }
  //         }
  //       ]
  //     });
  //     await alert.present();
  //     this.lastCheckedDate = Date.now();
  //   }
  // }

  timeUp() {
    if (this.status === PomodoroStatus.Work) {
      this.notify('Time for a break!', {});
    } else {
      this.notify('Ready to get back to work?', {});
    }
    if (this.autoFinish) {
      this.nextTimer();
    }
  }

  async nextTimer() {
    this.isOvertime = false;
    this.setTimePassedBefore(0);
    this.timePassed = 0;
    this.startDate = null;
    this.setIsPaused(true);
    this.cancelNotificationInAdvance();
    if (this.status === PomodoroStatus.Work) {
      this.setStatus(PomodoroStatus.Break);
      if (this.pomodoros % this.workSessionReward === 0) {
        this.setCurrDuration(this.longBreakSeconds);
      } else {
        this.setCurrDuration(this.shortBreakSeconds);
      }
      this.setPomodoros(this.pomodoros + 1);
    } else {
      this.setStatus(PomodoroStatus.Work);
      this.setCurrDuration(this.workSeconds);
    }
    if (!this.timerHistory[this.timerHistory.length - 1].startDate) {
      this.timerHistory[this.timerHistory.length - 1].startDate = Date.now();
    }
    if (!this.timerHistory[this.timerHistory.length - 1].endDate) {
      this.timerHistory[this.timerHistory.length - 1].endDate = Date.now();
    }

    this.timerHistory.push({
      startDate: null,
      duration: this.currDuration,
      type: this.status,
      endDate: null,
    });
    this.scrollHistoryIntoView();
    

    if (this.autoStart) {
      await this.buttonClick();
    }else{
      await this.saveCurrentState();
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
          body: '',
          id: 1,
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null,
          channelId: 'importa',
        },
      ],
    });

    if (this.platform.is('hybrid')) {
      Haptics.vibrate();
    }

    if (this.sound) {
      this.sound.play();
    }
  }

  setCurrDuration(duration: number) {
    this.currDuration = duration;
    // this.saveCurrentState();
  }

  setPomodoros(pomodoros: number) {
    this.pomodoros = pomodoros;
    // this.saveCurrentState();
  }

  setTimePassedBefore(time: number) {
    this.timePassedBefore = time;
    // this.saveCurrentState();
  }

  setStatus(status: PomodoroStatus) {
    this.status = status;
    // this.saveCurrentState();
  }

  setIsPaused(paused: boolean) {
    this.isPaused = paused;
    // this.saveCurrentState();
  }

  async saveCurrentState() {
    this.dataService.savePrefs({
      'POMODORO_status': this.status.toString(),
      'POMODORO_paused': this.isPaused + '',
      'POMODORO_pomodoros': this.pomodoros.toString(),
      'POMODORO_currDuration': this.currDuration.toString(),
      'POMODORO_timerHistory': JSON.stringify(this.timerHistory),
      'POMODORO_startDate': this.startDate? this.startDate.toString() : undefined,
      'POMODORO_timePassedBefore': this.timePassedBefore.toString()
    })
  }

  async retrieveCurrentState() {
    ;
    let timePassedBefore = await this.getFromPrefs('timePassedBefore');
    let status = await this.getFromPrefs('status');
    let isPaused = await this.getFromPrefs('paused');
    let pomodoros = await this.getFromPrefs('pomodoros');
    let currDuration = await this.getFromPrefs('currDuration');
    let timerHistory = await this.getFromPrefs('timerHistory');
    let startDate = await this.getFromPrefs('startDate');
    this.isPaused = !('false' === isPaused);

    let parsedPomodoros = parseInt(pomodoros);
    if (!isNaN(parsedPomodoros)) {
      this.pomodoros = parsedPomodoros;
    }

    let parsedCurrDuration = parseInt(currDuration);
    if (!isNaN(parsedCurrDuration)) {
      this.currDuration = parsedCurrDuration;
    }

    let parsedStatus =
      PomodoroStatus[status as keyof typeof PomodoroStatus];
    if (parsedStatus) {
      this.status = parsedStatus;
    }

    let parsedTimePassedBefore = parseFloat(timePassedBefore);
    if (!isNaN(parsedTimePassedBefore)) {
      this.setTimePassedBefore(parsedTimePassedBefore);
    }

    let parsedstartDate = parseInt(startDate);
    if (!isNaN(parsedstartDate)) {
      this.startDate = parsedstartDate;
      this.scheduleNotificationInAdvance();
      console.log(
        'sec since last check in',
        (Date.now() - parsedstartDate) / 1000
      );
      let dif = Date.now() - parsedstartDate;
    }

    if (timerHistory && timerHistory.length > 0) {
      this.timerHistory = JSON.parse(timerHistory);
    } else {
      this.timerHistory = [
        {
          startDate: null,
          duration: this.currDuration,
          type: this.status,
          endDate: null,
        },
      ];
    }
  }

  async deleteHistory() {
    const alert = await this.alertController.create({
      header: 'Delete Pomodoro History',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Yes',
          handler: () => {
            this.timerHistory.splice(0, this.timerHistory.length - 1);
            this.saveCurrentState();
          },
        },
      ],
    });
    await alert.present();
  }

  private calcTimePassed() {
    if (this.startDate) {
      this.timePassed =
        this.timePassedBefore + (Date.now() - this.startDate) / 1000;
    } else {
      this.timePassed = this.timePassedBefore;
    }
  }

  clear() {
    this.initDefaults();
    this.timerHistory[this.timerHistory.length - 1].type = this.status;
    this.timerHistory[this.timerHistory.length - 1].duration =
      this.currDuration;
    this.timerHistory[this.timerHistory.length - 1].startDate = null;
    this.saveCurrentState();
  }

  initDefaults() {
    this.currDuration = this.workSeconds;
    this.status = PomodoroStatus.Work;
    this.isPaused = true;
    this.pomodoros = 1;

    this.timePassed = 0;

    this.timePassedBefore = 0;
    this.isOvertime = false;
    this.startDate = null;
  }

  async showOptions() {
    const modalRef = await this.modalController.create({
      component: PomodoroOptionsDialogComponent,
      componentProps: {
        workMinutes: this.workSeconds / 60,
        shortBreakMinutes: this.shortBreakSeconds / 60,
        longBreakMinutes: this.longBreakSeconds / 60,
        workSessionsBeforeLongBreak: this.workSessionReward,
        showSeconds: this.showSeconds,
        showProgressBar: this.showProgressBar,
        autoStart: this.autoStart,
        autoFinish: this.autoFinish,
      },
    });
    modalRef.onWillDismiss().then((res) => {
      if (res.data) {
        this.workSeconds = res.data.workMinutes * 60;
        this.shortBreakSeconds = res.data.shortBreakMinutes * 60;
        this.longBreakSeconds = res.data.longBreakMinutes * 60;
        this.workSessionReward = res.data.workSessionsBeforeLongBreak;
        this.showSeconds = res.data.showSeconds;
        this.showProgressBar = res.data.showProgressBar;
        this.autoStart = res.data.autoStart;
        this.autoFinish = res.data.autoFinish;
        this.saveOptions();
        if (this.timePassed === 0 && this.timePassedBefore === 0) {
          this.clear();
        }
      }
    });
    return await modalRef.present();
  }


  async showEndOfDayDialog() {
    const modalRef = await this.modalController.create({
      component: OverviewDialogComponent,
      componentProps: {
        // workMinutes: this.workSeconds / 60,
        // shortBreakMinutes: this.shortBreakSeconds / 60,
        // longBreakMinutes: this.longBreakSeconds / 60,
        // workSessionsBeforeLongBreak: this.workSessionReward,
        // showSeconds: this.showSeconds,
        // showProgressBar: this.showProgressBar,
        // autoStart: this.autoStart,
        // autoFinish: this.autoFinish,
      },
    });
    modalRef.onWillDismiss().then((res) => {
      if (res.data) {
        this.workSeconds = res.data.workMinutes * 60;
        this.shortBreakSeconds = res.data.shortBreakMinutes * 60;
        this.longBreakSeconds = res.data.longBreakMinutes * 60;
        this.workSessionReward = res.data.workSessionsBeforeLongBreak;
        this.showSeconds = res.data.showSeconds;
        this.showProgressBar = res.data.showProgressBar;
        this.autoStart = res.data.autoStart;
        this.autoFinish = res.data.autoFinish;
        this.saveOptions();
        if (this.timePassed === 0 && this.timePassedBefore === 0) {
          this.clear();
        }
      }
    });
    return await modalRef.present();
  }

  
  getFromPrefs(key: string) {
    return this.dataService.prefs["POMODORO_"+key]
  }

  
  async saveOptions() {
    this.dataService.savePrefs({
      'POMODORO_shortBreakSeconds': this.shortBreakSeconds.toString(),
      'POMODORO_longBreakSeconds': this.longBreakSeconds.toString(),
      'POMODORO_workSeconds': this.workSeconds.toString(),
      'POMODORO_workSessionReward': this.workSessionReward.toString(),
      'POMODORO_showSeconds': this.showSeconds.toString(),
      'POMODORO_showProgressBar': this.showProgressBar.toString(),
      'POMODORO_autoStart': this.autoStart.toString(),
      'POMODORO_autoFinish': this.autoFinish.toString()

    })
  }

  async loadOptions() {
      this.shortBreakSeconds = parseInt(
        (await this.getFromPrefs('shortBreakSeconds')) ||
          this.shortBreakSeconds.toString()
      );
      this.longBreakSeconds = parseInt(
        (await this.getFromPrefs('longBreakSeconds')) ||
          this.longBreakSeconds.toString()
      );
      this.workSeconds = parseInt(
        (await this.getFromPrefs('workSeconds')) ||
          this.workSeconds.toString()
      );
      this.workSessionReward = parseInt(
        (await this.getFromPrefs('workSessionReward')) ||
          this.workSessionReward.toString()
      );

      this.showSeconds =
        (await this.getFromPrefs('showSeconds')) !== 'false';

      this.showProgressBar =
        (await this.getFromPrefs('showProgressBar')) !== 'false';
      this.autoStart =
        (await this.getFromPrefs('autoStart')) !== 'false';
      this.autoFinish = !(
        (await this.getFromPrefs('autoFinish')) !== 'true'
      );
  }

  public getMinLeft() {
    return (
      (this.currDuration - this.getTimePassed()) / 60 -
      ((this.currDuration - this.getTimePassed()) % 60) / 60
    );
  }

  public getSecLeft() {
    return (this.currDuration - this.getTimePassed()) % 60;
  }

  public getTimePassed() {
    return this.timePassed;
  }

  toggleExpandHistory() {
    this.historyExpanded = !this.historyExpanded;
    this.scrollHistoryIntoView();
  }

  scrollHistoryIntoView() {
    setTimeout(() => {
      this.pomodoroHistoryDiv.nativeElement.scrollTop =
        this.pomodoroHistoryDiv.nativeElement.scrollHeight;
      this.pomodoroHistoryDiv.nativeElement.scrollLeft =
        this.pomodoroHistoryDiv.nativeElement.scrollWidth;
    }, 30);
  }

  async editCurrent() {
    let wasPaused = this.isPaused;
    this.isPaused = true;
    const modalRef = await this.modalController.create({
      component: EditCurrentComponent,
      componentProps: {
        currDurationMin: this.currDuration / 60,
        timePassedMin: this.timePassed / 60,
        pomodoros: this.pomodoros,
        isBreak: this.status === PomodoroStatus.Break,
      },
    });
    modalRef.onWillDismiss().then((res) => {
      if (res.data) {
        this.currDuration = res.data.currDurationMin * 60;
        this.timePassedBefore = res.data.timePassedMin * 60;
        this.startDate = Date.now();
        this.scheduleNotificationInAdvance();
        this.pomodoros = res.data.pomodoros;
        if (res.data.isBreak) {
          this.status = PomodoroStatus.Break;
        } else {
          this.status = PomodoroStatus.Work;
        }
        let currHistoryEl = this.timerHistory[this.timerHistory.length - 1];
        currHistoryEl.duration = this.currDuration;
        currHistoryEl.type = this.status;
      }
      this.isPaused = wasPaused;
      this.saveCurrentState();
    });
    return await modalRef.present();
  }



  getProgessDec() {
    return this.getTimePassed() / this.currDuration;
  }
}
