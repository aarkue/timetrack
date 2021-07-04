import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { EditCurrentComponent } from './edit-current/edit-current.component';
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

  autoStart: boolean = true;
  autoFinish : boolean = false;

  timePassed: number = 0;

  timePassedBefore: number = 0;

  notifs = [];
  sound = undefined;
  timerHistory : PomodoroTimerData[] = [];

  isOvertime : boolean = false; 

  @ViewChild('pomodoroHistoryDiv')
  private pomodoroHistoryDiv : ElementRef<HTMLDivElement> 


  public historyExpanded : boolean = false;
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
    this.loadOptions().then(async () => {
      this.initDefaults();
      await this.retrieveCurrentState();
      setTimeout(() => {
        this.scrollHistoryIntoView();
      },100)
      this.startClock();
      this.saveCurrentState();
    });
  }

  async refresh(){
    this.loadOptions().then(async () => {
      this.initDefaults();
      await this.retrieveCurrentState();
      setTimeout(() => {
        this.scrollHistoryIntoView();
      },100)
      this.startClock();
      this.saveCurrentState();
    });
  }


  ngOnDestroy(): void {
    if(this.interval && this.saveinterval){
      clearInterval(this.interval);
      clearInterval(this.saveinterval)
    }
  }

  async buttonClick() {
    if(!this.sound){
      this.sound = new Howl({
        src: ['/assets/notification.mp3','/assets/notification.wav']
      });
    }
    await LocalNotifications.requestPermission();
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    if (this.isPaused) {
      this.setIsPaused(false);
      this.setTimePassedBefore(this.timePassed);
      this.startDate = Date.now();
      if(this.timePassedBefore === 0){
        if( this.timerHistory.length >= 2){
          this.timerHistory[this.timerHistory.length-2].endDate = Date.now();
        }
        this.timerHistory[this.timerHistory.length-1].startDate = Date.now();
      }
    } else {
      if(this.isOvertime){
        this.nextTimer();
      }else{
        this.setIsPaused(true);
      }
    }
    this.saveCurrentState();
  }

  startClock() {
    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.timePassed = this.timePassedBefore + this.calcTimePassed();
        if (this.timePassed >= this.currDuration && !this.isOvertime) {
          this.isOvertime = true;
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
    if (this.status === PomodoroStatus.Work) {
      this.notify('Time for a break!', {});
    } else {
      this.notify('Ready to get back to work?', {});
    }
   // this.timerHistory.push({startDate: null, duration: this.currDuration, type: this.status, endDate: null})
   // this.saveCurrentState();
    if(this.autoFinish){
      this.nextTimer();
    }
  }

  nextTimer(){
    this.isOvertime = false;
    this.setIsPaused(true);
    this.setTimePassedBefore(0);
    this.timePassed = 0;
    if (this.status === PomodoroStatus.Work) {
      this.setStatus(PomodoroStatus.Break);
      if (this.pomodoros % this.workSessionReward === 0) {
        this.setCurrDuration(this.longBreakSeconds);
      } else {
        this.setCurrDuration(this.shortBreakSeconds);
      }
      this.setPomodoros(this.pomodoros+1);
    } else {
      this.setStatus(PomodoroStatus.Work);
      this.setCurrDuration(this.workSeconds);
    }
    if(!this.timerHistory[this.timerHistory.length-1].startDate){
      this.timerHistory[this.timerHistory.length-1].startDate = Date.now();
    }
    if(!this.timerHistory[this.timerHistory.length-1].endDate){
      this.timerHistory[this.timerHistory.length-1].endDate = Date.now();
    }

    this.timerHistory.push({startDate: null, duration: this.currDuration, type: this.status, endDate: null})
    this.scrollHistoryIntoView();
    this.saveCurrentState();

  
    if(this.autoStart){
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
    if(this.sound){
      this.sound.play();
    }
    
    // this.snackbar.open(title, 'Ok', {
    //   duration: 3000,
    //   panelClass: 'success',
    // });
  }

  // Unused?
  // getCurrTotalSeconds() {
  //   if (this.status === PomodoroStatus.Break) {
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
    this.currDuration = duration;
    this.saveCurrentState();
  }

  setPomodoros(pomodoros: number) {
    this.pomodoros = pomodoros;
    this.saveCurrentState();
  }

  setTimePassedBefore(time: number) {
    this.timePassedBefore = time;
    this.saveCurrentState();
  }

  setStatus(status: PomodoroStatus) {
    this.status = status;
    this.saveCurrentState();
  }

  setIsPaused(paused: boolean) {
    this.isPaused = paused;
    this.saveCurrentState();
  }

  async saveCurrentState(){
    await this.saveToStorage('timePassedBefore', this.timePassedBefore.toString());
    await this.saveToStorage('status', this.status.toString());
    await this.saveToStorage('paused', this.isPaused+'');
    await this.saveToStorage('pomodoros', this.pomodoros.toString());
    await this.saveToStorage('currDuration', this.currDuration.toString());
    await this.saveToStorage('timerHistory', JSON.stringify(this.timerHistory));
    await this.saveToStorage('startDate', this.startDate.toString());
    
  }

  async retrieveCurrentState(){
    let timePassedBefore = await this.getFromStorage('timePassedBefore');
    let status = await this.getFromStorage('status');
    let isPaused =  await this.getFromStorage('paused');
    let pomodoros = await this.getFromStorage('pomodoros');
    let currDuration = await this.getFromStorage('currDuration');
    let timerHistory = await this.getFromStorage('timerHistory');
    let startDate = await this.getFromStorage('startDate');

    this.isPaused = !('false' === isPaused.value)

    let parsedPomodoros = parseInt(pomodoros.value);
    if(!isNaN(parsedPomodoros)){
      this.pomodoros = parsedPomodoros;
    }

    let parsedstartDate = parseInt(startDate.value);
    console.log(parsedstartDate);
    if(!isNaN(parsedstartDate)){
      this.startDate = parsedstartDate;
      console.log("sec since last check in", (Date.now() - parsedstartDate)/1000)
      let dif = Date.now() - parsedstartDate;
      if(!this.isPaused && (Date.now() - parsedstartDate) > 1 * 1000){
        this.isPaused = true;
        const alert = await this.alertController.create({
          header: 'Welcome back',
          message: "<p>The last timer update was <b>" + (dif - (dif%(1000*60)))/(1000*60) + "min</b> ago.<br>Do you want to count that time?</p>",
          buttons: [
            {
              text: 'No',
              handler: () => {
                this.startDate = Date.now();
                this.isPaused = false;
              }
            },
            {
              text: 'Yes',
              role: 'cancel',
              handler: () => {
                this.startDate = parsedstartDate;
                this.isPaused = false;
              }
            }
          ]
        });
        await alert.present();
      }
    }

    let parsedCurrDuration = parseInt(currDuration.value);
    if(!isNaN(parsedCurrDuration)){
      console.log(parsedCurrDuration);
      this.currDuration = parsedCurrDuration;
    }

    let parsedStatus =  PomodoroStatus[status.value as keyof typeof PomodoroStatus];
    if(parsedStatus){
      this.status = parsedStatus;
    }

    let parsedTimePassedBefore = parseFloat(timePassedBefore.value);
    if(!isNaN(parsedTimePassedBefore)){
      this.timePassedBefore = parsedTimePassedBefore;
    }

    if(timerHistory.value && timerHistory.value.length > 0){
      this.timerHistory = JSON.parse(timerHistory.value);
    }else{
      this.timerHistory = [{startDate: null, duration: this.currDuration, type: this.status, endDate: null}];
    }
  }

  async deleteHistory(){
    const alert = await this.alertController.create({
      header: 'Delete Pomodoro History',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.timerHistory.splice(0,this.timerHistory.length-1);
            this.saveCurrentState();
          }
        }
      ]
    });
    await alert.present();
  }


  calcTimePassed(): number {
    return (Date.now() - this.startDate) / 1000;
  }

  clear() {
    this.initDefaults();
    this.timerHistory[this.timerHistory.length-1].type = this.status;
    this.timerHistory[this.timerHistory.length-1].duration = this.currDuration;
    this.timerHistory[this.timerHistory.length-1].startDate = null;
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
                autoStart: this.autoStart,
                autoFinish: this.autoFinish},
      });
      modalRef.onWillDismiss().then((res) => {
        if(res.data){
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
      })
    return await modalRef.present();
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
      this.saveToStorage('autoStart', this.autoStart.toString());
      this.saveToStorage('autoFinish', this.autoFinish.toString());
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

      this.showProgressBar =( await this.getFromStorage('showProgressBar')).value !== 'false';
      this.autoStart =(( await this.getFromStorage('autoStart')).value !== 'false');
      this.autoFinish =!(( await this.getFromStorage('autoFinish')).value !== 'true');

    } catch (error) {
      console.log('Error loading localStorage Options for Pomodoro' + error);
    }
  }

  public getMinLeft(){
    return (this.currDuration - this.timePassed) / 60 -
    ((this.currDuration - this.timePassed) % 60) / 60;
  }

  public getSecLeft(){
    return (this.currDuration - this.timePassed) % 60;
  }

  toggleExpandHistory(){
    this.historyExpanded = !this.historyExpanded;
    this.scrollHistoryIntoView();
  }

  scrollHistoryIntoView() {
    setTimeout(() => {
      this.pomodoroHistoryDiv.nativeElement.scrollTop = this.pomodoroHistoryDiv.nativeElement.scrollHeight;
      this.pomodoroHistoryDiv.nativeElement.scrollLeft = this.pomodoroHistoryDiv.nativeElement.scrollWidth;
    },30)
  }

  async editCurrent(){
    let wasPaused = this.isPaused;
    this.isPaused = true;
    const modalRef = await this.modalController.create(
      {component: EditCurrentComponent,
        componentProps: {
                currDurationMin: this.currDuration / 60,
                timePassedMin: this.timePassed / 60,
                pomodoros: this.pomodoros,
                isBreak: this.status === PomodoroStatus.Break
              },
      });
      modalRef.onWillDismiss().then((res) => {
        if(res.data){
          console.log(res.data);
          this.currDuration = res.data.currDurationMin * 60;
          this.timePassedBefore = res.data.timePassedMin * 60;
          this.timePassed = this.timePassedBefore;
          this.startDate = Date.now();
          this.pomodoros = res.data.pomodoros;
          if(res.data.isBreak){
            this.status = PomodoroStatus.Break
          }else{
            this.status = PomodoroStatus.Work
          }
          let currHistoryEl = this.timerHistory[this.timerHistory.length-1];
          currHistoryEl.duration = this.currDuration;
          currHistoryEl.type = this.status;
      }
      this.isPaused = wasPaused;
      this.saveCurrentState();
      })
    return await modalRef.present();
  }
}
