import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { NewActivityModalComponent } from './new-activity-modal/new-activity-modal.component';
import { Activity } from './activity'
import { TimeTrack } from './time-track'
import { ActivityPopoverComponent } from './activity-popover/activity-popover.component';

const { Storage } = Plugins;

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent implements OnInit {

  public activities : Activity[] = [];

  public activeIndex : number = 2;

  public timeTracked : TimeTrack[] = []
  constructor(private modalController : ModalController, private popoverComponent : PopoverController, private alertController : AlertController) { }

  ngOnInit() {
    this.getFromStorage('activities').then((res) => {
      this.activities = JSON.parse(res.value);
      if(!this.activities){
        this.activities = [{label: "Study", icon:"library",color: "#454333"},{label: "Shopping",icon:'pricetag', color: "#214333"},{label: "Watch Lecture",icon:'play-circle', color: "#666333"},{label: "Read",icon:'book', color: "#932233"},{label: "House Duties", icon:'home', color: "#484373"}];
      }
    })
    this.getFromStorage('timeTracked').then((res) => {
      this.timeTracked = JSON.parse(res.value);
      if(!this.timeTracked){
        this.timeTracked = [];
      }
    })
  }

  async refresh(){
    let activities = (await this.getFromStorage('activities')).value;
    let parsedActivities = JSON.parse(activities);
    if(parsedActivities){
      this.activities = parsedActivities;
    }
    let timeTracked = (await this.getFromStorage('timeTracked')).value;
    let parsedTimeTracked = JSON.parse(timeTracked);
    if(parsedTimeTracked){
      this.timeTracked = parsedTimeTracked;
    }
  }

  async addNewActivity(){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {},
    });
    modal.onWillDismiss().then((res) => {
      if(res.data){
      this.activities.push(res.data.activity);
      this.saveDataToStorage();
    }
    })
    await modal.present()
  }

  async editActivity(activity: Activity){
    const modal = await this.modalController.create({
      component: NewActivityModalComponent,
      componentProps : {activity: activity},
    });
    modal.onWillDismiss().then((res) => {
      if(res.data){
        activity =res.data.activity;
        this.saveDataToStorage();
    }
    })
    await modal.present()
  }

  async saveToStorage(key: string, value: string){
    await Storage.set({key: key, value: value});
  }

  getFromStorage(key: string){
    return Storage.get({key: key})
  }
  saveDataToStorage(){
    this.saveToStorage('activities',JSON.stringify(this.activities));
    this.saveToStorage('timeTracked',JSON.stringify(this.timeTracked));
  }

  onActivityButtonClick(activity: Activity){
    if(activity.startDate){
      this.timeTracked.unshift({activity: activity, startDate: activity.startDate, endDate: Date.now()})
      this.saveDataToStorage();
      activity.startDate = undefined;
    }else{
      activity.startDate = Date.now();
      this.saveDataToStorage();
    }
  }

  async onActivityButtonHold(comb : {activity: Activity, event : MouseEvent}){
    let popover =  await this.popoverComponent.create({
      component: ActivityPopoverComponent,
      translucent: true,
      event: comb.event
    });

    popover.onWillDismiss().then((res) => {
      if(res.data){
        if(res.data.delete){
          let index = this.activities.indexOf(comb.activity);
          this.activities.splice(index,1);
        }else if(res.data.edit){
          this.editActivity(comb.activity);
        }
      }
      this.saveDataToStorage();
    });

    await popover.present();
  }
  
  deleteTimeTrack(index: number){
    this.timeTracked.splice(index,1);
    this.saveDataToStorage();
  }

  async editTimeTrack(index: number){
    // 2021-07-02T19:53:13.026Z vs. 2021-07-02T19:52
    let startDate = new Date(this.timeTracked[index].startDate).toISOString()//.substring(0,16)
    let endDate = new Date(this.timeTracked[index].endDate).toISOString()//.substring(0,16)
    let alert = await this.alertController.create({
      header: "Label",
      inputs: [
        { 
          name: "label",
          type: "text",
          value: this.timeTracked[index].activity.label,
        },
        { 
          name: "icon",
          type: "text",
          value: this.timeTracked[index].activity.icon,
        }
      ],
      buttons: [
        {
          text: "Save",
          handler: (data) => {
            // console.log(Date.parse(data.startDate+":00.026Z"));
            console.log(data);
            this.timeTracked[index].activity.label = data.label;
            this.timeTracked[index].activity.icon = data.icon;
            this.saveDataToStorage();
          }
        }
      ]
    });
    await alert.present();

    this.timeTracked[index].endDate += 1000;
  }

  getFormattedDuration(start: number, end: number){
    let difSec = (end-start)/1000;
    let m = (difSec-(difSec%60))/60;
    let h = (m-(m%60))/60;
    if(h > 0){
      return `${h}h ${m%60}m`;
    }else{
      return `${m%60}m`;
    }

  }


  getLocalIsoDatetime(time: number){
    // console.log(Date.parse( new Date(time).toISOString()));
    return new Date(time).toISOString();
  }

  getNumberFromIsoDatetime(iso: string){
    // console.log(Date.parse(iso));
    return Date.parse(iso);
  }
}
